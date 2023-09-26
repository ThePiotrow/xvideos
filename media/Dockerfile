FROM node:18-alpine

WORKDIR /var/www/media

RUN apk update && apk upgrade && \
    apk add --no-cache ffmpeg

COPY package*.json ./

RUN npm install npm@latest -g
RUN npm install

COPY . .

# RUN npm run build

CMD [ "npm", "run", "start:dev" ]
