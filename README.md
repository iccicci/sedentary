# sedentary

[![Build Status][travis-badge]][travis-url]
[![Code Climate][code-badge]][code-url]
[![Test Coverage][cover-badge]][code-url]
[![Donate][donate-badge]][donate-url]

[![NPM version][npm-badge]][npm-url]
[![Types][types-badge]][npm-url]
[![NPM downloads][npm-downloads-badge]][npm-url]
[![Stars][stars-badge]][github-url]

[![Dependencies][dep-badge]][dep-url]
[![Dev Dependencies][dev-dep-badge]][dev-dep-url]
[![Dependents][deps-badge]][npm-url]

[code-badge]: https://codeclimate.com/github/iccicci/sedentary/badges/gpa.svg
[code-url]: https://codeclimate.com/github/iccicci/sedentary
[cover-badge]: https://codeclimate.com/github/iccicci/sedentary/badges/coverage.svg
[dep-badge]: https://david-dm.org/iccicci/sedentary.svg
[dep-url]: https://david-dm.org/iccicci/sedentary
[deps-badge]: https://badgen.net/npm/dependents/sedentary?icon=npm
[dev-dep-badge]: https://david-dm.org/iccicci/sedentary/dev-status.svg
[dev-dep-url]: https://david-dm.org/iccicci/sedentary?type=dev
[donate-badge]: https://badgen.net/badge/donate/bitcoin?icon=bitcoin
[donate-url]: https://blockchain.info/address/1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB
[github-url]: https://github.com/iccicci/sedentary
[npm-downloads-badge]: https://badgen.net/npm/dw/sedentary?icon=npm
[npm-badge]: https://badgen.net/npm/v/sedentary?color=green&icon=npm
[npm-url]: https://www.npmjs.com/package/sedentary
[stars-badge]: https://badgen.net/github/stars/iccicci/sedentary?icon=github
[travis-badge]: https://badgen.net/travis/iccicci/sedentary?icon=travis
[travis-url]: https://travis-ci.org/iccicci/sedentary?branch=master
[types-badge]: https://badgen.net/npm/types/sedentary?color=green&icon=typescript

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

## Javascript

```javascript
import { Sedentary } from "sedentary";

const db = new Sedentary("file.db");

const Items = db.model("Item", {
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

## Typescript

```typescript
import { Sedentary } from "sedentary";

const db = new Sedentary("file.db");

const Items = db.model("Item", {
  num: db.INT,
  str: db.VARCHAR(30)
});
type Item = typeof Items.meta;

(async function (): Promise<void> {
  await db.connect();

  const item: Item = Items.create();

  item.num = 0;
  item.str = "0";

  await item.save();

  const records: Item[] = await Items.load({});

  console.log(records); // [{ id: 1, num: 0, str: "0" }]
})();
```

# Table of Contents

- [Installation](#installation)
- [Disclaimer](#disclaimer)
- [Quick Start Example](#quick-start-example)
  - [First script example](#first-script-example)
  - [First output example](#first-output-example)
  - [Second script example](#second-script-example)
  - [Second output example](#second-output-example)
- [API](#api)
  - [Class: Field](#class-field)
  - [Class: FieldOptions](#class-fieldoptions)
  - [Class: Fields](#class-fields)
  - [Class: ModelOptions](#class-modeloptions)
  - [Class: Model](#class-model)
  - [Class: Sedentary](#class-sedentary)
    - [async sedentary.connect()](#async-sedentaryconnect)
    - [async sedentary.end()](#async-sedentaryend)
    - [sedentary.model(name, fields[, options])](#sedentarymodelname-fields-options)
    - [new Sedentary(filename, [log])](#new-sedentaryfilename-log)
- [Compatibility](#compatibility)
- [Development](#development)
- [Licence](#licence)
- [Bugs](#bugs)
- [ChangeLog](#changelog)
- [Donating](#donating)

# Installation

With [npm](https://www.npmjs.com/package/sedentary):

```sh
$ npm install --save sedentary
```

# Disclaimer

**Do not use this package itself in production! This package uses a simple self made JSON-DB engine just for testing
purposes.**

For a real environment a _DB engine dedicated extension_ must be used:

- MySQL: planned
- PostgreSQL: [sedentary-pg](https://github.com/iccicci/sedentary-pg#readme)
- SQLite: planned

# Quick Start Example

## First script example

Running following script:

```javascript

```

## First output example

we will obtain following output:

```

```

## Second example script:

Changeing the script as follows and running it:

```javascript

```

the diff is:

```

```

## Second output example

we will obtain following output:

```

```

# API

## Class: Field

It represent a field.

Returned by [`sedentary.fldNumber`](#sedentaryfldnumber), [`sedentary.fldString`](#sedentaryfldstring) (and so on...)
methods, should be used only for SCHEMA definition.

## Class: FieldOptions

It defines the options of a filed.

## Class: Fields

It defines the fields of a model.

Each key of the object represents the field name, the value represents the data type and eventualy the options.

## Class: ModelOptions

## Class: Model

## Class: Sedentary

The base ORM class

### async sedentary.connect()

Connects to the DB and syncs the schema.

**Note:** Must be called only once.

### async sedentary.end()

Closes the connection with the DB.

**Note:** Must be called only once, after [`sedentary.connect`](#async-sedentaryconnect).

### sedentary.model(name, fields[, options])

- `name`: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) &nbsp; The name
  of the model.
- `fields`: [`Fields`](#class-fields) &nbsp; The
  object with the fileds definitions.
- `options`?: [`ModelOptions`](#class-modeloptions) &nbsp; The options of the model.
- returns &nbsp; The [`Model`](#class-model) object to interact with the TABLE.

**Note:** Must be called before [`sedentary.connect`](#async-sedentaryconnect).

Defines one model. Should be called once for each model/TABLE to be configured.

**TypeScript:** to access the type ot the records of this model one more code line is required.

```typescript
const Users = db.model("User", {
  username: db.fldString(),
  level: db.fldNumber()
});
type User = typeof Users.meta; // get the record type from the model
```

From now on the `User` type can be used (for example) to give the right type to the parameter of a function which
accesses a user.

```typescript
function accessUser(user: User): void {
  const { username, level } = user;
  ...
}
```

### new Sedentary(filename[, log])

- `filename`: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) &nbsp;
  The name of the JSON-DB file.
- `log`?: [`(message: string) => void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions)
  &nbsp; The log function which **Sedentary** will call. Default:
  [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log).
- returns &nbsp; The [`Sedentary`](#class-sedentary) object to interact with the DB.

# Compatibility

Requires:

- Node.js: **v10**
- TypeScript: **v4.1** (or none if used in a JavaScript project).

The package is tested under [all Node.js versions](https://travis-ci.org/iccicci/sedentary)
currently supported accordingly to [Node.js Release](https://github.com/nodejs/Release#readme).

To work with the package under Windows, be sure to configure `bash.exe` as your _script-shell_.

```
> npm config set script-shell bash.exe
```

# Development

Since this package is the core of the ORM, probably any change on it will requires appropriate changes on the _DB
engine dedicated extension_ as well.

In order to do that, the required _DB engine dedicated extensions_ repositories should be cheked out in the root
directory of the repository of this package obtaining following directories structure:

```
:
|
+- sedentary
|  |
|  +- package.json
|  |
|  +- src
|  |  |
|  |  +- transaction.ts
|  :  :
|  |
|  +- sedentary-pg
|     |
|     +- package.json
|     |
|     +- src
|     |  |
:     :  :
```

Some `make` target have been added to support development of the packages together:

- `make [all]` - performs the basic setup (`npm install`, `npm link`, and so on ...) on all the packages
- `make clean` - removes TypeScript produced files
- `make commit MESSAGE=""` - performs `git add .` and `git commit -m $MESSAGE` in all the git repositories
- `make coverage` &#x20F0; - performs `npm coverage` on all the packages
- `make diff` - performs `git diff` in all the git repositories
- `make outdated` - runs `npm outdated` on all the packages
- `make pull` - performs `git pull` in all the git repositories
- `make push` - performs `git push` in all the git repositories
- `make status` - performs `git status` in all the git repositories
- `make test` &#x20F0; - performs `npm test` on all the packages
- `make version VERSION=""` - changes the versions, commits, tags and publishes everithing

**Note \*:** Check the _DB engine dedicated extensions_ `README` files for details.

# Licence

[MIT Licence](https://github.com/iccicci/sedentary/blob/master/LICENSE)

# Bugs

Do not hesitate to report any bug or inconsistency [@github](https://github.com/iccicci/sedentary/issues).

# ChangeLog

[ChangeLog](https://github.com/iccicci/sedentary/blob/master/CHANGELOG.md)

# Donating

If you find useful this package, please consider the opportunity to donate some satoshis to this bitcoin address:
**1Md9WFAHrXTb3yPBwQWmUfv2RmzrtbHioB**
