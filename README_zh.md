# Ugly Avatar Server

[English](./README.md) | [中文](./README_zh.md)

一个用于生成丑陋头像的服务。

## 特性

- **随机生成**: 基于种子（ID）生成唯一的丑陋头像。
- **多种格式**: 支持 SVG, PNG, JPEG, WebP, AVIF, TIFF, GIF。
- **可定制**: 调整大小和背景颜色。
- **缓存**: 实现强缓存（ETag, Cache-Control, No-Vary-Search）以提高性能。
- **错误处理**: 返回错误图片而不是崩溃或返回 500 文本。
- **Web 界面**: 内置画廊用于浏览、定制和下载头像。

## 快速开始

我们推荐使用 Docker 运行服务。

### 使用 Docker 运行

```bash
docker run -d -p 3000:3000 -p 3002:3002 --name ugly-avatar wxh16144/ugly-avatar
```

服务将在 `http://localhost:3000` 上可用。
Web 界面将在 `http://localhost:3002` 上可用。
访问 `http://localhost:3000/help` 查看使用说明。

## API 参考

### 端点

#### 1. 生成头像（查询参数）

`GET /`

| 参数 | 类型 | 默认值 | 描述 |
| :--- | :--- | :----- | :--- |
| `id` | string | 随机 | 随机生成的种子。 |
| `s` | int | 512 | 像素大小 (16-2048)。 |
| `bg` | string | 随机 | 背景颜色 (例如 `red`, `#ff0000`)。 |
| `f` | string | svg | 格式: `png`, `jpeg`, `jpg`, `webp`, `avif`, `tiff`, `gif`。 |

**示例:**

```txt
GET /?id=user123&s=128&f=png
```

#### 2. 生成头像（路径风格）

`GET /{id}.{format}`

| 参数 | 描述 |
| :--- | :--- |
| `id` | 随机生成的种子。 |
| `format` | **必填**。`svg`, `png`, `jpeg`, `jpg`, `webp`, `avif`, `tiff`, `gif`。 |

*注意：你仍然可以使用查询参数 `s`, `bg` 来定制输出。*

**示例:**

```txt
GET /user123.png
GET /user123.svg
GET /user123.jpg?s=128&bg=red
```

#### 3. 帮助

`GET /help`

返回包含使用说明的文本文件。

## 配置

你可以通过环境变量配置服务器。

| 变量 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `PORT` | 监听端口。 | `3000` |
| `ALLOWED_ORIGINS` | 允许的 Origin/Referer 列表（逗号分隔）。如果设置，不匹配 Origin/Referer 头部的请求将被阻止 (403)。 | 无 (允许所有) |
| `ALLOW_EMPTY_REFERER` | 当设置了 `ALLOWED_ORIGINS` 时，是否允许没有 Origin/Referer 的请求 (`true`/`false`)。 | `true` |
| `ENABLE_HELP` | 启用或禁用 `/help` 路由 (`true`/`false`)。 | `true` |
| `RATELIMIT_MAX` | 每个窗口的最大请求数。如果设置 (>0)，则启用限流。 | `0` (禁用) |
| `RATELIMIT_WINDOW` | 时间窗口（毫秒）。 | `60000` (1 分钟) |
| `TRUST_PROXY` | 如果在反向代理（Nginx, Cloudflare）后运行，设置为 `true`。**限流功能生效所必需。** | `false` |
| `AVATAR_SALT` | 附加到种子（ID）后的字符串，用于改变生成结果。用于让你的实例生成的头像独一无二。 | 空字符串 |
| `WEB_PORT` | Web 界面的端口。 | `3002` |
| `API_BASE_URL` | Web 界面使用的 API 服务器基础 URL。如果你在 Docker 中使用了自定义域名或端口映射，请设置此项。 | `http://localhost:3000` |

> **重要提示**: 如果你部署在反向代理（如 Nginx, Cloudflare 或大多数 Docker/Kubernetes 环境）之后，你**必须**设置 `TRUST_PROXY=true`。否则，限流功能将封禁代理服务器的 IP，导致所有用户受影响。

## 开发

```bash
# 安装依赖
pnpm install

# 复制环境变量文件
cp .env.example .env

# 运行服务端开发模式
pnpm dev

# 运行 Web 客户端开发模式
pnpm web

# 构建
pnpm build

# 启动生产服务器
pnpm start

# 本地构建 Docker 镜像
docker build -t ugly-avatar-server .

# 运行本地 Docker 镜像
docker run -d -p 3000:3000 -p 3002:3002 --name ugly-avatar-local ugly-avatar-server
```

## 致谢

- 原始实现: [ugly-avatar](https://github.com/txstc55/ugly-avatar)
- 代码参考: [next-api-share](https://github.com/mamumu123/next-api-share)

## 许可证

[MIT](./LICENSE)
