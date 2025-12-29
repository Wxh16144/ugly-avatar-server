# Ugly Avatar Server

[English](./README.md) | [中文](./README_zh.md)

A server for generating ugly avatars.

## Features

- **Random Generation**: Generates unique ugly avatars based on a seed (ID).
- **Multiple Formats**: Supports SVG, PNG, JPEG, WebP, AVIF, TIFF, GIF.
- **Customizable**: Adjust size and background color.
- **Caching**: Implements strong caching (ETag, Cache-Control, No-Vary-Search) for performance.
- **Error Handling**: Returns an error image instead of crashing or returning 500 text.

## Getting Started

We recommend running the server using Docker.

### Run with Docker

```bash
docker run -d -p 3000:3000 --name ugly-avatar wxh16144/ugly-avatar
```

The server will be available at `http://localhost:3000`.
Visit `http://localhost:3000/help` for usage instructions.

## API Reference

### Endpoints

#### 1. Generate Avatar (Query Parameters)

`GET /`

| Parameter | Type   | Default | Description                                      |
| :-------- | :----- | :------ | :----------------------------------------------- |
| `id`      | string | Random  | Seed for random generation.                      |
| `s`       | int    | 512     | Size in pixels (16-2048).                        |
| `bg`      | string | Random  | Background color (e.g., `red`, `#ff0000`).       |
| `f`       | string | svg     | Format: `png`, `jpeg`, `jpg`, `webp`, `avif`, `tiff`, `gif`. |

**Example:**

```txt
GET /?id=user123&s=128&f=png
```

#### 2. Generate Avatar (Path Style)

`GET /{id}.{format}`

| Parameter | Description                                      |
| :-------- | :----------------------------------------------- |
| `id`      | Seed for random generation.                      |
| `format`  | **Required**. `svg`, `png`, `jpeg`, `jpg`, `webp`, `avif`, `tiff`, `gif`. |

*Note: You can still use query parameters `s`, `bg` to customize the output.*

**Examples:**

```txt
GET /user123.png
GET /user123.svg
GET /user123.jpg?s=128&bg=red
```

#### 3. Help

`GET /help`

Returns a text file with usage instructions.

## Configuration

You can configure the server using environment variables.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port to listen on. | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins/referers. If set, requests with non-matching Origin/Referer headers will be blocked (403). | None (Allow all) |
| `ALLOW_EMPTY_REFERER` | Allow requests with no Origin/Referer when `ALLOWED_ORIGINS` is set (`true`/`false`). | `true` |
| `ENABLE_HELP` | Enable or disable the `/help` route (`true`/`false`). | `true` |
| `RATELIMIT_MAX` | Max requests per window. If set (>0), rate limiting is enabled. | `0` (Disabled) |
| `RATELIMIT_WINDOW` | Time window in milliseconds. | `60000` (1 minute) |

## Development

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Run in development mode
pnpm dev

# Build
pnpm build

# Start production server
pnpm start

# Build Docker image locally
docker build -t ugly-avatar-server .

# Run local Docker image
docker run -d -p 3000:3000 --name ugly-avatar-local ugly-avatar-server
```

## Credits

- Original implementation: [ugly-avatar](https://github.com/txstc55/ugly-avatar)
- Code reference: [next-api-share](https://github.com/mamumu123/next-api-share)

## License

[MIT](./LICENSE)
