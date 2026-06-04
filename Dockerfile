FROM node:20-alpine

RUN apk add --no-cache git openssh-client bash

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "run", "start"]