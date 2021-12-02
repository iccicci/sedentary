.. _type Method:

type Method
===========

.. code-block:: TypeScript

    type Method = () => unknown;

Is a Function_ which is mounted as **JavaScript** *method* of the :ref:`class Model`.

.. warning::
    Do not use `Arrow Functions`_ to not override the **this** argument provided by the scope.

.. _type Methods:

type Methods
============

.. code-block:: TypeScript

    type Methods = { [key: string]: Method };

Specifies the **JavaScript** *methods* of the :ref:`class Model`. It is an Object_ where each *key* is the name of the
*method* and the relative *value* is a Function_ which is the *body* of the *method*.

.. _Arrow Functions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
.. _Function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
.. _Object: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
