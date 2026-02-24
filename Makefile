SHELL := PACKAGE=core $(shell which bash)

PACKAGES := $(shell ls packages)
UTILS    := utils.ts
TESTS    := helper.ts $(notdir $(wildcard packages/sedentary/test/0*.test.ts))

DB_PACKAGES := $(filter-out sedentary,$(PACKAGES))

.PHONY: all doc pretest

all: $(patsubst %,packages/%/Makefile, $(DB_PACKAGES)) $(patsubst %,packages/%/package.json, $(PACKAGES)) tsconfig.json

packages/sedentary-pg/Makefile: packages/sedentary/Makefile
	cp $< $@

%/package.json: $(UTILS) %/Makefile package.json
	make -C $*

build: $(UTILS) all Makefile
	yarn workspaces run build

deploy: $(UTILS) all Makefile
	yarn workspaces run deploy
	git tag v$$(npx tsx $< $@)
	git push --tags

doc:
	$(MAKE) -C docs build

pretest: $(addprefix packages/sedentary-pg/test/,$(TESTS))
	rm -rf packages/*/dist

packages/sedentary-pg/test/%.ts: packages/sedentary/test/%.ts
	cp $< $@

tsconfig.json: utils.ts Makefile
	npx tsx $< $@
