---
# Required
title: Hello, world
date: 2026-11-12          # YYYY-MM-DD; sorts the list and labels the year
# Optional
description: A sample post showing every element the layout styles.
emoji: 👋                 # default 📝
hue: blue                 # any hue from src/data.js → HUES (default blue)
tags: [meta, sample]
draft: true               # shows in `npm run dev` only; left out of the build
---

This is a sample post. It is a **draft**, so it only shows up while running `npm run dev`. Delete it or set `draft: false` once you have something real.

Posts are Markdown files in `src/posts/`. The file name is the URL: `hello-world.md` becomes [/writings/hello-world/](/writings/hello-world/).

## Text

Regular paragraphs, *emphasis*, **strong**, `inline code` and [links](https://example.com). Links pick up the post's hue.

> Blockquotes sit in a flat zinc band, like the footer.
> No borders, no rounded corners.

## Lists

- Square markers, tinted with the post's hue
- Nested lists work too
  - like this
- Last item

1. Ordered lists
2. Use plain numbers

## Code

```sh
npm run dev
```

```js
export const hello = (name) => `Hello, ${name}!`
```

### A smaller heading

Level 2 and 3 headings show up in the "On this page" box on the left.

## Tables

| Device     | Kernel | Status  |
| ---------- | ------ | ------- |
| Phone A    | 6.12   | boots   |
| Phone B    | 6.6    | partial |

---

That's it.
