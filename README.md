# sedentary

[![Build Status][travis-badge]][travis-url]
[![Code Quality][qlty-badge]][qlty-url]
[![Test Coverage][cover-badge]][qlty-url]

[![NPM version][npm-badge]][npm-url]
[![NPM downloads][npm-downloads-badge]][npm-url]
[![Stars][stars-badge]][github-url]

[![Types][types-badge]][npm-url]
[![Documentation][doc-badge]][doc-url]
[![Dependents][deps-badge]][npm-url]
[![Donate][donate-badge]][donate-url]

[cover-badge]: https://qlty.sh/gh/iccicci/projects/sedentary/coverage.svg
[qlty-badge]: https://qlty.sh/gh/iccicci/projects/sedentary/maintainability.svg
[qlty-url]: https://qlty.sh/gh/iccicci/projects/sedentary
[deps-badge]: https://img.shields.io/librariesio/dependents/npm/sedentary?logo=npm
[doc-badge]: https://readthedocs.org/projects/sedentary/badge/?version=latest
[doc-url]: https://sedentary.readthedocs.io/
[donate-badge]: https://img.shields.io/static/v1?label=donate&message=bitcoin&color=blue&logo=bitcoin
[donate-url]: https://blockchain.info/address/1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB
[github-url]: https://github.com/iccicci/sedentary
[npm-downloads-badge]: https://img.shields.io/npm/dw/sedentary?logo=npm
[npm-badge]: https://img.shields.io/npm/v/sedentary?color=green&logo=npm
[npm-url]: https://www.npmjs.com/package/sedentary
[stars-badge]: https://img.shields.io/github/stars/iccicci/sedentary?logo=github&style=flat&color=green
[travis-badge]: https://img.shields.io/travis/com/iccicci/sedentary?logo=travis
[travis-url]: https://app.travis-ci.com/github/iccicci/sedentary
[types-badge]: https://img.shields.io/static/v1?label=types&message=included&color=green&logo=typescript

Monorepo for the Sedentary ORM and its DB engine packages.

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
import { SedentaryPG } from "sedentary-pg";

const db = new SedentaryPG({ database: "db", user: "user", password: "pass" });

const Items = db.model("Item", {
  num: db.Int(),
  str: db.VarChar({ size: 30 })
});

(async function () {
  await db.connect();

  const item = new Items();

  item.num = 0;
  item.str = "0";

  await item.save();

  const records = await Items.load({});

  console.log(records); // [{ id: 1, num: 0, str: "0" }]
})();
```

With TypeScript the instance can be typed using `Entry<typeof Model>`:

```typescript
import { Entry, SedentaryPG } from "sedentary-pg";

const db = new SedentaryPG({ database: "db", user: "user", password: "pass" });

const Items = db.model("Item", { num: db.Int(), str: db.VarChar({ size: 30 }) });
type Item = Entry<typeof Items>;

const item: Item = new Items();

item.num = 0;
item.str = "0";
```

# Disclaimer

**Do not use this package itself! It does not support any DB engine.**

A _DB engine dedicated extension_ must be used:

- MySQL: in todo, not yet planned
- PostgreSQL: [sedentary-pg](https://www.npmjs.com/package/sedentary-pg)
- SQLite: in todo, not yet planned

# Documentation

The full documentation is on [sedentary.readthedocs.io](https://sedentary.readthedocs.io/).

# Compatibility

Requires:

- Node.js: **v20**
- TypeScript: **v5.7** (or none if used in a JavaScript project).

The package is tested under [all Node.js versions](https://app.travis-ci.com/github/iccicci/sedentary)
currently supported accordingly to [Node.js Release](https://github.com/nodejs/Release#readme).

To work with the package under Windows, `bash.exe` can be configured as the _script-shell_.

```
> npm config set script-shell bash.exe
```

# License

[MIT License](https://github.com/iccicci/sedentary/blob/master/LICENSE)

# Bugs

Bugs and inconsistencies can be reported [@github](https://github.com/iccicci/sedentary/issues).

# Donating

Satoshis can be donated to this bitcoin address if the package is found useful:

<!-- cSpell: disable -->

**1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB**
