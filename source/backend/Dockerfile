FROM node:18-alpine AS base

WORKDIR /app
COPY ./src/ .
RUN npm install --location=global npm@latest
RUN npm install

EXPOSE 4000

CMD npm run start