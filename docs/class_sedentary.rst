.. _class Sedentary:

===============
class Sedentary
===============

The base ORM class.

.. _new Sedentary:

new Sedentary(filename[, options])
==================================

- ``filename``: string_ - The name of the JSON-DB file.
- ``options?``: :ref:`SedentaryOptions<interface SedentaryOptions>` - The options for the SCHEMA. Default: ``{}``
- returns the :ref:`Sedentary<class Sedentary>` object to interact with the DataBase.

.. _new SedentaryPG:

new SedentaryPG(config[, options])
==================================

- ``config``: pg.PoolConfig_ - The connection configuration object.
- ``options?``: :ref:`SedentaryOptions<interface SedentaryOptions>` - The options for the SCHEMA. Default: ``{}``
- returns the :ref:`SedentaryPG<class Sedentary>` object to interact with the DataBase.

:ref:`SedentaryPG<class Sedentary>` uses pg.Pool_ to connect to the DataBase; please refer to node-postgres_ and its
documentation_ for details about the ``config`` object.

.. _sedentary.connect:

sedentary.connect()
===================

- returns a Promise_ which resolves with void_.

Connects to the DataBase and syncs the schema.

**Note:** Must be called only once.

.. _sedentary.end:

sedentary.end()
===============

- returns a Promise_ which resolves with void_.

Closes the connection with the DataBase.

**Note:** Must be called only once, after :ref:`sedentary.connect()<sedentary.connect>`.

.. _sedentary.model:

sedentary.model(name, fields[, options])
========================================

- ``name``: string_ - The name of the model.
- ``fields``: :ref:`Fields<Class Fields>` - The object with the fileds definitions.
- ``options?``: :ref:`ModelOptions<interface ModelOptions>` - The options of the model. Default: ``{}``
- returns a new :ref:`class Model` to interact with the TABLE.

Defines one model. Should be called once for each model/TABLE to be configured.

**Note:** Must be called before :ref:`sedentary.connect()<sedentary.connect>`.

.. _Function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
.. _Promise: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
.. _boolean: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
.. _documentation: https://node-postgres.com/
.. _node-postgres: https://www.npmjs.com/package/pg
.. _pg.Pool: https://node-postgres.com/api/pool
.. _pg.PoolConfig: https://node-postgres.com/features/connecting
.. _string: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
.. _void: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void
