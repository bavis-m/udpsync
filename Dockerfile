FROM node:latest
VOLUME /app
WORKDIR /app

RUN npm i -g nodemon
#RUN npm install

CMD [ "/bin/bash" ]
