from node:lts-alpine

WORKDIR /app
ADD package.json pnpm-lock.yaml /app/

RUN npm i -g pnpm && pnpm install

ADD . /app

EXPOSE 3000

CMD ["pnpm", "start"]
