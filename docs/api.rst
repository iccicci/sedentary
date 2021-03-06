===
API
===

.. _Class Fields:

Class: Fields
=============

.. _Class Model:

Class: Model
============

.. _Class ModelOptions:

Class: ModelOptions
===================

.. _Class SchemaOptions:

Class: SchemaOptions
====================

- ``log(message)?``: Function_ - The function **Sedentary** will use to log. Default: console.log_
    - ``message?``: string_ - The message to log.
    - returns ``void``.
- ``sync?``: boolean_ - Indicates if the SCHEMA should be synced. Default ``true``

If ``sync`` is ``false`` **Sedentary** will not sync the SCHEMA, will simply check if the configured
:ref:`Models<Class Model>` are compliant to the SCHEMA.

.. _Class Sedentary:

Class: Sedentary
================

The base ORM class.

.. _new Sedentary:

new Sedentary()
----------------------------------

**new Sedentary(filename[, options])**

- ``filename``: string_ - The name of the JSON-DB file.
- ``options?``: :ref:`SchemaOptions<Class SchemaOptions>` - The options for the SCHEMA. Default: ``{}``
- returns the :ref:`Sedentary<Class Sedentary>` object to interact with the DB.

.. _sedentary.connect:

connect()
---------

**async sedentary.connect()**

- returns a Promise_ which resolves with ``void``.

Connects to the DB and syncs the schema.

**Note:** Must be called only once.

.. _sedentary.end:

end()
-----

**async sedentary.end()**

- returns a Promise_ which resolves with ``void``.

Closes the connection with the DB.

**Note:** Must be called only once, after :ref:`sedentary.connect<sedentary.connect>`.

.. _sedentary.model:

model()
-------

**sedentary.model(name, fields[, options])**

- ``name``: string_ - The name of the model.
- ``fields``: :ref:`Fields<Class Fields>` - The object with the fileds definitions.
- ``options?``: :ref:`ModelOptions<Class ModelOptions>` - The options of the model. Default: ``{}``
- returns the :ref:`Model<Class Model>` object to interact with the TABLE.

Defines one model. Should be called once for each model/TABLE to be configured.

**Note:** Must be called before :ref:`sedentary.connect<sedentary.connect>`.

.. _Function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
.. _Promise: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
.. _boolean: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
.. _console.log: https://developer.mozilla.org/en-US/docs/Web/API/Console/log
.. _string: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
