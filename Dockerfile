FROM node:14.15.0-buster AS build

COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000
ENTRYPOINT ["npm", "run", "start"]