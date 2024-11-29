---
title: 'PostmarketOS, Turning Phones to Linux Systems'
categories:
  - postmarketOS
tags:
  - linux
excerpt: Reducing e-waste. Why not using old phones as small home servers?
---

I have two unused Samsung phones laying around, those are Samsung Galaxy J4 (2018, codenamed `j4lte`) and Samsung Galaxy A51 (2019, codenamed `a51`). For some time, I've been planning to make use of these phones. I was like, "_I spent money on these, there's no way I'll let these phones neglected in my drawer._"

# The Goal

My main goal is to turn them into small home servers, which I can access anywhere in my house. Simply put, I want these phones to act as my experiment systems, as well as small servers with 24x7 uptime, plus the ability to self-host productivity applications like [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF) and [Vikunja](https://vikunja.io/).

Sounds overwhelming? Yes, it is. But bear with me, it will be a fun side project.

# Android? Nah.

Though I could just install Android ROMs, root them with [Magisk](https://github.com/topjohnwu/Magisk) or [KernelSU](https://kernelsu.org), and use e.g. [Termux](https://termux.dev), it's not fully efficient. Android is resource-heavy, and generally not ideal for this kind of stuff.

So... what is the most suitable OS for this?

# Say Hi to postmarketOS!

After some sort of research, I found **postmarketOS** project, and since then, things have changed.

[**postmarketOS**](https://postmarketos.org/) (abbreviated as **pmOS**) is an operating system primarily for smartphones, based on the Alpine Linux distribution. Unlike many other projects porting conventional Linux distributions to Android phones, postmarketOS does not use the Android build system or userspace. This way, Alpine runs 100% on the phone, without virtualization, emulation, or whatever that is people use to run Linux on Android. Each phone has only one unique package, and flashable installation images are generated using its installation tool called `pmbootstrap`.

Ain't that cool?

# Porting

The birth of postmarketOS project is a _gamechanger_. PostmarketOS has a community where people, in a collaborative spirit, try to bring Linux to various devices. Thanks to this, I was able to port postmarketOS onto one of these devices. What I expected to be a full messy steps to do, was done only on 2 days, assuming that I have no prior knowledge about `pmbootstrap`.

## Samsung Galaxy J4

The first device I ported onto is Samsung Galaxy J4. It has Exynos 7570 SoC, brutally similar to Exynos 7870. It's safe to say that Exynos 7570 is the lower spec of Exynos 7870. Though Samsung did modify some parts, but still, they were like siblings. With that, I could use Exynos 7870 configurations as references.

Also, there's an existing port for Samsung Galaxy Xcover4 (2017, codenamed `xcover4lte`), which uses Exynos 7570. I could just copy over the `xcover4lte` device & kernel configurations, rename it to `j4lte`, adjust some values, and _voila_! Things couldn't have been more easier :D

<script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-post="SamsungGalaxyJ4/55715" data-width="100%"></script>

## Samsung Galaxy A51

What about A51? Its SoC (Exynos 9611) should be similar to Samsung Galaxy S9 (Exynos 9810), but it uses dynamic partitions, so I need some time to understand the ideal partition layout for pmOS. I could use a hand as well. Probably use someone's device configuration for it.

<script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-post="samsunga51/106183" data-width="100%"></script>

# What's Next?

Now that I got postmarketOS ported on my J4, I can proceed to setup this as a home server. The next thing I would do is to run [Docker](https://www.docker.com/). I will discuss it further in the next post.
