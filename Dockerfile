FROM node:12

COPY . /opt/app
WORKDIR /opt/app

RUN npm install

ENTRYPOINT [""]
CMD ["npm", "start"]