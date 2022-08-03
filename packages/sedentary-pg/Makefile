SHELL   := $(shell which bash)
PACKAGE := $(notdir $(shell pwd))
SHELL   := PACKAGE=$(PACKAGE) $(shell which bash)

TSCONFIGS := $(patsubst %,tsconfig.%.json, cjs es types)
UTILS     := ../../scripts/utils.ts

all: .gitignore .npmignore package.json tsconfig.json
	@:

build: all $(TSCONFIGS)
	tsc -p tsconfig.cjs.json
	tsc -p tsconfig.es.json
	tsc -p tsconfig.types.json

pretest: all jest.config.js
	rm -rf dist

ifneq ($(PACKAGE), sedentary)

pretest: $(addprefix test/,$(notdir $(shell ls ../sedentary/test/0*.test.ts)) helper.ts)

Makefile: ../sedentary/Makefile
	cp $< $@

test/%.ts: ../sedentary/test/%.ts
	cp $< $@

endif

.gitignore: $(UTILS) Makefile
	-ts-node $< $@

.npmignore: $(UTILS) Makefile
	-ts-node $< $@

jest.config.js: $(UTILS) Makefile
	-ts-node $< $@

package.json: $(UTILS) ../../package.json Makefile
	-ts-node $< $@

tsconfig%json: $(UTILS) Makefile
	-ts-node $< $@
