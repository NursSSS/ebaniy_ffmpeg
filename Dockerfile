FROM node:18.13.0

WORKDIR /app

RUN sed -i -e 's/http:\/\/archive\.ubuntu\.com\/ubuntu\//mirror:\/\/mirrors\.ubuntu\.com\/mirrors\.txt/' /etc/apt/sources.list
RUN apt-get update && apt-get install ffmpeg

COPY . .

RUN npm install

CMD ["npm", "run", "start:dev"]

