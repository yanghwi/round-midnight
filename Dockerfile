FROM node:20-alpine

WORKDIR /app

# 패키지 매니페스트만 먼저 복사 (레이어 캐시 활용)
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN npm ci

# 소스 복사
COPY shared/ ./shared/
COPY server/ ./server/

RUN npm run build --workspace=@round-midnight/server

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@round-midnight/server"]
