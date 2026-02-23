.. _Model:

Model
=====

A *Model* is a class returned by :ref:`sedentary.model()<sedentary.model>`. Instances represent table rows (entries).

.. _Model attributes:

Model attributes
================

Each attribute defined in :ref:`AttributesDefinition` becomes a property on the model class (e.g. ``Foo.id``, ``Foo.name``)
and on entry instances. Use the class property when defining :ref:`foreign keys` (e.g. ``db.FKey(Foo.id)``).

.. code-block:: TypeScript

    const db = new SedentaryPG(config);
    const Foo = db.model("Foo", {
        name: db.VarChar({ size: 255 })
    });
    const Bar = db.model("Bar", {
        foo: db.FKey(Foo.id)  // Foo.id is the target attribute
    });

.. _Model.load:

Model.load(where[, order][, limit][, tx][, lock])
-------------------------------------------------

- ``where``: :ref:`Where condition` - required - The query condition.
- ``order?``: :xref:`string` | :xref:`Array` - optional - Attribute name(s) for ORDER BY. Prefix with ``-`` for DESC.
- ``limit?``: :xref:`number` - optional - Maximum number of rows to return.
- ``tx?``: :ref:`Transaction` - optional - Run within a transaction.
- ``lock?``: :xref:`boolean` - optional - Acquire row lock (e.g. ``SELECT ... FOR UPDATE``). Requires ``tx``.
- returns a :xref:`Promise` of entry instances.

Loads entries from the table.

.. _Model.cancel:

Model.cancel(where[, tx])
-------------------------

- ``where``: :ref:`Where condition` - required - The condition for rows to delete.
- ``tx?``: :ref:`Transaction` - optional - Run within a transaction.
- returns a :xref:`Promise` of the number of deleted rows.

Deletes rows matching the condition.

.. _Where condition:

Where condition
===============

- **Object**: ``{ attr: value }`` for equality, or ``{ attr: [operator, value] }`` for ``=``, ``>``, ``<``, ``>=``,
  ``<=``, ``<>``, ``IN``, ``IS NULL``, ``LIKE``, ``NOT``.
- **String**: Raw SQL condition (e.g. ``"id > 0"``).
- **Array**: Logical combinations: ``["AND", cond1, cond2]``, ``["OR", cond1, cond2]``, ``["NOT", cond]``.

.. _Model.save:

Entry.save()
------------

- returns a :xref:`Promise` of ``number | false`` (number of affected rows, or ``false`` for inserts).

Saves the entry (insert or update).

.. _Model.remove:

Entry.remove()
--------------

- returns a :xref:`Promise` of the number of deleted rows.

Removes the entry from the database. Fails if the entry was never saved.

.. _Transaction:

Transaction
===========

Returned by :ref:`sedentary.begin()<sedentary.begin>`. Use it as the ``tx`` argument to :ref:`Model.load<Model.load>`,
:ref:`Model.cancel<Model.cancel>`, and when constructing new entries (see :ref:`Entries initialization`). Call ``tx.commit()`` or ``tx.rollback()`` when done.
