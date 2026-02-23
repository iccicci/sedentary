.. _Sedentary:

Sedentary
=========

The base ORM class.

.. _new Sedentary:

new Sedentary([options])
------------------------

- ``options?``: :ref:`SedentaryOptions` - default ``{}`` - The global options.
- returns the :ref:`Sedentary` object to interact with the *database*.

.. warning::
    Do not use this constructor directly.

.. _new SedentaryPG:

new SedentaryPG(connection[, options])
--------------------------------------

- ``connection``: :xref:`pg.PoolConfig` - required - The connection configuration object.
- ``options?``: :ref:`SedentaryOptions` - default ``{}`` - The global options.
- returns the :ref:`SedentaryPG<Sedentary>` object to interact with the *database*.

:ref:`SedentaryPG<Sedentary>` uses :xref:`pg.Pool` to connect to the *database*; please refer to :xref:`pg` and its
:xref:`pg-documentation` for details about the ``connection`` object.

.. _sedentary.client:

sedentary.client()
------------------

(Only on :ref:`SedentaryPG<Sedentary>`.)

- returns a :xref:`Promise` of a :xref:`pg.Pool` client.

Acquires a client from the connection pool for raw SQL queries. Remember to ``release()`` the client when done.

.. _sedentary.connect:

sedentary.connect([sync])
-------------------------

- ``sync``: :xref:`boolean` - optional - When :ref:`autoSync<SedentaryOptions.autoSync>` is ``false``, overrides whether
  to run the **sync process** for this connect (``true`` = sync, ``false`` = skip). Ignored when ``autoSync`` is ``true``.
- returns a :xref:`Promise` which resolves with :xref:`void`.

Connects to the *database* and eventually syncs the schema.

.. note::
    Must be called only once.

.. _sedentary.end:

sedentary.end()
---------------

- returns a :xref:`Promise` which resolves with :xref:`void`.

Closes the connection with the *database*.

.. note::
    Must be called only once, after :ref:`sedentary.connect()<sedentary.connect>`.

.. _sedentary.begin:

sedentary.begin()
-----------------

- returns a :xref:`Promise` which resolves to a :ref:`Transaction` object.

Begins a new transaction.

.. _sedentary.sync:

sedentary.sync()
----------------

- returns a :xref:`Promise` which resolves with :xref:`void`.

Manually runs the **sync process** to align the *database* schema with the configured :ref:`Models<Model>`.

.. _sedentary.model:

sedentary.model(name, attributes[, options [, methods]])
---------------------------------------------------------

- ``name``: :xref:`string` - required - The name of the model.
- ``attributes``: :ref:`AttributesDefinition` - required - The object with the attribute definitions.
- ``options?``: :ref:`ModelOptions` - default ``{}`` - The options of the model.
- ``methods?``: :ref:`Methods` - default ``{}`` - The **JavaScript** level *methods* of the model.
- returns a new :ref:`class Model<Model>` to interact with the table.

Defines one model. Should be called once for each model/table to be configured.

.. note::
    Must be called before :ref:`sedentary.connect()<sedentary.connect>`.

.. _type functions:

Type functions
--------------

All type functions accept an optional :ref:`AttributeOptions` object. Functions that support a ``size`` option
(:ref:`Int<sedentary.Int>`, :ref:`Float<sedentary.Float>`, :ref:`VarChar<sedentary.VarChar>`) use
:ref:`AttributeOptionsSize` instead.

.. _sedentary.Boolean:

sedentary.Boolean([options])
----------------------------

- ``options?``: :ref:`AttributeOptions` - optional - Attribute options.
- returns a ``BOOLEAN`` :ref:`Type`.

.. _sedentary.DateTime:

sedentary.DateTime([options])
-----------------------------

- ``options?``: :ref:`AttributeOptions` - optional - Attribute options (e.g. ``defaultValue`` for dates). See :ref:`Entries initialization`.
- returns a ``DATETIME`` :ref:`Type`.

.. _sedentary.FKey:

sedentary.FKey(attribute[, options])
------------------------------------

- ``attribute``: :ref:`Model` attribute - required - The *foreign key* target *attribute* (must be ``unique``).
- ``options?``: :ref:`ForeignKeyOptions` - default ``{}`` - The *foreign key* options.
- returns the :ref:`Type` of the target *attribute*.

It is the :ref:`type function<type functions>` to specify a :ref:`foreign key<foreign keys>`. Pass the target
model's primary key attribute (e.g. ``Foo.id``) or any :ref:`unique<AttributeOptions.unique>` attribute.

.. _sedentary.Float:

sedentary.Float([options])
--------------------------

- ``options?``: :ref:`AttributeOptionsSize` - optional - ``size``: ``4`` (32-bit) or ``8`` (64-bit), default ``8``.
- returns a ``FLOAT`` :ref:`Type`.

.. _sedentary.Int:

sedentary.Int([options])
------------------------

- ``options?``: :ref:`AttributeOptionsSize` - optional - ``size``: ``2`` (16-bit) or ``4`` (32-bit), default ``4``.
- returns an ``INT`` :ref:`Type`.

.. _sedentary.Int8:

sedentary.Int8([options])
-------------------------

- ``options?``: :ref:`AttributeOptions` - optional - Attribute options.
- returns an ``INT8`` :ref:`Type` (64-bit integer, maps to :xref:`BigInt` in JavaScript).

.. _sedentary.JSON:

sedentary.JSON([options])
--------------------------

- ``options?``: :ref:`AttributeOptions` - optional - Attribute options.
- returns a ``JSON`` :ref:`Type`.

.. _sedentary.None:

sedentary.None([options])
-------------------------

- ``options?``: :ref:`AttributeOptions` - optional - Attribute options.
- returns a ``NONE`` :ref:`Type` (virtual attribute, no database column).

.. _sedentary.Number:

sedentary.Number([options])
---------------------------

- ``options?``: :ref:`AttributeOptions` - optional - Attribute options.
- returns a ``NUMBER`` :ref:`Type` (arbitrary precision).

.. _sedentary.VarChar:

sedentary.VarChar([options])
----------------------------

- ``options?``: :ref:`AttributeOptionsSize` - optional - ``size``: max string length at *database* level.
- returns a ``VARCHAR`` :ref:`Type`.
