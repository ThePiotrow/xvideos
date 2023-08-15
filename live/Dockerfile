FROM node:18-alpine

WORKDIR /var/www/media

COPY package*.json ./

#RUN npm install -g npm@9.8.1
RUN npm install

COPY . .

#RUN npm run build

CMD [ "npm", "run", "start:dev" ]

