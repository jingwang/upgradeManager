FROM mhart/alpine-node:latest
WORKDIR /usr/local/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD [ "init-app" ]
CMD [ "sample-companies" ]
CMD [ "start" ]
CMD [ "start-nossl" ]