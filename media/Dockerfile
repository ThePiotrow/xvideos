# Development 
FROM node:18-alpine as development

WORKDIR /var/www/media

RUN apk update && apk upgrade && \
    apk add --no-cache ffmpeg

COPY package*.json ./

RUN npm install npm@latest -g
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .


# Build
FROM node:18-alpine as build

WORKDIR /var/www/media

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Production
FROM node:18-alpine as production

WORKDIR /var/www/media

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=build /var/www/media/dist ./dist

EXPOSE 3001

CMD [ "npm", "run", "start:prod" ]