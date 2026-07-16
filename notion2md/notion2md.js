const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// --- Config ---------------------------------------------------------------
const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN) {
    console.error("Missing NOTION_TOKEN environment variable. Set it before running, e.g.:");
    console.error("  NOTION_TOKEN=ntn_xxx node notion2md.js");
    process.exit(1);
}
// A page inside the "Posts" database (any page works) OR the database id.
// The script resolves the parent database / data source automatically.
// NOTION_DATABASE_ID is also accepted for compatibility with existing CI secrets.
const SEED_ID = process.env.NOTION_SEED_ID || process.env.NOTION_DATABASE_ID || "301d7b6de5f180ba98bfe42f2ceda70b";
// This script lives in <repo>/notion2md/, so by default output goes one level up.
// Override with OUTPUT_DIR (e.g. in CI) to write elsewhere.
const OUTPUT_DIR = process.env.OUTPUT_DIR
    ? path.resolve(process.env.OUTPUT_DIR)
    : path.join(__dirname, "..", "content", "blogs");

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// --- Helpers --------------------------------------------------------------
const plain = (arr) => (arr || []).map((t) => t.plain_text).join("");

function tomlString(value) {
    return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function tomlArray(values) {
    return `[${values.map((v) => tomlString(v)).join(", ")}]`;
}

function buildFrontmatter({ title, date, draft, tags, summary }) {
    const lines = ["+++"];
    lines.push(`title = ${tomlString(title)}`);
    if (date) lines.push(`date = ${tomlString(date)}`);
    lines.push(`draft = ${draft ? "true" : "false"}`);
    if (tags && tags.length) lines.push(`tags = ${tomlArray(tags)}`);
    if (summary) lines.push(`summary = ${tomlString(summary)}`);
    lines.push("+++", "");
    return lines.join("\n");
}

function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Derive a stable, filesystem-safe filename for an image. The hash is based on
// the image's binary content, so it stays the same across runs even though the
// (presigned) source URL changes every time.
function imageFileName(url, buffer, index) {
    let base = "";
    try {
        const pathname = new URL(url).pathname;
        base = path.basename(pathname);
    } catch (_) {
        /* ignore malformed url */
    }
    base = decodeURIComponent(base).split("?")[0];
    let ext = path.extname(base).toLowerCase();
    if (!/^\.(png|jpe?g|gif|webp|svg|avif|bmp|tiff?)$/.test(ext)) ext = ".png";
    let name = path.basename(base, path.extname(base)).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!name) name = `image-${index + 1}`;
    const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 8);
    return `${name}-${hash}${ext}`;
}

// Remove previously exported image files from a bundle so re-runs don't leave
// orphans behind. Leaves index.md and any non-image files untouched.
function cleanBundleImages(bundleDir) {
    if (!fs.existsSync(bundleDir)) return;
    for (const entry of fs.readdirSync(bundleDir)) {
        if (/\.(png|jpe?g|gif|webp|svg|avif|bmp|tiff?)$/i.test(entry)) {
            fs.rmSync(path.join(bundleDir, entry), { force: true });
        }
    }
}

// Download every image referenced in the markdown into `bundleDir` and rewrite
// the links to point at the local copy. Returns the rewritten markdown.
async function localizeImages(markdown, bundleDir) {
    const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
    const matches = [...markdown.matchAll(imageRegex)];
    if (!matches.length) return markdown;

    const seen = new Map(); // url -> local filename (or null if download failed)
    let result = markdown;

    for (let i = 0; i < matches.length; i++) {
        const [, alt, url] = matches[i];
        if (!seen.has(url)) {
            try {
                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const buf = Buffer.from(await resp.arrayBuffer());
                const fileName = imageFileName(url, buf, i);
                fs.writeFileSync(path.join(bundleDir, fileName), buf);
                seen.set(url, fileName);
                console.log(`      \u2193 ${fileName}`);
            } catch (err) {
                console.warn(`      ! failed to download image (${err.message}); keeping remote URL`);
                seen.set(url, null);
            }
        }
        const fileName = seen.get(url);
        if (!fileName) continue; // download failed; leave the remote URL in place
        // Replace this specific occurrence (escape regex-special chars in the URL).
        const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        result = result.replace(new RegExp(`(!\\[[^\\]]*\\]\\()${escaped}(\\))`), `$1${fileName}$2`);
    }
    return result;
}

// Resolve the data source id for the "Posts" database from a seed id.
async function resolveDataSourceId(seedId) {
    // Case 1: seed is a page -> read its parent.
    try {
        const page = await notion.pages.retrieve({ page_id: seedId });
        if (page.parent?.data_source_id) return page.parent.data_source_id;
        if (page.parent?.database_id) {
            const db = await notion.databases.retrieve({ database_id: page.parent.database_id });
            if (db.data_sources?.length) return db.data_sources[0].id;
            return page.parent.database_id;
        }
    } catch (_) {
        /* not a page, fall through */
    }
    // Case 2: seed is a database id.
    const db = await notion.databases.retrieve({ database_id: seedId });
    if (db.data_sources?.length) return db.data_sources[0].id;
    return seedId;
}

async function queryAllPages(dataSourceId) {
    const results = [];
    let cursor;
    do {
        const resp = await notion.dataSources.query({
            data_source_id: dataSourceId,
            start_cursor: cursor,
        });
        results.push(...resp.results);
        cursor = resp.has_more ? resp.next_cursor : undefined;
    } while (cursor);
    return results;
}

// --- Main -----------------------------------------------------------------
(async () => {
    const dataSourceId = await resolveDataSourceId(SEED_ID);
    console.log(`Using data source: ${dataSourceId}`);

    const pages = await queryAllPages(dataSourceId);
    console.log(`Found ${pages.length} page(s) in the table.`);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const page of pages) {
        const props = page.properties;
        const title = plain(props.Name?.title) || "Untitled";
        const slug = plain(props.Slug?.rich_text) || slugify(title);
        const summary = plain(props.Summary?.rich_text);
        const draft = props.Draft?.checkbox ?? false;
        const date = props.Date?.date?.start;
        const tags = (props.Tags?.multi_select || []).map((t) => t.name);

        const bundleDir = path.join(OUTPUT_DIR, slug);
        fs.mkdirSync(bundleDir, { recursive: true });
        cleanBundleImages(bundleDir);

        const mdBlocks = await n2m.pageToMarkdown(page.id);
        let body = n2m.toMarkdownString(mdBlocks).parent || "";
        body = await localizeImages(body, bundleDir);

        const frontmatter = buildFrontmatter({ title, date, draft, tags, summary });
        const filePath = path.join(bundleDir, "index.md");
        fs.writeFileSync(filePath, frontmatter + body.trimStart() + "\n", "utf8");

        console.log(`  \u2713 ${path.relative(__dirname, filePath)}`);
    }

    console.log("Done.");
})().catch((err) => {
    console.error("Export failed:", err.code || "", err.message);
    process.exit(1);
});