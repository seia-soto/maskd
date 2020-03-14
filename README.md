# Seia-Soto/maskd

The Node.JS based API server that provides data of nCov-19 of South Korea from the spread sources.

## Table of Contents

- [Environment](#environment)
  - [Installation](#installation)
  - [Development](#development)
- [Scripts](#scripts)

----

# Environment

The development of this project requires following software:

- gcc compiler*
- Node.JS v10 or higher

## Installation

> For `production` deployments, using Nginx reverse proxy with PM2 is highly recommended for both performance and security.

Download the stable release of this project and install dependencies via Yarn.

## Development

> To make workspace clean, I use `SQLite3` instead of `MySQL`.
> If you want to use `SQLite`, you need to prepare the gcc compiler on your server.

Download the version you want to develop and install dependencies via Yarn.

# Scripts

## start

Start the server with minimal logging policy.

```
cross-env DEBUG=maskd* node .
```

## debug

Start the server with full logging policy.

```
cross-env DEBUG=* node .
```
