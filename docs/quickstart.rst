**********
Quickstart
**********

**Sedentary** is strongly typed: the following code works both in **JavaScript** and **TypeScript**. If you are using **Sedentary** with **TypeScript**, see the dedicated :ref:`TypeScript<TypeScript>` section at the end of this guide for more details.

Installation
============

.. code-block:: javascript

    npm install sedentary-pg

Setup
=====

.. code-block:: javascript

    import { SedentaryPG } from "sedentary-pg";

    const db = new SedentaryPG({
        database: "db",
        user: "user",
        password: "pass"
    });

Define models before calling :ref:`sedentary.connect()<sedentary.connect>`:

.. code-block:: javascript

    const User = db.model("User", {
        name: db.VarChar({ size: 255, notNull: true }),
        email: db.VarChar({ size: 255, unique: true })
    });

    const Post = db.model("Post", {
        title: db.VarChar({ size: 255, notNull: true }),
        author: db.FKey(User.id)
    });

Connect and use
===============

.. code-block:: javascript

    (async function () {
        await db.connect();

        const user = new User();
        user.name = "Alice";
        user.email = "alice@example.com";
        await user.save();

        const post = new Post();
        post.title = "Hello";
        post.author = user.id;
        await post.save();

        const posts = await Post.load({}, "-id");
        console.log(posts[0].title, posts[0].author);

        await db.end();
    })();

.. note::
    When creating entries with ``new Model()``, property values are not initialized from ``notNull`` or ``defaultValue`` at JavaScript level. See :ref:`Entries initialization`.

.. _TypeScript:

TypeScript: model as both type and value
========================================

With native classes, the class name is both a constructor (value) and a type. Sedentary models are created at runtime via :ref:`sedentary.model()<sedentary.model>`, so the model name exists only as a value. To get the instance type, use the ``Entry<M>`` utility: pass ``typeof Model`` and you obtain the entry type. That way you can use a single symbol for both the model (value) and its instance type (type).

.. code-block:: typescript

    import { Entry, SedentaryPG } from "sedentary-pg";

    const db = new SedentaryPG({ database: "db", user: "user", password: "pass" });

    const User = db.model("User", {
        name: db.VarChar({ size: 255, notNull: true })
    });
    type User = Entry<typeof User>;

    const user: User = new User();
    user.name = "Alice";

``User`` is the model constructor (value) and ``User`` is the instance type (type). This mirrors how native classes work: ``class User { ... }`` gives you both ``User`` as constructor and ``User`` as instance type.
