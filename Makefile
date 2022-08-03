PACKAGES := $(shell ls packages)
UTILS    := scripts/utils.ts

.PHONY: all
all: $(patsubst %,packages/%/package.json, $(PACKAGES)) tsconfig.json
	@:

%/package.json: $(UTILS) packages/sedentary/Makefile Makefile
	make -C $*

deploy: $(UTILS) all Makefile
	yarn workspaces run deploy
	echo git tag v$$(ts-node $< $@)
	echo git push --tags

docs/build/.deps: docs/requirements.txt Makefile
	@mkdir -p docs/build
	cd docs ; pip install --upgrade --upgrade-strategy eager -r requirements.txt
	@touch $@

doc: docs/build/.deps
	cd docs ; PYTHONPATH="${PYTHONPATH}:." sphinx-build . build

tsconfig.json: scripts/utils.ts Makefile
	-PACKAGE=core ts-node $< $@
