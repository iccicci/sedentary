.. _Method:

Method
======

.. code-block:: TypeScript

    type Method = () => unknown;

Is a :xref:`Function` which is mounted as **JavaScript** *method* of the :ref:`class Model<Model>`.

.. warning::
    Do not use :xref:`Arrow Functions` to not override the **this** argument provided by the scope.

.. _Methods:

Methods
=======

.. code-block:: TypeScript

    type Methods = { [key: string]: Method };

Specifies the **JavaScript** *methods* of the :ref:`class Model<Model>`. It is an :xref:`Object` where each *key* is
the name of the *method* and the relative *value* is a :xref:`Function` which is the *body* of the *method*.

.. note::
    Some *methods*, when provided, are called by **Sedentary** at specific events. Please check :ref:`Special methods`
    for more details.



.. _ModelOptions.init:

ModelOptions.init
-----------------

- default: ``undefined``

If provided, it works as the *constructor* :xref:`Function` does. It will be called when a ``new Model()`` is created.

.. note::
    **TODO** It is not called for loaded Entries.
