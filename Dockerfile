FROM node:lts-alpine as build

COPY ./package.json package-lock.json tsconfig.json /opt/app/
WORKDIR /opt/app
RUN npm i
COPY src /opt/app/
RUN npm run compile

FROM node:lts-alpine

COPY --from=build /opt/app/dist /opt/app
WORKDIR /opt/app
RUN npm i --production
CMD node server/server.js