.. _type IndexAttributes:

type IndexAttributes
====================

.. interface IndexOptions:

interface IndexOptions
======================

.. code-block:: TypeScript

    interface IndexOptions {
        attributes: IndexAttributes;
        type?: "btree" | "hash";
        unique?: boolean;
    }

Specifies the *options*

.. _type IndexDefinition:

type IndexDefinition
====================

.. code-block:: TypeScript

    type IndexDefinition = IndexAttributes | IndexOptions;

Defines an *index*, it can be either an :ref:`IndexAttributes<type IndexAttributes>` or an
:ref:`IndexOptions<interface IndexOptions>`. If an :ref:`IndexAttributes<type IndexAttributes>` is used, the *default*
value is used for all the not specified :ref:`IndexOptions<interface IndexOptions>` attributes.

.. _type IndexesDefinition:

type IndexesDefinition
======================

.. code-block:: TypeScript

    type IndexesDefinition = { [key: string]: IndexesDefinition };

Specifies the *indexes* on the *table* ralitve to the :ref:`class Model`. It is an :xref:`Object` where each *key* is
the name of the *index* and the relative :ref:`IndexDefinition<type IndexDefinition>` *value* is the definition of an
index.


**TODO**




export type IndexAttributes = string[] | string;

export interface IndexOptions {
  attributes: IndexAttributes;
  type?: "btree" | "hash";
  unique?: boolean;
}

export 
