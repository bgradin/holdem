FROM node:17-alpine

COPY src/server .
COPY node_modules node_modules
RUN rm node_modules/client && rm node_modules/server && rm node_modules/shared
COPY src/shared node_modules/shared

EXPOSE 3030

CMD yarn start
