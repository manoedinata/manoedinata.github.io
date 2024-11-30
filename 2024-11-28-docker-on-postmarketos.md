---
title: Docker on postmarketOS
categories:
  - postmarketOS
excerpt: Running Docker on a phone?? Hell yeah!
---
After successfully [running postmarketOS on my old Samsung Galaxy J4](https://manoedinata.com/porting-postmarketos/#samsung-galaxy-j4), it's time to take it even further: **Running Docker to self-host local applications**.

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

![384658061-e76e1790-7f6a-4382-8fcb-ce1abdf49e83.png]({{site.baseurl}}/media/384658061-e76e1790-7f6a-4382-8fcb-ce1abdf49e83.png)

# Switching to iptables-legacy

Trying to manually run dockerd results in this error:

```
INFO[2024-11-10T11:34:25.208702609+07:00] unable to detect if iptables supports xlock: 'iptables --wait -L -n': `# Warning: iptables-legacy tables present, use iptables-legacy to see them
iptables v1.8.10 (nf_tables): Could not fetch rule set generation id: Invalid argument`  error="exit status 4"
```

Switching to iptables-legacy seems to fix this problem, whether permanently or temporary. To switch, link iptables-legacy to the original iptables binary.

```
sudo apk add iptables-legacy

# Rename original iptables
sudo mv /usr/sbin/iptables /usr/sbin/iptables-original
sudo mv /usr/sbin/ip6tables /usr/sbin/ip6tables-original
sudo mv /usr/sbin/arptables /usr/sbin/arptables-original
sudo mv /usr/sbin/ebtables /usr/sbin/ebtables-original

# Link iptables-legacy to iptables
sudo ln -s /usr/sbin/iptables-legacy /usr/sbin/iptables
sudo ln -s /usr/sbin/ip6tables-legacy /usr/sbin/ip6tables
sudo ln -s /usr/sbin/arptables-legacy /usr/sbin/arptables
sudo ln -s /usr/sbin/ebtables-legacy /usr/sbin/ebtables
```

# Starting Docker

```
sudo service docker start
sudo rc-update add docker default
```

# Testing

![384660205-f565a681-05fa-45fe-9902-eec4f514061b.png]({{site.baseurl}}/media/384660205-f565a681-05fa-45fe-9902-eec4f514061b.png)

![384660185-7f4de3c9-9581-4040-9820-b6c8a327b891.png]({{site.baseurl}}/media/384660185-7f4de3c9-9581-4040-9820-b6c8a327b891.png)

