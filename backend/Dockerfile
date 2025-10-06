FROM node:18-alpine

RUN apk add --no-cache curl && \
    curl -L https://github.com/grafana/k6/releases/download/v0.52.0/k6-v0.52.0-linux-amd64.tar.gz | tar xvz && \
    mv k6-v0.52.0-linux-amd64/k6 /usr/local/bin/

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /app/k6-tests /app/results

EXPOSE 4000

CMD ["node", "server.js"]