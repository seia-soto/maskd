# Seia-Soto/maskd

The Node.JS based API server that provides data of nCov-19 of South Korea from the spread sources.

> The API documentation can be contain Korean to improve the readability.

## Table of Contents

- [Environment](#environment)
  - [Installation](#installation)
  - [Development](#development)
- [Scripts](#scripts)
- [Documentation](#documentation)
  - [Entrypoint](#entrypoint)
  - [Ratelimit](#ratelimit)
  - [Limitations](#limitations)
  - [Routes](#routes)

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

# Documentation

## Entrypoint

The entrypoint of this API is following format: `api-v{version}.maskd.seia.io`

| version | entrypoint |
| :------------- | :------------- |
| v0 | api-v0.maskd.seia.io |

## Ratelimit

This API adopted following rate-limiting policy: `8r/s up to 32 burst requests per IP address`

## Limitations

- Request
  - This API doesn't support `multipart` form data.

## Routes

### POST: /clinics/selection

Get the list of available selection clinics.

#### Request form

- `scope`: The key name of values such as `identify`, `city`, ... (default: `clinicName`)
- `keyword`: The string need to be used to search items. If you don't send this parameter, the all items will be printed. (default: `none`)

#### Response format

```json
[
  {
    "identify": 2,
    "samplingAvailable": 1,
    "province": "서울",
    "city": "강남구",
    "clinicName": "삼성서울병원",
    "address": "서울특별시 강남구 일원로 81 (일원동, 삼성의료원)",
    "representativeContact": "02-3410-2114"
  }
]
```

### POST: /clinics/safelySeparated

Get the list of available safely separated clinics.

#### Request form

- `scope`: The key name of values such as `identify`, `city`, ... (default: `clinicName`)
- `keyword`: The string need to be used to search items. If you don't send this parameter, the all items will be printed. (default: `none`)

#### Response format

```json
[
  {
    "identify": 1,
    "province": "서울",
    "city": "강남구",
    "clinicName": "연세대학교강남세브란스병원",
    "address": "서울특별시 강남구 언주로211",
    "requestType": "외래진료 및 입원",
    "representativeContact": "02-2019-2114",
    "availableAt": "2020-02-28T00:00:00.000Z"
  }
]
```

### POST: /masks/stores

Get the list of available stores that sell masks.

#### Request form

- `scope`: The key name of values such as `identify`, `city`, ... (default: `clinicName`)
- `keyword`: The string need to be used to search items. This value should be 2 words at least. (default: `none`)

```json
[
  {
    "identify": 12808776,
    "address": "서울특별시 중구 다산로 72 1층 (신당동, 서울시니어스타워)",
    "latitude": 38,
    "longitude": 127,
    "name": "서울시니어스약국",
    "type": 1,
    "stockReplenishedAt": "2020-03-15T08:54:00.000Z",
    "stockStatus": "plenty",
    "stockUpdatedAt": "2020-03-15T12:30:00.000Z",
    "updatedAt": null
  }
]
```
