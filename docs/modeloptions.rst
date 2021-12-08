.. _ModelOptions:

ModelOptions
============

.. code-block:: TypeScript

    interface ModelOptions {
        indexes?: IndexesDefinition;
        init?: () => void;
        int8id?: boolean;
        methods?: Methods;
        parent?: Model;
        primaryKey?: string;
        sync?: boolean;
        tableName?: string;
    }

Specifies the *options* for the :ref:`Model`.

.. _ModelOptions.indexes:

ModelOptions.indexes
--------------------

- default: ``{}``

Defines the *indexes* of the :ref:`Model`. See :ref:`IndexesDefinition` for details.

.. _ModelOptions.init:

ModelOptions.init
-----------------

- default: ``undefined``

If provided, it works as the *constructor* :xref:`Function` does. It will be called when a ``new Model()`` is created.

.. warning::
    Do not use :xref:`Arrow Functions` to not override the **this** argument provided by the scope.

.. note::
    **TODO** It is not called for loaded Entries.

.. _ModelOptions.int8id:

ModelOptions.int8id
-------------------

- default: ``false``

If ``true``, the implicit ``id`` attribute used as :ref:`primary key` is of type ``INT8``, see :ref:`Data types` for
details.

.. note::
    This option conflicts with :ref:`ModelOptions.parent` and :ref:`ModelOptions.primaryKey` ones.

.. _ModelOptions.methods:

ModelOptions.methods
--------------------

- default: ``{}``

Defines the *methods* of the :ref:`Model`. See :ref:`Methods` for details.

.. _ModelOptions.parent:

ModelOptions.parent
-------------------

- default: ``undefined``

If provided, defines the *parent* of the :ref:`Model`. This reflects both on *classes hierarchy* at **JavaScript**
level and on *tables hierarchy* at *database* level. The :ref:`primary key` is inherited as well: neither an implicit
``id`` attribute is added nor can be specified through :ref:`ModelOptions.primaryKey` *option*.

.. warning::
    Not all the :ref:`database engine specialized packages<packages>` may support this option.

.. note::
    This option conflicts with :ref:`ModelOptions.int8id<ModelOptions.int8id>` and :ref:`ModelOptions.primaryKey` ones.

.. _ModelOptions.primaryKey:

ModelOptions.primaryKey
-----------------------

- default: ``undefined``

The value must be the name of an attribute. If provided, defines the :ref:`primary key` of the :ref:`Model`. The
implicit ``id`` attribute is not added to the :ref:`Model`.

.. note::
    This option conflicts with :ref:`ModelOptions.int8id<ModelOptions.int8id>` and :ref:`ModelOptions.parent` ones.

.. _ModelOptions.sync:

ModelOptions.sync
-----------------

- default: :ref:`SedentaryOptions.sync`

If ``false``, :ref:`Sedentary` does not sync the *table* associated to the :ref:`Model`, it simply checks if the
:ref:`Model` is compliant with the *table* at *database* level.

.. _ModelOptions.tableName:

ModelOptions.tableName
----------------------

- default: ``undefined``

If not provided, the name of the *table* is tha name of the :ref:`Model` (i.e. the ``name`` argument of the
:ref:`sedentary.model()<sedentary.model>` call), otherwise it overrides the default *table* name.
