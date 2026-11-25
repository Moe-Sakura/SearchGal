FROM oven/bun:1.4.5 AS bun

FROM node:26.13.1-bookworm-slim

WORKDIR /app

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 8787

# wrangler dev --local 不会读取容器环境变量，启动时将其写入 .dev.vars 注入 Worker env；
# 每次启动重建配置，未配置的搜索源自动跳过。
CMD ["sh", "-c", "node scripts/write-dev-vars.js && exec bun run wrangler dev --local --ip 0.0.0.0 --port 8787"]
