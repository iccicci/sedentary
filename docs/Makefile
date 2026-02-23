# Documentation build - uses Docker to replicate Read the Docs environment.
# See docs/Dockerfile and .readthedocs.yaml
ROOT := $(abspath ..)
IMAGE := sedentary-docs

.PHONY: build image
build: image
	docker run --rm -u $(shell id -u):$(shell id -g) -v $(ROOT):/src $(IMAGE)

image:
	docker build -t $(IMAGE) .
