---
title: Enpitsu CBT — DevOps Engineer
summary: |
  Providing a reliable server configuration and setting up Enpitsu, an online assesment software,
  so it could be accessed and updated easily.
cover:
  image: https://github.com/manoedinata/manoedinata.github.io-vuelinks/raw/053e0ed0d624159386de50473f8d96c034b238e9/public/assets/img/uploads/enpitsu_1.jpg
  alt: Enpitsu
---

# Background

Enpitsu is a web/mobile-based assesment software. Enpitsu development was initially intended
for SMAN 12 Bekasi to support the procurement of Computer-Based Test (CBT).
Enpitsu is developed to fulfill the specific test requirements, providing a way to
customize the internal mechanism of CBT.

To ensure smooth user access & neat deployment experience, an infrastructure
design and supporting services are needed for Enpitsu. Thus, Enpitsu can be
opened quickly, while facilitating the development & deployment process of
Enpitsu itself.

# Key Points

- Configuring a **Virtual Private Server (VPS)** for deployment
- Setting up **Docker** (+ Docker Compose) for container-based deployment, as well as web-based interface to manage running containers (preferrably Portainer)
- Setting up a reverse-proxy such as NGINX and SSL certificate generation for easier and more secure access to the app
- Updating Enpitsu codebase for containerization and setting up automatic Docker image build via GitHub Actions
