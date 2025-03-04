---
layout: ../../layouts/MarkdownPostLayout.astro
title: Sending Notifications via HTTP Requests with Ntfy.sh
slug: sending-notifications-via-ntfy
description: ntfy.sh allows sending notifications via HTTP requests easily.
image: https://unsplash.com/photos/o6elTKWZ5bI/download
date: 2022-11-13T21:19:00.000Z
---
[ntfy.sh](https://ntfy.sh) is an HTTP-based notification service created by Philipp C. Heckel. Using this service, we can send any notifications to devices using HTTP requests, specifically POST or PUT. This service makes it easy for us to send notifications or alerts to our devices anywhere and anytime, such as during emergencies, security breaches, and so on.

## Usage

Notifications are sent to an address called a topic. Users must subscribe to/create a topic using the mobile app, web UI, or through the API.

After creating a topic, users can send notifications that will appear on devices that are subscribed to that topic.

Example using cURL:

```shell
$ curl ntfy.sh/manoe-test -X POST -d "Halo!"
{"id":"mhPWOSrOEPa6","time":1668311286,"event":"message","topic":"manoe-test","message":"Halo!"}

$ curl ntfy.sh/manoe-test -X POST \
    -H "Title: Tes Notifikasi" \
    -H "Priority: urgent" \
    -H "Tags: warning" \
    -d "Halo!"
{"id":"unEikqvUJXZm","time":1668311727,"event":"message","topic":"manoe-test","title":"Tes Notifikasi","message":"Halo!","priority":5,"tags":["warning"]}
```

## Conclusion

ntfy.sh is very useful for sending automated notifications through CLI or application integration, based on HTTP requests. ntfy.sh can be combined with automated tasks such as daily backups, storage capacity monitoring, and more.
