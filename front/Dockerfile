# Development
FROM node:18-alpine as development

WORKDIR /var/www/front

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /var/www/front/node_modules/.vite && chmod -R 777 /var/www/front/node_modules/.vite


# Build
FROM node:18-alpine as build

WORKDIR /var/www/front

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

USER node

# Production
FROM node:18-alpine as production

WORKDIR /var/www/front

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=build /var/www/front/dist ./dist

EXPOSE 3006

CMD [ "npm", "run", "preview" ]