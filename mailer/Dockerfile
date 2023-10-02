FROM node:18-alpine

WORKDIR /var/www/mailer

COPY package*.json ./

RUN npm install npm@latest -g
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .

RUN if [ "${NODE_ENV}" = "prod" ]; then npm run build; fi

CMD [ "sh", "-c", "npm run start:${NODE_ENV}" ]
