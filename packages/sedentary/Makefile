SHELL   := $(shell which bash)
PACKAGE := $(notdir $(shell pwd))
SHELL   := PACKAGE=$(PACKAGE) $(shell which bash)

TSCONFIGS := $(patsubst %,tsconfig.%.json, cjs es types)
UTILS     := ../../utils.ts

.PHONY: all build deploy

all: package.json tsconfig.json

build: all $(TSCONFIGS) Makefile
	tsc -p tsconfig.cjs.json
	tsc -p tsconfig.es.json
	tsc -p tsconfig.types.json
	echo '{"type":"commonjs"}' > dist/cjs/package.json
	rm dist/types/tsconfig.types.tsbuildinfo

deploy: build
	npm_config_registry=https://registry.npmjs.org npm publish --no-browser

package.json: $(UTILS) ../../package.json Makefile
	-npx tsx $< $@

tsconfig%json: $(UTILS) Makefile
	-npx tsx $< $@
