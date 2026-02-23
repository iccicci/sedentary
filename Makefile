SHELL   := PACKAGE=core $(shell which bash)

PACKAGES := $(shell ls packages)
UTILS    := utils.ts

.PHONY: all
all: $(patsubst %,packages/%/package.json, $(PACKAGES)) tsconfig.json
	@:

packages/sedentary-pg/Makefile: packages/sedentary/Makefile
	cp $< $@

packages/sedentary-pg/package.json: packages/sedentary-pg/Makefile

%/package.json: $(UTILS) packages/sedentary/Makefile package.json
	make -C $*

deploy: $(UTILS) all Makefile
	yarn workspaces run deploy
	git tag v$$(npx tsx $< $@)
	git push --tags

doc:
	$(MAKE) -C docs build

SEDENTARY_TEST_FILES := helper.ts $(notdir $(wildcard packages/sedentary/test/0*.test.ts))

.PHONY: pretest
pretest: $(addprefix packages/sedentary-pg/test/,$(SEDENTARY_TEST_FILES))
	@:
	rm -rf packages/*/dist

packages/sedentary-pg/test/%.ts: packages/sedentary/test/%.ts
	cp $< $@

tsconfig.json: utils.ts Makefile
	-npx tsx $< $@
