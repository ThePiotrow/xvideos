FROM node:18-alpine

WORKDIR /var/www/user

COPY package*.json ./

RUN npm install npm@latest -g
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:prod" ]