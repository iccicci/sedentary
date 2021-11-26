.. _interface SedentaryOptions:

==========================
interface SedentaryOptions
==========================

Specifies the options for the :ref:`Sedentary<class Sedentary>` object.

.. _SedentaryOptions.log:

SedentaryOptions.log(message)
=============================

- ``message``: string_ - The message :ref:`Sedentary<class Sedentary>` needs to log.
- returns void_.
- default: console.log_

:ref:`Sedentary<class Sedentary>` will use this function to log its messages.

.. _SedentaryOptions.serverless:

SedentaryOptions.serverless
===========================

**TODO**. If ``true``, the *serverless* support will be enabled.

.. _SedentaryOptions.sync:

SedentaryOptions.sync
=====================

If ``false``, :ref:`Sedentary<class Sedentary>` will not sync the DataBase, will simply check if the configured
:ref:`Models<class Model>` are compliant to the DataBase.

.. _Function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
.. _boolean: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
.. _console.log: https://developer.mozilla.org/en-US/docs/Web/API/Console/log
.. _string: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
.. _void: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void
