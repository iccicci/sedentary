.. _Model:

Model
=====

**TODO**

.. _ModelAttribute:

ModelAttribute
==============

.. code-block:: TypeScript

    interface ModelAttribute {}

This type is only used to reference *attributes* for :ref:`Foreign Keys`. If we write following *model*:

.. code-block:: TypeScript

    const db = new Sedentary();
    const Foo = db.model("Foo", { bar: db.INT });

the newly created ``Foo`` *model* has the ``Foo.bar`` **ModelAttribute** to be used later to specify a *foreign key*
referencing the ``bar`` *attribute*:

.. code-block:: TypeScript

    const Baz = db.model("Baz", { bar: db.FKEY(Foo.bar) });
