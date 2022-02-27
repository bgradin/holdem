FROM node:17-alpine

COPY . .

EXPOSE 3030

WORKDIR /src/server

CMD yarn start
