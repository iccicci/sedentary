#!/bin/sh

# cSpell:ignore pycache

sphinx-build . build
result=$?
rm -rf /src/docs/__pycache__

exit $result
