FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install -g nodemon

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
