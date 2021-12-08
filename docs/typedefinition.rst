.. _Type:

Type
====

.. code-block:: TypeScript

    interface TypeDefinition {
        // black box
    }

Defines a *type* for a *field* at *database* level. It is the return value of :ref:`Type Functions<Type Function>`. See
:ref:`Data types` for details.

.. _TypeDefinition:

TypeDefinition
==============

.. code-block:: TypeScript

    type TypeDefinition = (() => Type) | Type;

Defines a *type* for a *field* at *database* level, it can be either a :ref:`Type Function` (a :xref:`Function` which
returns a :ref:`Type`) or a :ref:`Type` (the return value of a :ref:`Type Function`). If a :ref:`Type Function` is
used, the *default* value is used for all the not specified *arguments*. See :ref:`Data types` for details.
