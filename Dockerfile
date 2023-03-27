FROM node:18-alpine

WORKDIR /app


RUN apk add --update ffmpeg && \
    rm -rf /var/cache/apk/*

COPY package*.json ./

RUN npm install

COPY . .


CMD ["npm", "run", "start:dev"]