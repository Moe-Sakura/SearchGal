FROM node:24-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN corepack install && pnpm install --frozen-lockfile

COPY . .

EXPOSE 8787

# wrangler dev --local 不会读取容器环境变量，启动时将其写入 .dev.vars 注入 Worker env；
# 每次启动重建配置，未配置的搜索源自动跳过。
CMD ["sh", "-c", "node scripts/write-dev-vars.js && exec pnpm exec wrangler dev --local --ip 0.0.0.0 --port 8787"]
