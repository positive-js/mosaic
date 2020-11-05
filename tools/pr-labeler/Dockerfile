FROM node:12-alpine

COPY ./package.json /pr-labeler/package.json
COPY ./package-lock.json /pr-labeler/package-lock.json
COPY ./tsconfig.json /pr-labeler/tsconfig.json
COPY ./entrypoint.sh /entrypoint.sh

RUN cd /pr-labeler && npm ci
COPY ./src/ /pr-labeler/src/

ENTRYPOINT ["/entrypoint.sh"]
