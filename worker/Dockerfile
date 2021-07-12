FROM node:11.15.0

RUN npm install -y

ENV ADD=True

ENV MULT=True

COPY ./ app/

EXPOSE "3000"

CMD node app/main.js
