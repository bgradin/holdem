.DEFAULT_GOAL := dev

.PHONY: dependencies dev build

dependencies:
	npm i && cd src/client && npm i && cd ../server && npm i && cd ../shared && npm i

dev: dependencies
	npm run dev

build: dependencies
	npm run build
