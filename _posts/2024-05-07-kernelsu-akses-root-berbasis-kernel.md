---
title: Akses Root Berbasis Kernel Menggunakan KernelSU
categories:
  - Android
  - Indonesia
tags:
  - kernelsu
  - root
---

Sebagai _Android enthusiast_, kurang pas rasanya jika memiliki ponsel Android tanpa akses root (_root access_). Dengan segala keterbatasan yang diterapkan oleh _vendor_, akses root menjadi salah satu jalan utama untuk memodifikasi ponsel dan membuka keterbatasan tersebut.

<!-- more -->

# Nostalgia Dulu…

Terdapat beberapa metode root yang dulu pernah saya coba.

Mulai dari SuperSU yang menyediakan akses root melalui _binary_ pada file sistem. Namun karena memodifikasi file sistem secara langsung, SuperSU saat ini tergolong usang dan tidak aman.

Kemudian ada Magisk yang menerapkan konsep _systemless_. Perubahan _file_ sistem dilakukan secara transparan dan tidak menimpa _file_ asli dari sistem.

Kini, muncul satu lagi metode untuk mendapatkan akses root di perangkat Android. Metode yang mengandalkan komponen driver pada kernel Linux, yaitu [KernelSU](https://kernelsu.org).

# Apa Itu KernelSU?

KernelSU merupakan sebuah solusi mendapatkan akses root berbasis kernel. Ini artinya **akses root yang didapatkan akan berasal dari kernel**.

Apa kelebihannya? Banyak. Yang paling utama adalah akses root tidak bergantung pada [ROM](https://id.m.wikipedia.org/wiki/Memori_hanya_baca) yang digunakan. Dengan cara ini, pengguna bebas gonta-ganti ROM dan akan tetap mendapatkan akses root.

Namun, semua yang memiliki kelebihan pasti mempunyai kekurangan. KernelSU ini bukanlah sebuah pengecualian. Akses root berbasis kernel dapat dikatakan cukup berbahaya, karena Kernel merupakan inti dari sebuah sistem operasi, dan dengan mengizinkan berbagai program untuk berjalan dengan hak akses root (_superuser_)… ya begitu deh.

Tapi tenang saja, KernelSU memiliki beberapa lapis perlindungan yang tertanam di kode sumbernya, dan seluruh akses root dapat diatur melalui _manager_ nya.

# GKI Berperan Penting

Perkembangan sistem operasi Android yang begitu cepatnya membawa sebuah konsep baru dalam proses pengembangannya. Salah satunya adalah [_Generic Kernel Image_](https://source.android.com/docs/core/architecture/kernel/generic-kernel-image), biasa disingkat dengan **GKI**.

## Mengenal GKI

Konsep GKI mengizinkan berbagai perangkat Android menggunakan satu basis kernel yang dikelola pengembangannya oleh Google. DIkarenakan mayoritas perangkat membutuhkan berbagai penyesuaian (_patches_) agar dapat berjalan secara normal, _vendor_ mengintegrasikan penyesuaian tersebut melalui _loadable kernel modules_ (LKM).

![](https://static1.xdaimages.com/wordpress/wp-content/uploads/2021/09/New-GKI-apprach-to-isolate-vendor-modules-reduce-fragmentation.jpg?q=50&fit=crop&w=825&dpr=1.5)

Perangkat yang menggunakan GKI memiliki partisi tambahan yaitu **vendor_boot** dan **vendor_dlkm** (berada di partisi [_super_](https://source.android.com/docs/core/ota/dynamic_partitions)). Kedua partisi ini berisi LKM yang dibutuhkan oleh kernel untuk mengaplikasikan penyesuaian oleh _vendor_.

## GKI & KernelSU

GKI berperan penting dalam proses instalasi KernelSU. Agar lebih mudah, KernelSU menyediakan berbagai _image_ kernel siap pakai yang dapat menggantikan image bawaan. Dikarenakan konsep GKI mengizinkan penggunaan basis kernel yang sama, maka pengguna cukup mengganti _image_ kernel yang digunakan dengan _image_ yang telah ditambahkan KernelSU.

Atau, jika tidak ingin mengganti _image_ kernel yang digunakan (mungkin karena masih memiliki perubahan dari vendor), KernelSU dapat dimuat melalui LKM, mirip seperti _module_ lain yang berfungsi sebagai penyesuaian tambahan sebelumnya.

## Tapi… Kok Nggak Bisa?

Beberapa waktu sebelumnya saya coba untuk melakukan _patching_ file boot.img milik ponsel saya, Samsung Galaxy A33 5G, seperti yang dituliskan di [dokumentasi](https://kernelsu.org/guide/installation.html). Tujuannya untuk menambahkan KernelSU melalui [metode LKM](https://kernelsu.org/guide/installation.html#lkm-installation).

Namun ketika saya _flash_, ponsel tidak dapat booting dengan error DTB check fail.

## Compile Kernel dengan KernelSU

Mau tidak mau, saya harus meng-compile kernel saya sendiri untuk menambahkan KernelSU ke dalamnya. Compile berjalan cukup lancar, walaupun ada beberapa error, tapi itu wajar.

Hasilnya? _Ta-daa!_ Kernel dengan KernelSU!

![0_o3XON51xkQiWcHu_.webp]({{site.baseurl}}/media/0_o3XON51xkQiWcHu_.webp)
