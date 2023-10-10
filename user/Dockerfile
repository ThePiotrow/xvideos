# Development 
FROM node:18-alpine as development

WORKDIR /var/www/user

COPY package*.json ./

RUN npm install npm@latest -g
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .


# Build
FROM node:18-alpine as build

WORKDIR /var/www/user

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Production
FROM node:18-alpine as production

WORKDIR /var/www/user

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=build /var/www/user/dist ./dist

EXPOSE 3003

CMD [ "npm", "run", "start:prod" ]