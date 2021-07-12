FROM node:11.15.0

ENV TASKS=4

RUN npm install -y

COPY ./ app/

CMD node app/main.js

EXPOSE '3000'
