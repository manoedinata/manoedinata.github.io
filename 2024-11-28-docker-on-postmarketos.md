---
title: Docker on postmarketOS
categories:
  - postmarketOS
---
After successfully [running postmarketOS on my old Samsung Galaxy J4](https://manoedinata.com/porting-postmarketos/), it's time to take it further: **Running Docker to self-host local applications**.

Since postmarketOS runs Alpine Linux natively, there's no need to run VMs, chroot, or whatever it is. Just native. Ain't that cool?

# Device

I have [Samsung Galaxy J4](https://wiki.postmarketos.org/wiki/Samsung_Galaxy_J4_(samsung-j4lte)) (newly ported), with downstream kernel 3.18. To get Docker working on it, I have to apply some changes:

* Enable some kernel features (mostly needed by other devices)
* Enabling cgroup mounts through OpenRC
* Switching from iptables to iptables-legacy

Let's break 'em down!

# Enabling Required Kernel Features

TBA.

# Installing Docker

This should be straightforward.

```bash
sudo apk add docker docker-compose
sudo addgroup $USER docker
```

# Enabling cgroup Mounts

It seems like cgroupv2 isn't supported in my device. Dunno why, it's just not appearing on `/sys/fs/cgroup`.

As a workaround, switch OpenRC cgroup mounts to hybrid mode, where both cgroups version 1 and 2 will be mounted on `/sys/fs/cgroup`.

Open `/etc/rc.conf`, search for `rc_group_mode`, then set it to either `hybrid` or `legacy`.

```
# This sets the mode used to mount cgroups.
# "hybrid" mounts cgroups version 2 on /sys/fs/cgroup/unified and
# cgroups version 1 on /sys/fs/cgroup.
# "legacy" mounts cgroups version 1 on /sys/fs/cgroup
# "unified" mounts cgroups version 2 on /sys/fs/cgroup
rc_cgroup_mode="hybrid"
```

> WIP. Gist: <https://gist.github.com/manoedinata/d93549d85acbee94f37683fa6cbd626e>
