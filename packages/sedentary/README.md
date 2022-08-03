# sedentary

[![Build Status][travis-badge]][travis-url]
[![Code Climate][code-badge]][code-url]
[![Test Coverage][cover-badge]][code-url]

[![NPM version][npm-badge]][npm-url]
[![NPM downloads][npm-downloads-badge]][npm-url]
[![Stars][stars-badge]][github-url]

[![Types][types-badge]][npm-url]
[![Documentation][doc-badge]][doc-url]
[![Dependents][deps-badge]][npm-url]
[![Donate][donate-badge]][donate-url]

[code-badge]: https://codeclimate.com/github/iccicci/sedentary/badges/gpa.svg
[code-url]: https://codeclimate.com/github/iccicci/sedentary
[cover-badge]: https://codeclimate.com/github/iccicci/sedentary/badges/coverage.svg
[deps-badge]: https://badgen.net/npm/dependents/sedentary?icon=npm&cache=300
[doc-badge]: https://readthedocs.org/projects/sedentary/badge/?version=latest
[doc-url]: https://sedentary.readthedocs.io/
[donate-badge]: https://badgen.net/badge/donate/bitcoin?icon=bitcoin&cache=300
[donate-url]: https://blockchain.info/address/1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB
[github-url]: https://github.com/iccicci/sedentary
[npm-downloads-badge]: https://badgen.net/npm/dw/sedentary?icon=npm&cache=300
[npm-badge]: https://badgen.net/npm/v/sedentary?color=green&icon=npm&cache=300
[npm-url]: https://www.npmjs.com/package/sedentary
[stars-badge]: https://badgen.net/github/stars/iccicci/sedentary?icon=github&cache=300
[travis-badge]: https://badgen.net/travis/iccicci/sedentary?icon=travis&cache=300
[travis-url]: https://app.travis-ci.com/github/iccicci/sedentary
[types-badge]: https://badgen.net/npm/types/sedentary?color=green&icon=typescript&cache=300

# under development

# Description

An ORM which automatically syncs the DB schema on models change, no migrations between versions are required.

This package is designed **to make easy the process of applying changes to the database after model definition
changes**, more than offer a quick and easy database access interface. Applying changes to the database after releasing
a new version of the application is often a frustrating problem, usually solved with migration systems. Applying
changes to the database during the development stage, often results in a complex sequence of backward and forward steps
through the migrations; this process is complicated more and more especially when working in team with concurrent
changes to the models (or the database schema). This package tries to solve these problems all in once.

# Usage

```javascript
import { Sedentary } from "sedentary";

const db = new Sedentary("file.db");

class Items extends db.model("Item", {
  num: db.INT,
  str: db.VARCHAR(30)
});

(async function () {
  await db.connect();

  const item = Items.create();

  item.num = 0;
  item.str = "0";

  await item.save();

  const records = await Items.load({});

  console.log(records); // [{ id: 1, num: 0, str: "0" }]
})();
```

# Installation

With [npm](https://www.npmjs.com/package/sedentary):

```sh
$ npm install --save sedentary
```

# Disclaimer

**Do not use this package itself! It does not support any DB engine.**

A _DB engine dedicated extension_ must be used:

- MySQL: planned
- PostgreSQL: [sedentary-pg](https://github.com/iccicci/sedentary-pg#readme)
- SQLite: planned

# Documentation

The full documentation is on [sedentary.readthedocs.io](https://sedentary.readthedocs.io/).

# Compatibility

Requires:

- Node.js: **v14**
- TypeScript: **v4.6** (or none if used in a JavaScript project).

The package is tested under [all Node.js versions](https://app.travis-ci.com/github/iccicci/sedentary)
currently supported accordingly to [Node.js Release](https://github.com/nodejs/Release#readme).

To work with the package under Windows, be sure to configure `bash.exe` as your _script-shell_.

```
> npm config set script-shell bash.exe
```

# License

[MIT License](https://github.com/iccicci/sedentary/blob/master/LICENSE)

# Bugs

Do not hesitate to report any bug or inconsistency [@github](https://github.com/iccicci/sedentary/issues).

# Donating

If you find useful this package, please consider the opportunity to donate some satoshis to this bitcoin address:
**1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB**
