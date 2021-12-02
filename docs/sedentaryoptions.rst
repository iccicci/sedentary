.. _interface SedentaryOptions:

interface SedentaryOptions
==========================

.. code-block:: TypeScript

    interface SedentaryOptions {
        log?: ((message: string) => void) | null;
        serverless?: boolean;
        sync?: boolean;
    }

Specifies the options for the :ref:`Sedentary<class Sedentary>` object.

.. _SedentaryOptions.log:

SedentaryOptions.log
--------------------

- default: console.log_

The Function_ :ref:`Sedentary<class Sedentary>` will use to log its messages. If ``null``, logging is disabled.

log(message)
^^^^^^^^^^^^

- ``message``: string_ - The message :ref:`Sedentary<class Sedentary>` needs to log.
- returns void_.

.. _SedentaryOptions.serverless:

SedentaryOptions.serverless
---------------------------

- default: ``false``

**TODO**. If ``true``, the *serverless* support will be enabled.

.. _SedentaryOptions.sync:

SedentaryOptions.sync
---------------------

- default: ``true``

If ``false``, :ref:`Sedentary<class Sedentary>` will not sync the DataBase, it simply checks if the configured
:ref:`Models<class Model>` are compliant to the *tables* in the DataBase.

.. _Function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
.. _boolean: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
.. _console.log: https://developer.mozilla.org/en-US/docs/Web/API/Console/log
.. _string: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
.. _void: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void
