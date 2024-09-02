FROM node:18.20.4

WORKDIR /code

RUN npm install -g npm@10.7.0

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]