---
layout: ../../layouts/MarkdownPostLayout.astro
title: Turning Phones to Linux Systems with postmarketOS
slug: phone-as-linux-with-postmarketos
description: Using postmarketOS to re-use old phones as Linux systems.
image: https://unsplash.com/photos/MU8w72PzRow/download
date: 2024-11-16T11:24:00.000Z
---
I have two unused Samsung phones lying around, those are Samsung Galaxy J4 (2018, codenamed j4lte) and Samsung Galaxy A51 (2019, codenamed a51). For some time, I've been planning to make use of these phones. I was like, "I spent money on these, there's no way I'll let these phones be neglected in my drawer."

## The Goal

My main goal is to turn them into small home servers, which I can access anywhere in my house. Simply put, I want these phones to act as my experiment systems, as well as small servers with 24x7 uptime, plus the ability to self-host productivity applications like Stirling-PDF and Vikunja.

Sounds overwhelming? Yes, it is. But bear with me, it will be a fun side project.

## Android? Nah.

Though I could just install Android ROMs, root them with Magisk or KernelSU, and use e.g. Termux, it’s not fully efficient. Android is resource-heavy, and generally not ideal for this kind of stuff.

So… what is the most suitable OS for this?

## Say Hi to postmarketOS!

After some sort of research, I found postmarketOS project, and since then, things have changed.

postmarketOS (abbreviated as pmOS) is an operating system primarily for smartphones, based on the Alpine Linux distribution. Unlike many other projects porting conventional Linux distributions to Android phones, postmarketOS does not use the Android build system or userspace. This way, Alpine runs 100% on the phone, without virtualization, emulation, or whatever that is people use to run Linux on Android.

Also, each phone has only one unique package, and flashable installation images are generated using its installation tool called pmbootstrap.

Ain’t that cool?

## Porting

The birth of postmarketOS project is a gamechanger. PostmarketOS has a community where people, in a collaborative spirit, try to bring Linux to various devices. Thanks to this, I was able to port postmarketOS onto one of these devices. What I expected to be a full messy steps to do, was done only on 2 days, assuming that I have no prior knowledge about pmbootstrap.

## What’s Next?

Now that I got postmarketOS ported on my J4, I can proceed to setup this as a home server. The next thing I would do is to run Docker. I will discuss it further in the next post.
