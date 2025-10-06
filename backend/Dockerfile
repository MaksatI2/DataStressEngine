FROM node:18-alpine 

WORKDIR /app
COPY package*.json ./

RUN apk add --no-cache build-base python3 make

RUN npm install

RUN apk del build-base python3 make

COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
