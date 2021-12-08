***********
Development
***********

Due to the organization of the :ref:`packages`, probably any change will requires appropriate changes on the
:ref:`sedentary package <package sedentary>` itself and on some *DB engine dedicated extension* as well.

In order to do that, the *database engine dedicated extensions* repositories are added as ``git submodule`` of the
:ref:`sedentary package <package sedentary>` repository.

Some ``make`` target have been added to support development of the packages together:

- ``make [all]`` - performs the basic setup (``npm install``, ``npm link``, and so on ...) on all the packages
- ``make clean`` - removes TypeScript produced files
- ``make commit MESSAGE=""`` - performs ``git add .`` and ``git commit -m $MESSAGE`` in all the git repositories
- ``make coverage`` - performs ``npm coverage`` on all the packages
- ``make diff`` - performs ``git diff`` in all the git repositories
- ``make doc`` - builds this documentation locally: requires sphinx
- ``make outdated`` - runs ``npm outdated`` on all the packages
- ``make pull`` - performs ``git pull`` in all the git repositories
- ``make push`` - performs ``git push`` in all the git repositories
- ``make status`` - performs ``git status`` in all the git repositories
- ``make test`` - performs ``npm test`` on all the packages
- ``make version VERSION=""`` - changes the versions, commits, tags and publishes everithing

Both the ``test`` and the ``coverage`` targets require to access a *database*: depending on the packages in the
development worspace a connection parameter may be required. The connection parameters are the string
representation of the JSON object that should passed to the ``connect`` method.

- **sedentary-pg:** ``SPG``
    - ``make coverage SPG='{"user":"postgres","password":"postgres"}'``
    - ``make test SPG='{"user":"postgres","password":"postgres"}'``
