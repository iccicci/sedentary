EXTENSIONS=$(shell RETURN="" ; for i in sedentary-mysql sedentary-pg sedentary-sqlite ; do if [ -d $$i ] ; then RETURN="$$RETURN $$i" ; fi ; done ; echo $$RETURN)
PACKAGE=$(notdir $(shell pwd))
PACKAGES=${EXTENSIONS} .

all: .gitignore .npmignore package-lock.json
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i all ; done
endif

# TODO check link from ext

ifeq (${PACKAGE}, sedentary)

/usr/lib/node_modules/sedentary:
	npm link

link: /usr/lib/node_modules/sedentary

package-lock.json: /usr/lib/node_modules/sedentary

else

ifeq (${PACKAGE}, sedentary-pg)

REPO_TOKEN=c7519657dfea145349c1b7a98f7134f033c25f598b40ad5b077744eb4beb7c66

endif

PARENT=$(shell if [ -f ../Makefile ] ; then echo yes ; else echo no ; fi)

ifeq (${PARENT}, yes)

.eslintrc.js: ../.eslintrc.js Makefile
	cp ../.eslintrc.js .

.gitattributes: ../.gitattributes Makefile
	cp ../.gitattributes .

.gitignore: utils.ts
	npm run gitignore

.npmignore: utils.ts
	npm run npmignore

.travis.yml: ../.travis.yml Makefile
	cat ../.travis.yml | sed 's/1aa1f737e7bf7d2859a2c7d9a0d9634a0d9aa89e3a19476d576faa7d02a1d46f/${REPO_TOKEN}/' > .travis.yml

/usr/lib/node_modules/sedentary:
	make -C .. link

LICENSE: ../LICENSE Makefile
	cp ../LICENSE .

Makefile: ../Makefile
	cp ../Makefile .

all: .eslintrc.js .gitattributes .travis.yml LICENSE tsconfig.json utils.ts

clean: Makefile

commit: Makefile

link: /usr/lib/node_modules/sedentary Makefile

node_modules/sedentary: Makefile

outdated: Makefile

package-lock.json: node_modules/sedentary

pull: Makefile

tsconfig.json: ../tsconfig.json Makefile
	cp ../tsconfig.json .

utils.ts: ../utils.ts Makefile
	cp ../utils.ts .

else

endif

endif

clean: rm
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i clean ; done
endif

commit: node
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i commit ; done
endif

diff:
	git diff
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i diff ; done
endif

install: package-lock.json
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i install ; done
endif

link:
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i link ; done
endif

node: rm
	@if [ -z "${MESSAGE}" ] ; then echo "Missing MESSAGE!" ; exit 1 ; fi
	git add .
	git commit -m "${MESSAGE}"

node_modules/sedentary:
	npm link sedentary

outdated:
	npm outdated
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i outdated ; done
endif

package-lock.json: package.json
	npm install --prune
	@touch package-lock.json

pull:
	git pull
ifeq (${PACKAGE}, sedentary)
	for i in ${EXTENSIONS} ; do make -C $$i pull ; done
endif

rm:
	rm -f index.d.ts index.js src/*.d.ts src/*.js
