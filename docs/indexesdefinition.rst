.. _IndexAttributes:

IndexAttributes
===============

.. code-block:: TypeScript

    type IndexAttributes = string[] | string;

Specifies the *attributes* of an *index*. Accepts an :xref:`Array` of :xref:`strings<string>` where each element is the
name of an *attribute* of the same :ref:`Model`. If the index is on a single *attribute*, its name can be provided as a
:xref:`string` instead of an :xref:`Array`.

.. _IndexDefinition:

IndexDefinition
===============

.. code-block:: TypeScript

    type IndexDefinition = IndexAttributes | IndexOptions;

Defines an *index*, it can be either an :ref:`IndexAttributes` or an :ref:`IndexOptions`. If an :ref:`IndexAttributes`
is used, the *default* value is used for all the not specified :ref:`IndexOptions` attributes.

.. _IndexOptions:

IndexOptions
============

.. code-block:: TypeScript

    interface IndexOptions {
        attributes: IndexAttributes;
        type?: "btree" | "hash";
        unique?: boolean;
    }

Specifies the *options* of an *index*.

.. IndexOptions.attributes:

IndexOptions.attributes
-----------------------

- required

Defines the *attribures* of the *index*. See :ref:`IndexAttributes` for details.

.. IndexOptions.type:

IndexOptions.type
-----------------

- default: ``"btree"``

Defines the *type* of the *index*. Accepted values are: ``"btree"`` and ``"hash"``.

IndexOptions.unique
-------------------

- default: ``false``

Defines if the *index* must be a *unique index* or not.

.. _IndexesDefinition:

IndexesDefinition
=================

.. code-block:: TypeScript

    type IndexesDefinition = { [key: string]: IndexDefinition };

Specifies the *indexes* on the *table* ralitve to the :ref:`Model`. It is an :xref:`Object` where each *key* is the
name of the *index* and the relative :ref:`IndexDefinition` *value* is the definition of the *index*.
