***********
Development
***********

Due to the organization of the :ref:`packages`, most changes require updates to both the :ref:`sedentary package <package sedentary>` and the relevant *database engine* package (e.g. sedentary-pg).

The project is a **monorepo**: the base package and *database engine* packages live in the same repository (e.g. ``packages/sedentary``, ``packages/sedentary-pg``).

Available commands
==================

- **``make [all]``** — basic setup (``npm install``, ``npm link``, etc.) for all packages
- **``make doc``** — builds this documentation locally (uses Docker, see :ref:`sedentary.connect` setup)
- **``make pretest``** — copies shared test files to sedentary-pg before running tests
- **``yarn test``** — runs tests (via Vitest)
- **``yarn coverage``** — runs tests with coverage (runs ``make pretest`` first)

Both ``yarn test`` and ``yarn coverage`` require a *database* connection when testing sedentary-pg. Pass the
connection parameters via the ``SPG`` environment variable (JSON string for :xref:`pg.PoolConfig`):

- **sedentary-pg:** ``SPG``
  - ``SPG='{"user":"postgres","password":"postgres"}' yarn test``
  - ``SPG='{"user":"postgres","password":"postgres"}' yarn coverage``
