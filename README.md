# Ugly Avatar Server

A server for generating ugly avatars.

## Features

- **Random Generation**: Generates unique ugly avatars based on a seed (ID).
- **Multiple Formats**: Supports SVG, PNG, JPEG, WebP, AVIF, TIFF, GIF.
- **Customizable**: Adjust size, background color, and opacity.
- **Caching**: Implements strong caching (ETag, Cache-Control, No-Vary-Search) for performance.
- **Error Handling**: Returns an error image instead of crashing or returning 500 text.

## Usage

### API Endpoints

#### 1. Generate Avatar (Query Parameters)

`GET /`

| Parameter | Type   | Default | Description                                      |
| :-------- | :----- | :------ | :----------------------------------------------- |
| `id`      | string | Random  | Seed for random generation.                      |
| `s`       | int    | 512     | Size in pixels (16-2048).                        |
| `bg`      | string | Random  | Background color (e.g., `red`, `#ff0000`).       |
| `o`       | float  | 1       | Opacity (0-1).                                   |
| `f`       | string | svg     | Format: `png`, `jpeg`, `jpg`, `webp`, `avif`, `tiff`, `gif`. |

**Example:**

```
GET /?id=user123&s=128&f=png
```

#### 2. Generate Avatar (Path Style)

`GET /{id}.{format}`

| Parameter | Description                                      |
| :-------- | :----------------------------------------------- |
| `id`      | Seed for random generation.                      |
| `format`  | **Required**. `svg`, `png`, `jpeg`, `jpg`, `webp`, `avif`, `tiff`, `gif`. |

*Note: You can still use query parameters `s`, `bg`, `o` to customize the output.*

**Examples:**

```txt
GET /user123.png
GET /user123.svg
GET /user123.jpg?s=128&bg=red
```

#### 3. Help

`GET /help`

Returns a text file with usage instructions.

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Start production server
pnpm start
```

## License

MIT

## How to Use

### Self-Hosted

```bash
docker run -d -p 3000:3000 wxh16144/ugly-avatar-server
```
<!-- 提示用户打开 localhost:3000/help 查看帮助 -->
Then open your browser and navigate to `http://localhost:3000/help` to see the help page.
