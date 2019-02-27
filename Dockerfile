FROM node:alpine
RUN apk add --no-cache git
RUN apk add --no-cache libcurl
# RUN apk add --no-cache bash

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]