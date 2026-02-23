.. _Type:

Type
====

.. code-block:: TypeScript

    interface Type<T, N extends boolean, E> {
        type: string;  // "BOOLEAN" | "DATETIME" | "FLOAT" | "INT" | "INT8" | "JSON" | "NONE" | "NUMBER" | "VARCHAR"
        // ... internal fields
    }

Defines a *type* for a *field* at *database* level. It is the return value of :ref:`type functions<type function>`.

.. _type function:

type function
^^^^^^^^^^^^^

A *type function* is a method on the Sedentary instance (e.g. ``db.Int()``, ``db.VarChar({ size: 255 })``) that returns
a :ref:`Type`. Each function corresponds to a :ref:`data types` at the *database* level.

.. seealso::
   :ref:`type functions` — Full list of type functions (Boolean, DateTime, FKey, Float, Int, Int8, JSON, None, Number, VarChar) in the :ref:`Sedentary` class documentation.

.. _data types:

data types
^^^^^^^^^^

The *database* types supported: ``BOOLEAN``, ``DATETIME``, ``FLOAT`` (4 or 8 bytes), ``INT`` (2 or 4 bytes), ``INT8``,
``JSON``, ``NONE`` (virtual), ``NUMBER`` (arbitrary precision), ``VARCHAR``.
