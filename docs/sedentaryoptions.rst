.. _SedentaryOptions:

SedentaryOptions
================

.. code-block:: TypeScript

    interface SedentaryOptions {
        log?: ((message: string) => void) | null;
        serverless?: boolean;
        sync?: boolean;
    }

Specifies the options for the :ref:`Sedentary` object.

.. _SedentaryOptions.log:

SedentaryOptions.log
--------------------

- default: :xref:`console.log`

The :xref:`Function` which :ref:`Sedentary` will use to log its messages. If ``null``, logging is disabled.

log(message)
^^^^^^^^^^^^

- ``message``: :xref:`string` - The message :ref:`Sedentary` needs to log.
- returns :xref:`void`.

.. _SedentaryOptions.serverless:

SedentaryOptions.serverless
---------------------------

- default: ``false``

**TODO**. If ``true``, the *serverless* support will be enabled.

.. _SedentaryOptions.sync:

SedentaryOptions.sync
---------------------

- default: ``true``

If ``false``, :ref:`Sedentary` will not sync the *database*, it simply checks if the configured :ref:`Models<Model>`
are compliant to the *tables* at *database* level.
