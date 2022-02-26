SERVER_IMAGE = holdem-server

.DEFAULT_GOAL := dev

.PHONY: dependencies dev build package help

dev: dependencies
	yarn dev

build: dependencies
	yarn build

package: dependencies
	docker build -t $(SERVER_IMAGE) .

dependencies:
	yarn

help: ## List available make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
