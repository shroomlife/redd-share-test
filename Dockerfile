FROM node:lts-alpine
RUN npm install -g live-server

WORKDIR /app
COPY ./dist .

EXPOSE 80
CMD [ "live-server", "--open=/app", "--port=80", "--entry-file=index.html" ]
