SHELL   := PACKAGE=core $(shell which bash)

PACKAGES := $(shell ls packages)
UTILS    := scripts/utils.ts

.PHONY: all
all: $(patsubst %,packages/%/package.json, $(PACKAGES)) tsconfig.json
	@:

%/package.json: $(UTILS) packages/sedentary/Makefile package.json
	make -C $*

deploy: $(UTILS) all Makefile
	yarn workspaces run deploy
	git tag v$$(ts-node $< $@)
	git push --tags

docs/build/.deps: docs/requirements.txt Makefile
	@mkdir -p docs/build
	cd docs ; pip install --upgrade --upgrade-strategy eager -r requirements.txt
	@touch $@

doc: docs/build/.deps
	cd docs ; PYTHONPATH="${PYTHONPATH}:." sphinx-build . build

tsconfig.json: scripts/utils.ts Makefile
	-ts-node $< $@
