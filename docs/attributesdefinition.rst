.. _AttributeDefinition:

AttributeDefinition
====================

.. code-block:: TypeScript

    type AttributeDefinition = type AttributeDefinition = TypeDefinition | AttributeOptions;

Defines an *attribute*, it can be either a :ref:`TypeDefinition` or an :ref:`AttributeOptions`. If an
:ref:`TypeDefinition` is used, the *default* value is used for all the not specified :ref:`AttributeOptions`
attributes.

.. _AttributeOptions:

AttributeOptions
================

.. code-block:: TypeScript

    interface AttributeOptions {
        defaultValue?: Natural;
        fieldName?: string;
        notNull?: boolean;
        type: TypeDefinition;
        unique?: boolean;
    }

Specifies the *options* of an *attribute*.

.. _AttributeOptions.defaultValue:

AttributeOptions.defaultValue
-----------------------------

- default: ``undefined``

If specified, defines the *default value* of the *field* at *database* level. See :ref:`Entries initialization` for
details.

.. _AttributeOptions.fieldName:

AttributeOptions.fieldName
--------------------------

- default: ``undefined``

If specified, defines the name of the *field* at *database* level, otherwise the *field* has the same name of the
*attribute*. This *option* is useful when a *fields* needs to have a :ref:`reserved name<Reserved names>`.

.. _AttributeOptions.notNull:

AttributeOptions.notNull
------------------------

- default: ``undefined``

If ``true``, specifies to set a ``NOT NULL CONSTRAIN`` on the *field* at *database* level.

.. _AttributeOptions.type:

AttributeOptions.type
---------------------

- required

Specifies the *type* of the *field* at *database* level. Accepts a :ref:`TypeDefinition`.

.. _AttributeOptions.unique:

AttributeOptions.unique
-----------------------

- default: ``undefined``

If ``true``, specifies to set a ``UNIQUE CONSTRAIN`` on the *field* at *database* level.

.. _AttributesDefinition:

AttributesDefinition
====================

.. code-block:: TypeScript

    type AttributesDefinition = { [key: string]: AttributeDefinition };

Defines the *attributes* of a :ref:`Model`. It is an :xref:`Object` where each *key* is the name of the *attribute* and
the relative :ref:`AttributeDefinition` *value* is the definition of the *attribute*.
