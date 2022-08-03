# sedentary-pg

[![Build Status][travis-badge]][travis-url]
[![Code Climate][code-badge]][code-url]
[![Test Coverage][cover-badge]][code-url]

[![NPM version][npm-badge]][npm-url]
[![NPM downloads][npm-downloads-badge]][npm-url]
[![Stars][stars-badge]][github-url]

[![Types][types-badge]][npm-url]
[![Dependents][deps-badge]][npm-url]
[![Donate][donate-badge]][donate-url]

[code-badge]: https://codeclimate.com/github/iccicci/sedentary-pg/badges/gpa.svg
[code-url]: https://codeclimate.com/github/iccicci/sedentary-pg
[cover-badge]: https://codeclimate.com/github/iccicci/sedentary-pg/badges/coverage.svg
[deps-badge]: https://badgen.net/npm/dependents/sedentary-pg?icon=npm&cache=300
[donate-badge]: https://badgen.net/badge/donate/bitcoin?icon=bitcoin&cache=300
[donate-url]: https://blockchain.info/address/1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB
[github-url]: https://github.com/iccicci/sedentary-pg
[npm-downloads-badge]: https://badgen.net/npm/dw/sedentary-pg?icon=npm&cache=300
[npm-badge]: https://badgen.net/npm/v/sedentary-pg?color=green&icon=npm&cache=300
[npm-url]: https://www.npmjs.com/package/sedentary-pg
[stars-badge]: https://badgen.net/github/stars/iccicci/sedentary-pg?icon=github&cache=300
[travis-badge]: https://badgen.net/travis/iccicci/sedentary-pg?icon=travis&cache=300
[travis-url]: https://app.travis-ci.com/github/iccicci/sedentary-pg
[types-badge]: https://badgen.net/npm/types/sedentary-pg?color=green&icon=typescript&cache=300

# under development

# Description

The **PostgreSQL** specialized package of [Sedentary](https://www.npmjs.com/package/sedentary).

# Usage

```javascript
import { SedentaryPG } from "sedentary-pg";

const db = new SedentaryPG(/* PG connection */);

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

With [npm](https://www.npmjs.com/package/sedentary-pg):

```sh
$ npm install --save sedentary-pg
```

# Documentation

The full documentation is on [sedentary.readthedocs.io](https://sedentary.readthedocs.io/).

# Compatibility

Requires:

- Node.js: **v14**
- TypeScript: **v4.6** (or none if used in a JavaScript project).

The package is tested under [all version combinations](https://app.travis-ci.com/github/iccicci/sedentary-pg)
of **Node.js** currently supported accordingly to [Node.js Release](https://github.com/nodejs/Release#readme) and of
**PostgreSQL** currently supported accordingly to
[PostgreSQL Versioning](https://www.postgresql.org/support/versioning/).

To work with the package under Windows, be sure to configure `bash.exe` as your _script-shell_.

```
> npm config set script-shell bash.exe
```

# Licence

[MIT Licence](https://github.com/iccicci/sedentary-pg/blob/master/LICENSE)

# Bugs

Do not hesitate to report any bug or inconsistency [@github](https://github.com/iccicci/sedentary-pg/issues).

# Donating

If you find useful this package, please consider the opportunity to donate some satoshis to this bitcoin address:
**1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB**
