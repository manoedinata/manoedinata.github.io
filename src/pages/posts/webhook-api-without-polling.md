---
layout: ../../layouts/MarkdownPostLayout.astro
title: Webhook, API Without Polling
slug: webhook-api-without-polling
description: Webhooks efficiently notify clients of server events without polling.
image: https://unsplash.com/photos/OqtafYT5kTw/download
date: 2022-12-04T21:16:00.000Z
---
A webhook is a trigger process that occurs when an event takes place. Unlike APIs that need to be checked constantly (polling), webhooks are automatic, where the server sends a request to the client (target) when an event occurs on the server side.

Here's an example: You want to always get the latest newspaper edition. If we compare this to an API, you would go to the newspaper vendor every day and ask, "Is there a new newspaper today?" How inefficient!

Webhooks are different - it's like subscribing to the newspaper vendor, requesting them to send you the latest newspaper whenever a new edition is available. The vendor then automatically sends you the newest newspaper. That's what a webhook is.

The advantage of using webhooks is, of course, the efficiency in data retrieval. The process of receiving data from the server becomes shorter and more efficient. Every event that occurs will be notified to the client.
