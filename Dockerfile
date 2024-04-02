FROM node:14

WORKDIR /app

COPY . /app/public/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

