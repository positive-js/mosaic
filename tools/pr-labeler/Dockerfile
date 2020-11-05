FROM node:12-alpine

COPY ./package.json /pr-labeler/package.json
COPY ./yarn.lock /pr-labeler/yarn.lock
COPY ./tsconfig.json /pr-labeler/tsconfig.json
COPY ./entrypoint.sh /entrypoint.sh

RUN cd /pr-labeler && npm ci
COPY ./src/ /pr-labeler/src/

ENTRYPOINT ["/entrypoint.sh"]
