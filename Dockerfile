FROM node:10.15

WORKDIR /mastodon-masuo

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm i
RUN npx tsc

CMD ["node", "dist/index"]