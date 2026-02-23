************
Introduction
************

.. role:: bolditalic
    :class: bolditalic

This package is designed **to make easy the process of applying changes to the** :bolditalic:`database` **after model
definition changes**, more than offer a quick and easy *database* access interface. Applying changes to the *database*
after releasing a new version of the application is often a frustrating problem, usually solved with migration systems.
Applying changes to the *database* during the development stage, often results in a complex sequence of backward and
forward steps through the migrations; this process is complicated more and more especially when working in team with
concurrent changes to the models (or the *database* schema). This package tries to solve these problems all in once.

.. _packages:

Packages
========

The project is organized with a base package :ref:`package sedentary` itself plus a package specialized for each
*database* engine.

Nowadays only the :ref:`PostgreSQL<package sedentary-pg>` specialization package is provided.

.. _package sedentary:

sedentary
---------

The base package. **It must not be used directly**: it does not support any DB engine.

* NPM `sedentary package <https://www.npmjs.com/package/sedentary>`_
* GitHub `sedentary repository <https://github.com/iccicci/sedentary#readme>`_

.. _package sedentary-mysql:

sedentary-mysql
---------------

**NOT SCHEDULED YET**

The `MySQL <https://www.mysql.com/>`_ implementation package.

* NPM `sedentary-mysql package <https://www.npmjs.com/package/sedentary-mysql>`_
* GitHub `sedentary-mysql repository <https://github.com/iccicci/sedentary-mysql#readme>`_

.. _package sedentary-pg:

sedentary-pg
------------

The `PostgreSQL <https://www.postgresql.org/>`_ implementation package.

* NPM `sedentary-pg package <https://www.npmjs.com/package/sedentary-pg>`_
* GitHub `sedentary-pg repository <https://github.com/iccicci/sedentary-pg#readme>`_

.. _package sedentary-sqlite:

sedentary-sqlite
----------------

**NOT SCHEDULED YET**

The `SQLite <https://www.sqlite.org/index.html>`_ implementation package.

* NPM `sedentary-sqlite package <https://www.npmjs.com/package/sedentary-sqlite>`_
* GitHub `sedentary-sqlite repository <https://github.com/iccicci/sedentary-sqlite#readme>`_
