.. _AttributeOptions:

AttributeOptions
================

.. code-block:: TypeScript

    interface AttributeOptions<T, N extends boolean> {
        defaultValue?: T;
        fieldName?: string;
        notNull?: N;
        unique?: boolean;
    }

Specifies the *options* of an *attribute*. Passed to :ref:`type functions<type functions>` (e.g. :ref:`sedentary.Int<sedentary.Int>`, :ref:`sedentary.VarChar<sedentary.VarChar>`).

.. _AttributeOptions.defaultValue:

AttributeOptions.defaultValue
-----------------------------

- default: ``undefined``

If specified, defines the *default value* of the *field* at *database* level. See :ref:`Entries initialization` for the distinction between database-level and JavaScript-level initialization.

.. _AttributeOptions.fieldName:

AttributeOptions.fieldName
--------------------------

- default: same as attribute name

If specified, defines the name of the *field* at *database* level. Useful when a *field* needs a :ref:`reserved names` mapping.

.. _reserved names:

Reserved names
^^^^^^^^^^^^^^

These names cannot be used as attribute names: ``attr2field``, ``attributeName``, ``cancel``, ``class``, ``construct``,
``constructor``, ``defaultValue``, ``fieldName``, ``foreignKeys``, ``load``, ``modelName``, ``name``, ``postCommit``,
``postLoad``, ``postRemove``, ``postSave``, ``preCommit``, ``preLoad``, ``preRemove``, ``preSave``, ``primaryKey``,
``prototype``, ``remove``, ``save``, ``tableName``, ``type``, ``unique``.

.. _AttributeOptions.notNull:

AttributeOptions.notNull
------------------------

- default: ``false``

If ``true``, specifies a ``NOT NULL`` constraint on the *field* at *database* level. See :ref:`Entries initialization` for the distinction between database-level and JavaScript-level initialization.

.. _AttributeOptions.unique:

AttributeOptions.unique
-----------------------

- default: ``false``

If ``true``, specifies a ``UNIQUE`` constraint on the *field* at *database* level. Required for attributes used as
:ref:`foreign keys` targets.

.. _AttributeOptionsSize:

AttributeOptionsSize
====================

.. code-block:: TypeScript

    interface AttributeOptionsSize<T, N extends boolean> extends AttributeOptions<T, N> {
        size?: number;
    }

Extends :ref:`AttributeOptions` with a ``size`` option. Used by :ref:`sedentary.Int<sedentary.Int>`,
:ref:`sedentary.Float<sedentary.Float>`, :ref:`sedentary.VarChar<sedentary.VarChar>`.

.. _AttributesDefinition:

AttributesDefinition
====================

.. code-block:: TypeScript

    type AttributesDefinition = { [key: string]: Type };

Defines the *attributes* of a :ref:`Model`. It is an :xref:`Object` where each *key* is the name of the *attribute* and
the *value* is the result of calling a :ref:`type function<type functions>` (e.g. ``db.Int()``, ``db.VarChar({ size: 255 })``).
