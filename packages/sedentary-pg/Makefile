SHELL   := $(shell which bash)
PACKAGE := $(notdir $(shell pwd))
SHELL   := PACKAGE=$(PACKAGE) $(shell which bash)

TSCONFIGS := $(patsubst %,tsconfig.%.json, cjs es types)
UTILS     := ../../utils.ts

all: .npmignore package.json tsconfig.json
	@:

build: all $(TSCONFIGS)
	tsc -p tsconfig.cjs.json
	tsc -p tsconfig.es.json
	tsc -p tsconfig.types.json

deploy: build
	npm_config_registry=registry.npmjs.org npm publish --no-browser

.npmignore: $(UTILS) Makefile
	-npx tsx $< $@

package.json: $(UTILS) ../../package.json Makefile
	-npx tsx $< $@

tsconfig%json: $(UTILS) Makefile
	-npx tsx $< $@
