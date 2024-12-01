---
title: Mengirim Notifikasi Melalui HTTP Request dengan ntfy.sh
categories:
  - Tools
  - Indonesia
tags:
  - ntfy
---

[ntfy.sh](https://ntfy.sh) adalah sebuah layanan notifikasi berbasis koneksi HTTP buatan Philipp C. Heckel. Dengan menggunakan layanan ini, kita dapat mengirim notifikasi apa saja ke perangkat dengan menggunakan HTTP request yaitu POST atau PUT. Adanya layanan ini memudahkan kita untuk mengirim sebuah notifikasi ataupun peringatan ke perangkat kita dimana saja dan kapan saja, seperti pada saat keadaan darurat, _security breach_, dan sebagainya.

<!--more-->

# Penggunaan

Notifikasi dikirim ke suatu alamat yang dinamakan topik. Pengguna harus berlangganan/membuat sebuah topik menggunakan aplikasi pada ponsel, web UI, atau melalui API. Sumber.

Setelah membuat topik, pengguna dapat mengirim notifikasi yang akan muncul pada perangkat yang sudah berlangganan ke sebuah topik.

Contoh menggunakan cURL:

```bash
$ curl ntfy.sh/manoe-test -X POST -d "Halo!"
{"id":"mhPWOSrOEPa6","time":1668311286,"event":"message","topic":"manoe-test","message":"Halo!"}

$ curl ntfy.sh/manoe-test -X POST \
    -H "Title: Tes Notifikasi" \
    -H "Priority: urgent" \
    -H "Tags: warning" \
    -d "Halo!"
{"id":"unEikqvUJXZm","time":1668311727,"event":"message","topic":"manoe-test","title":"Tes Notifikasi","message":"Halo!","priority":5,"tags":["warning"]}
```

Contoh notifikasi yang masuk:

![Contoh notifikasi]({{site.baseurl}}/media/1-EZmu-Fee-BIu0-Ms-Q-lg45v3w.png)

Contoh notifikasi dengan judul, tags, dan bersifat urgent:

![Contoh notifikasi dengan judul, tags, dan urgent]({{site.baseurl}}/media/1-vc-U7-UK1-Uvzh-HKZYQS3mg.png)

# Kesimpulan

ntfy.sh sangat berguna untuk mengirim pesan notifikasi secara otomatis melalui CLI ataupun melalui integrasi aplikasi, berbasis HTTP request. ntfy.sh dapat dikombinasikan dengan pekerjaan otomatis seperti backup harian, pengecekan kapasitas penyimpanan, dan lain sebagainya.
