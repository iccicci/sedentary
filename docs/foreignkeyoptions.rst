.. _ForeignKeyActions:

ForeignKeyActions
=================

.. code-block:: TypeScript

    type ForeignKeyActions = "cascade" | "no action" | "restrict" | "set default" | "set null";

The possible *actions* the database engine has to take in case of deletion or update of the target *record* of the
*foreign key*.

.. _ForeignKeyOptions:

ForeignKeyOptions
=================

.. code-block:: TypeScript

    interface ForeignKeyOptions {
        onDelete?: ForeignKeyActions;
        onUpdate?: ForeignKeyActions;
    }

Specifies the *options* for a *foreign key*.

.. _ForeignKeyOptions.onDelete:

ForeignKeyOptions.onDelete
--------------------------

- default: ``"no action"``

The *action* the database engine has to take in case of deletion of the target *record* of the *foreign key*. Accepts a
:ref:`ForeignKeyActions`.

.. _ForeignKeyOptions.onUpdate:

ForeignKeyOptions.onUpdate
--------------------------

- default: ``"no action"``

The *action* the database engine has to take in case of update of the target *filed* of the *foreign key*. Accepts a
:ref:`ForeignKeyActions`.
