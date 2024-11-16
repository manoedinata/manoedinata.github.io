---
title: "Mengenal Webhook, API Tanpa Polling"
categories:
  - Internet
  - Indonesia
tags:
  - webhook
---

_Webhook_ adalah sebuah proses _trigger_ yang terjadi ketika suatu _event_ berlaku. Tidak seperti API yang harus dicek setiap waktu (_polling_), webhook bersifat otomatis, yang mana _server_ akan mengirim _request_ ke _client_ (target) ketika suatu _event_ terjadi di sisi _server_.

<!--more-->

Contohnya seperti ini: Anda ingin selalu mendapatkan koran keluaran terbaru. Jika diibaratkan API, Anda setiap hari pergi ke penjual koran dan bertanya, _“Adakah koran yang baru keluar hari ini?”_ Sungguh tidak efisien!

Berbeda dengan _webhook_, yaitu seperti Anda berlangganan ke penjual koran, meminta untuk dikirimkan koran terbaru jika terdapat keluaran terbaru. Penjual koran pun mengirimi Anda koran terbaru secara otomatis. Itulah **webhook**.

Keuntungan dari penggunaan _webhook_ tentu saja adalah efisiensi pengambilan data. Proses penerimaan data dari _server_ yang lebih singkat dan efisien. Setiap _event_ yang terjadi, akan dikabarkan kepada _client_.
