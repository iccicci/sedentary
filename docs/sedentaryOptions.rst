.. _SedentaryOptions:

SedentaryOptions
================

.. code-block:: TypeScript

    interface SedentaryOptions {
        autoSync?: boolean;
        log?: ((message: string) => void) | null;
        sync?: boolean;
    }

Specifies the options for the :ref:`Sedentary` object.

.. _SedentaryOptions.autoSync:

SedentaryOptions.autoSync
-------------------------

- default: ``true``

If ``false``, the :ref:`sedentary.connect<sedentary.connect>` method does not perform the **sync process** by default.
This is usefull for distributed environments where we probably don't want to run the **sync process** at each
:ref:`sedentary.connect<sedentary.connect>` call, but we want to run it only once.

.. _SedentaryOptions.log:

SedentaryOptions.log
--------------------

- default: :xref:`console.log`

The :xref:`Function` which :ref:`Sedentary` will use to log its messages. If ``null``, logging is disabled.

log(message)
^^^^^^^^^^^^

- ``message``: :xref:`string` - required - The message :ref:`Sedentary` needs to log.
- returns :xref:`void`.

.. _SedentaryOptions.sync:

SedentaryOptions.sync
---------------------

- default: ``true``

If ``false``, :ref:`Sedentary` will not sync the *database*, it simply checks if the configured :ref:`Models<Model>`
are compliant to the *tables* at *database* level.
