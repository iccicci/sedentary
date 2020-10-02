EXTENSIONS=$(shell RETURN="" ; for i in sedentary-mysql sedentary-pg sedentary-sqlite ; do if [ -d $$i ] ; then RETURN="$$RETURN $$i" ; fi ; done ; echo $$RETURN)
PACKAGE=$(notdir $(shell pwd))
PACKAGES=${EXTENSIONS} .
SHELL=/bin/bash

all: setup
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i all ; done
endif

ifeq (${PACKAGE}, sedentary)

else

ifeq (${PACKAGE}, sedentary-pg)

REPO_TOKEN=c7519657dfea145349c1b7a98f7134f033c25f598b40ad5b077744eb4beb7c66

endif

PARENT=$(shell if [ -f ../Makefile ] ; then echo yes ; else echo no ; fi)

ifeq (${PARENT}, yes)

TESTS=$(shell cd .. ; ls test/0* test/helper.ts)
VSCODE=$(shell cd .. ; ls .vscode/*)

test/%.ts: ../test/%.ts
	cp $< $@

.vscode/%.json: ../.vscode/%.json
	cp $< $@

.codeclimate.yml: ../.codeclimate.yml
	cp ../.codeclimate.yml .

.eslintrc.js: ../.eslintrc.js
	cp ../.eslintrc.js .

.gitattributes: ../.gitattributes
	cp ../.gitattributes .

.travis.yml: ../.travis.yml Makefile
	cat ../.travis.yml | sed 's/1aa1f737e7bf7d2859a2c7d9a0d9634a0d9aa89e3a19476d576faa7d02a1d46f/${REPO_TOKEN}/' > .travis.yml

LICENSE: ../LICENSE
	cp ../LICENSE .

Makefile: ../Makefile
	cp ../Makefile .

setup: .codeclimate.yml .eslintrc.js .gitattributes LICENSE tsconfig.json utils.ts ${TESTS} ${VSCODE} .travis.yml

clean: Makefile

commit: Makefile

outdated: Makefile

package.json: ../package.json Makefile setup

pull: Makefile

tsconfig.json: ../tsconfig.json
	cp ../tsconfig.json .

utils.ts: ../utils.ts
	cp ../utils.ts .

test: Makefile

else

endif

endif

.gitignore: utils.ts
	npm run gitignore

.npmignore: utils.ts
	npm run npmignore

clean: rm
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i clean ; done
endif

commit: node
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i commit ; done
endif

coverage: setup rm
	npm run coverage
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i coverage ; done
endif

diff: setup
	git diff
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i diff ; done
endif

install: package-lock.json
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i install ; done
endif

node: setup
	@if [ -z "${MESSAGE}" ] ; then echo "Missing MESSAGE!" ; exit 1 ; fi
	git add .
	git commit -m "${MESSAGE}"

outdated: setup
	-npm outdated
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i outdated ; done
endif

package.json: utils.ts
	npm run packagejson

package-lock.json: package.json
	npm install --prune
	npm link $(shell if [ ${PACKAGE} != sedentary ] ; then if [ ${PARENT} == yes ] ; then echo sedentary ; fi ; fi)
	@touch package-lock.json

pull: setup
	git pull
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i pull ; done
endif

push: setup
	git push
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i push ; done
endif

rm: setup
	rm -f index.d.ts index.js src/*.d.ts src/*.js

setup: .gitignore .npmignore package-lock.json

test: setup rm
	npm test
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i test ; done
endif
