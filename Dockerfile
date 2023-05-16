FROM node:latest
VOLUME /app
WORKDIR /app

RUN npm i -g nodemon typescript && apt-get update && apt-get install -y rsync
#RUN npm install

CMD [ "/bin/bash" ]
