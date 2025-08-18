FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY . ./

RUN npm install sharp

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

