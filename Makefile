TAG?=14.16-browsers

docker:
	docker build \
		. \
		-t mosaic/node:${TAG} \
		--build-arg TAG=${TAG} \
		--no-cache
yarn:
	docker container run \
		--name mosaic \
		--rm \
		-t \
		-p 8080:8080 \
		-p 3003:3003 \
		-v `pwd`:/mosaic \
		mosaic/node:${TAG} \
		$(filter-out $@,$(MAKECMDGOALS))
