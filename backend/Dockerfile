FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
RUN npm install pm2 -g

COPY . .

EXPOSE 5500

CMD ["pm2-runtime", "app.js", "-i", "max"]
