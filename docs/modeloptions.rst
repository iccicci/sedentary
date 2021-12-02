.. _interface ModelOptions:

interface ModelOptions
======================

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

Specifies the *options* for the :ref:`Model<class Model>`.

.. _ModelOptions.indexes:

ModelOptions.indexes
--------------------

- default: ``{}``

Defines the indexes of the :ref:`Model<class Model>`. See :ref:`IndexesDefinition<type IndexesDefinition>` for details.

.. _ModelOptions.init:

ModelOptions.init
-----------------

- default: ``undefined``

If provided, it works as the *constructor* does. It will be called when a ``new Model()`` is created.

.. warning::
    Do not use `Arrow Functions`_ to not override the **this** argument provided by the scope.

.. note::
    **TODO** It is not called for loaded Entries.

.. _ModelOptions.int8id:

ModelOptions.int8id
-------------------

- default: ``false``

**TODO** If ``true``, the implicit ``id`` attribute is of type int8.

.. note::
    This option conflicts with :ref:`ModelOptions.parent` and :ref:`ModelOptions.primaryKey` ones.

.. _ModelOptions.methods:

ModelOptions.methods
--------------------

- default: ``{}``

Defines the *methods* of the :ref:`Model<class Model>`. See :ref:`Methods<type Methods>` for details.

.. _ModelOptions.parent:

ModelOptions.parent
-------------------

- default: ``undefined``

If provided, defines the *parent* of the :ref:`Model<class Model>`. This reflects both on *classes hierarchy* on
**JavaScript** side and on *tables hierarchy* on DataBase side. The implicit ``id`` attribute is not added to the
:ref:`Model<class Model>` as the *primary key* is inherited from the *parent*.

.. warning::
    Not all the :ref:`DataBase engine specialized packages<packages>` may support this option.

.. note::
    This option conflicts with :ref:`ModelOptions.int8id<ModelOptions.int8id>` and :ref:`ModelOptions.primaryKey` ones.

.. _ModelOptions.primaryKey:

ModelOptions.primaryKey
-----------------------

- default: ``undefined``

The value must be the name of an attribute. If provided, defines the *primary key* of the :ref:`Model<class Model>`.
The implicit ``id`` attribute is not added to the :ref:`Model<class Model>`.

.. note::
    This option conflicts with :ref:`ModelOptions.int8id<ModelOptions.int8id>` and :ref:`ModelOptions.parent` ones.

.. _ModelOptions.sync:

ModelOptions.sync
-----------------

- default: :ref:`SedentaryOptions.sync`

If ``false``, :ref:`Sedentary<class Sedentary>` does not sync the *table* associated to the :ref:`Model<class Model>`,
it simply check if the :ref:`Model<class Model>` is compliant to the *table* in the DataBase.

.. _ModelOptions.tableName:

ModelOptions.tableName
----------------------

- default: ``undefined``

If not provided, the name of the *table* is tha name of the :ref:`Model<class Model>` (i.e. the ``name`` argument of
the :ref:`sedentary.model()<sedentary.model>` call), otherwise it overrides the default *table* name.

.. _Arrow Functions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
