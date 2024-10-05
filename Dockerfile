FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

RUN npm run db:gen

RUN npm run migrate:prod

COPY . .

EXPOSE 5001

CMD [ "npm", "run", "start" ]