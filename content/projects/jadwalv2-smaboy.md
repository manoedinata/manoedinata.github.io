---
title: JadwalV2
summary: |
  Website jadwal pelajaran untuk SMAN 1 Boyolangu, dilengkapi dengan
  notifikasi pengingat melalui bot WhatsApp.
cover:
  image: https://github.com/manoedinata/manoedinata.github.io-vuelinks/raw/053e0ed0d624159386de50473f8d96c034b238e9/public/assets/img/uploads/jadwalv2-smaboy-2.jpg
  alt: Jadwalv2 Smaboy
---

# Background

Jadwal pelajaran di SMAN 1 Boyolangu untuk seluruh kelas (X, XI, dan XII)
disusun menjadi sebuah tabel yang cukup kecil dan rumit untuk dipelajari,
karena jadwal ditulis dengan nomor indeks guru.

Demi mempermudah siswa dan guru untuk melihat jadwal, muncul inisiatif untuk
mengonversi tabel yang ada menjadi sebuah website yang enak dipandang,
dilengkapi dengan fitur tambahan demi memudahkan navigasi data.

# Key Points

- Mengembangkan **aplikasi berbasis web** yang memungkinan guru dan murid untuk
  melihat jadwal sesuai kelas maupun guru
- Memasang WhatsApp Gateway yang menyediakan API untuk berinteraksi dengan
  sebuah akun WhatsApp (dalam kasus ini adalah bot)
- Menyediakan akses bagi admin dan pengembang untuk **mengubah jadwal**
  dengan CRUD (Create, Read, Access, Delete)
- Mengonfigurasi **Virtual Private Server (VPS)** untuk _deployment_
- Melakukan _containerization_ dengan Docker untuk mempermudah pengembangan
  dan pembaruan aplikasi
- Memantau dan memelihara seluruh aspek dari aplikasi
