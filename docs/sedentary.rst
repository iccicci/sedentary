.. _Sedentary:

Sedentary
=========

The base ORM class.

**TODO**

.. _new Sedentary:

new Sedentary(filename[, options])
----------------------------------

- ``filename``: :xref:`string` - required - The name of the JSON-DB file.
- ``options?``: :ref:`SedentaryOptions` - default ``{}`` - The global options.
- returns the :ref:`Sedentary` object to interact with the *database*.

.. _new SedentaryPG:

new SedentaryPG(config[, options])
----------------------------------

- ``config``: :xref:`pg.PoolConfig` - required - The connection configuration object.
- ``options?``: :ref:`SedentaryOptions` - default ``{}`` - The global options
- returns the :ref:`SedentaryPG<Sedentary>` object to interact with the *database*.

:ref:`SedentaryPG<Sedentary>` uses :xref:`pg.Pool` to connect to the *database*; please refer to :xref:`pg` and its
:xref:`pg-documentation` for details about the ``config`` object.

.. _sedentary.connect:

sedentary.connect()
-------------------

- returns a :xref:`Promise` which resolves with :xref:`void`.

Connects to the *database* and syncs the schema.

.. note::
    Must be called only once.

.. _sedentary.end:

sedentary.end()
---------------

- returns a :xref:`Promise` which resolves with :xref:`void`.

Closes the connection with the *database*.

.. note::
    Must be called only once, after :ref:`sedentary.connect()<sedentary.connect>`.

.. _sedentary.model:

sedentary.model(name, fields[, options [, methods]])
----------------------------------------

- ``name``: :xref:`string` - required - The name of the model.
- ``fields``: :ref:`AttributesDefinition` - required - The object with the fileds definitions.
- ``options?``: :ref:`ModelOptions` - default ``{}`` - The options of the model.
- ``methods?``: :ref:`Methods` - default ``{}`` - The **JavaScript** level *methods* of the model.
- returns a new :ref:`class Model<Model>` to interact with the TABLE.

Defines one model. Should be called once for each model/TABLE to be configured.

.. note::
    Must be called before :ref:`sedentary.connect()<sedentary.connect>`.

.. _sedentary.DATETIME:

sedentary.DATETIME()
--------------------

- returns a ``DATETIME`` :ref:`Type`.

It is the :ref:`Type function` to specify ``DATETIME`` as type for a *field*.

.. _sedentary.FKEY:

sedentary.FKEY(attribute, options)
----------------------------------

- ``attribute``: - :ref:`Model` | :ref:`ModelAttribute` - required - The *foreign key* target *attribute*.
- ``options``: - :ref:`ForeignKeyOptions` - default ``{}`` - The *foreign key* options.
- returns the :ref:`Type` of the target *attribute*.

It is the :ref:`Type function` to specify a :ref:`foreign key<Foreign keys>`. It can be either :ref:`Model` or a
:ref:`ModelAttribute`. If a :ref:`Model` is provided, its :ref:`primary key` is the target *attribute*.

.. _sedentary.INT:

sedentary.INT(size)
-------------------

- ``size``: :xref:`number` - default: ``4`` - The *size* of the *field* at *database* level.
- returns an ``INT`` :ref:`Type`.

It is the :ref:`Type function` to specify ``INT`` as type for a *field*. If the value of the ``size`` *argument* is
``2``, a *16 bit* ``INT`` :ref:`Type` is returned; if ``4``, a *32 bit* ``INT`` :ref:`Type` is returned; no other
values are accepted.

.. _sedentary.INT8:

sedentary.INT8
--------------

- returns an ``INT`` :ref:`Type`.

It is the :ref:`Type function` to specify *64 bit* ``INT`` as type for a *field*. It is a distinct :ref:`Type function`
from :ref:`sedentary.INT<sedentary.INT>` to give the *attribute* a specific type at **TypeScript** level.
**TODO**

.. _sedentary.VARCHAR:

sedentary.VARCHAR(size)
-----------------------

- ``size``: :xref:`number` - default ``undefined``- The *size* of the *field* at *database* level.
- returns an ``VARCHAR`` :ref:`Type`.

It is the :ref:`Type function` to specify ``VARCHAR`` as type for a *field*. If a value of the ``size`` *argument* is
provided, it is the maximum allowed string size at *database* level.
