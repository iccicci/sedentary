*************
Documentation
*************

Naming conventions
==================

Attribute names as object properties
------------------------------------

Attribute names defined in a model become the property names on entry instances. When you load or create entries, you access data via these names (e.g. ``entry.name``, ``entry.email``). Choose attribute names that work well as JavaScript identifiers.

SQL is case insensitive
------------------------

SQL identifiers (table and column names) are typically **case insensitive**. Different databases handle this differently: PostgreSQL folds unquoted names to lowercase; others may fold to uppercase. Relying on case to distinguish identifiers leads to portability issues and subtle bugs. Sedentary avoids these problems by normalizing names at the database level.

JavaScript name limitations
---------------------------

**Model names** and **attribute names** must follow these rules:

- ASCII letters (uppercase or lowercase), digits, or underscore
- Cannot start with a digit

Examples: ``User``, ``firstName``, ``item_2`` are valid; ``1user``, ``first-name`` are invalid.

SQL name limitations
--------------------

**Table names** and **field names** (the actual database identifiers) must follow these rules:

- ASCII lowercase letters, digits, or underscore
- Cannot start with a digit

These constraints ensure consistent, portable behavior across SQL engines.

Name conversion
---------------

Sedentary converts model and attribute names to SQL names automatically:

- **Model name → table name**: The model name (e.g. ``UserProfile``) becomes the default table name. Uppercase letters (except the first) become lowercase preceded by an underscore. Example: ``UserProfile`` → ``user_profile``.

- **Attribute name → field name**: The attribute name (e.g. ``firstName``) becomes the default column name with the same rule. Example: ``firstName`` → ``first_name``.

Conversion rules (``toSqlName``):

- First character: if uppercase, becomes lowercase only (no underscore).
- Other characters: each uppercase letter becomes ``_`` + lowercase; the rest stay unchanged.

Examples:

- ``firstName`` → ``first_name``
- ``FirstName`` → ``first_name``
- ``id`` → ``id``

You can override the defaults: use the :ref:`tableName<ModelOptions.tableName>` option for the table name, and the :ref:`fieldName<AttributeOptions.fieldName>` option for each attribute's column name. Overrides must still comply with the SQL name rules (lowercase, digits, underscore; cannot start with digit).

.. _Entries initialization:

Entries initialization
======================

When you create a new entry with ``new Model()``, the constructor assigns any provided data and then calls ``construct()``. This hook lets you initialize properties at the JavaScript level (e.g. set defaults, compute derived values). ``construct()`` is invoked only for newly created entries, not for entries loaded from the database. It has **no effect at database level** — it does not alter schema, constraints, or column definitions.

By contrast, :ref:`notNull<AttributeOptions.notNull>` and :ref:`defaultValue<AttributeOptions.defaultValue>` are enforced at the **database level** only. They define ``NOT NULL`` constraints and ``DEFAULT`` clauses in SQL. They do **not** initialize JavaScript properties when you create a new entry: the in-memory object starts with ``undefined`` for unset attributes. If you need initial values in JavaScript (e.g. before the first save), set them in ``construct()`` or assign them explicitly after creation.
