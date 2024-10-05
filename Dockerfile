FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

RUN npm run db:gen

COPY . .

EXPOSE 10000

CMD [ "npm", "run", "dev" ]