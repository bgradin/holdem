.DEFAULT_GOAL := dev

.PHONY: dependencies dev build

dependencies:
	yarn

dev: dependencies
	yarn dev

build: dependencies
	yarn build
