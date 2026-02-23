.. _Method:

Method
======

.. code-block:: TypeScript

    type Method = (this: Entry, ...args: any[]) => unknown;

A :xref:`Function` mounted as a **JavaScript** *method* on the :ref:`Model` class. Receives the entry instance as ``this``.

.. warning::
    Do not use :xref:`Arrow Functions` so that ``this`` correctly refers to the entry instance.

.. _Methods:

Methods
=======

.. code-block:: TypeScript

    type Methods = { [key: string]: Method };

Specifies the **JavaScript** *methods* of the :ref:`class Model<Model>`. It is an :xref:`Object` where each *key* is the
name of the *method* and the *value* is the *method* implementation.

.. _special methods:

special methods
===============

These *methods*, when defined, are called by Sedentary at specific lifecycle events:

- **construct()** — called after the entry is created (not for loaded entries). See :ref:`Entries initialization`.
- **preLoad()** / **postLoad()** — before/after loading from the database
- **preSave()** / **postSave(savedRecords)** — before/after saving
- **preRemove()** / **postRemove(deletedRecords)** — before/after removing
- **preCommit(actions)** / **postCommit(actions)** — before/after a transaction commits

All are optional and have empty default implementations in the base entry class.
