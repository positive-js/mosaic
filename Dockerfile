ARG TAG=14.16-browsers

FROM circleci/node:$TAG

WORKDIR /mosaic

ENTRYPOINT ["yarn"]
