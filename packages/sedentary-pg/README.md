# sedentary-pg

[![Build Status][travis-badge]][travis-url]
[![Code Quality][qlty-badge]][qlty-url]
[![Test Coverage][cover-badge]][qlty-url]

[![NPM version][npm-badge]][npm-url]
[![NPM downloads][npm-downloads-badge]][npm-url]
[![Stars][stars-badge]][github-url]

[![Types][types-badge]][npm-url]
[![Dependents][deps-badge]][npm-url]
[![Donate][donate-badge]][donate-url]

[cover-badge]: https://qlty.sh/gh/iccicci/projects/sedentary/coverage.svg
[qlty-badge]: https://qlty.sh/gh/iccicci/projects/sedentary/maintainability.svg
[qlty-url]: https://qlty.sh/gh/iccicci/projects/sedentary
[deps-badge]: https://img.shields.io/librariesio/dependents/npm/sedentary-pg?logo=npm
[donate-badge]: https://img.shields.io/static/v1?label=donate&message=bitcoin&color=blue&logo=bitcoin
[donate-url]: https://blockchain.info/address/1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB
[github-url]: https://github.com/iccicci/sedentary-pg
[npm-downloads-badge]: https://img.shields.io/npm/dw/sedentary-pg?logo=npm
[npm-badge]: https://img.shields.io/npm/v/sedentary-pg?color=green&logo=npm
[npm-url]: https://www.npmjs.com/package/sedentary-pg
[stars-badge]: https://img.shields.io/github/stars/iccicci/sedentary-pg?logo=github&style=flat&color=green
[travis-badge]: https://img.shields.io/travis/com/iccicci/sedentary?logo=travis
[travis-url]: https://app.travis-ci.com/github/iccicci/sedentary
[types-badge]: https://img.shields.io/static/v1?label=types&message=included&color=green&logo=typescript

# under development

# Description

The **PostgreSQL** specialized package of [Sedentary](https://www.npmjs.com/package/sedentary).

Other DB engines: MySQL and SQLite are in todo but not yet planned.

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

# Installation

With [npm](https://www.npmjs.com/package/sedentary-pg):

```sh
$ npm install --save sedentary-pg
```

# Documentation

The full documentation is on [sedentary.readthedocs.io](https://sedentary.readthedocs.io/).

# Compatibility

Requires:

- Node.js: **v20**
- TypeScript: **v5.7** (or none if used in a JavaScript project).
- PostgreSQL: **v15**

The package is tested under [all version combinations](https://app.travis-ci.com/github/iccicci/sedentary)
of **Node.js** currently supported accordingly to [Node.js Release](https://github.com/nodejs/Release#readme) and of
**PostgreSQL** currently supported accordingly to
[PostgreSQL Versioning](https://www.postgresql.org/support/versioning/).

To work with the package under Windows, `bash.exe` can be configured as the _script-shell_.

```
> npm config set script-shell bash.exe
```

# License

[MIT License](https://github.com/iccicci/sedentary-pg/blob/master/LICENSE)

# Bugs

Bugs and inconsistencies can be reported [@github](https://github.com/iccicci/sedentary-pg/issues).

# Donating

Satoshis can be donated to this bitcoin address if the package is found useful:

<!-- cSpell: disable -->

**1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB**
