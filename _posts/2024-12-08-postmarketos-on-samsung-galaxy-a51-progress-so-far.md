---
title: 'PostmarketOS on Samsung Galaxy A51: Progress so far...'
---
After successfully porting [postmarketOS (pmOS) on Samsung Galaxy J4](https://wiki.postmarketos.org/wiki/Samsung_Galaxy_J4_(samsung-j4lte)), I continued to my another unused device with higher specification, [Samsung Galaxy A51](https://wiki.postmarketos.org/wiki/Samsung_Galaxy_A51_(samsung-a51)).

Now, to be honest, porting pmOS onto this device is more beneficial than the last one, since it has rather newer hardware and newer downstream kernel version (Linux 4.14), making it more reliable to be used as a server. Right?

Well, not yet.

# It Boots, Finally...

After some numerous, desperate attempts trying to build pmOS for this device (heck, even getting the kernel compiled is kinda hard), I managed to boot it. With the help of [@map220v](https://github.com/map220v)'s [modified A51 Linux kernel source](https://github.com/map220v/kernel_samsung_a51-linux), which he used for postmarketOS as well some years ago, I got the required patches to fix some weird issues, mostly about DECON and framebuffer.

I also had to fix some compilation issues, which 90% of them are just warnings treated as errors. I ain't got time to fix all of 'em, so I removed all of `-Werror` during package build. It's dirty fix, yes, but [even postmarketOS recommends us doing so](https://wiki.postmarketos.org/wiki/Troubleshooting:kernel#Android_Kernel_compilation_fails_on_warnings_(not_on_errors)_(-Werror)).

![postmarketOS on Samsung Galaxy A51, with XFCE 4](https://wiki.postmarketos.org/images/thumb/e/e4/A51-xfce-basic.jpg/337px-A51-xfce-basic.jpg)

Here's the [modified kernel source used](https://github.com/manoedinata/android_kernel_samsung_a51/tree/linux/) and the [pmaports](https://gitlab.postmarketos.org/manoedinata/pmaports/-/tree/manoedinata/add-samsung-a51) (not yet submitted into official pmaports until I fixed all major issues).

# Issues

Ah yes, now comes the worst part. What could go wrong with postmarketOS on A51, though?

Well, some things do.

## 1. USB Networking

No matter what I've tried trying to bringup RNDIS interface, it's just refusing to work. Thus, I can't connect to the device through USB cable. I did make sure every required kernel configurations are enabled (ConfigFS Ether & RNDIS to sum up), using [initfs-hook](https://gitlab.postmarketos.org/postmarketOS/pmaports/-/blob/4d327313e40b48bdb9ac0c6e07f0b36cc2be4ff8/device/testing/device-samsung-dream/initfs-hook.sh) (like [samsung-dreamlte](https://wiki.postmarketos.org/wiki/Samsung_Galaxy_S8_(samsung-dreamlte)) did), and even enabling ConfigFS manually in [Debug Shell](https://wiki.postmarketos.org/wiki/Initramfs/Inspecting#Using_the_debug_shell), but no luck.

## 2. Wi-Fi

Although the required proprietary blobs are loaded and Wi-Fi did turn on, it can't connect to any available network. This assumption is based on attempt to connect to an AP through NetworkManager (on XFCE 4).

Definitely needs more investigation. I can't get the kernel log yet (I'm not gonna spend my time analyzing `dmesg` output from the phone's screen. Life's too short to do that.)

[TBA]
