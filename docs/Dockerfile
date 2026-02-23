# cSpell:ignore PYTHONUNBUFFERED autoremove distutils noninteractive venv

# Replicates the Read the Docs build environment for local builds.
# Matches .readthedocs.yaml: ubuntu-24.04, Python 3.11
# See https://docs.readthedocs.io/en/stable/build-process.html
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    software-properties-common \
    && add-apt-repository -y ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-venv \
    python3.11-distutils \
    && curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11 \
    && apt-get purge -y curl software-properties-common \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Build requirements are installed at image build time for reproducibility
# Build context is docs/ (see docs/Makefile)
COPY requirements.txt /tmp/requirements.txt
RUN python3.11 -m pip install --no-cache-dir -r /tmp/requirements.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

WORKDIR /src/docs
ENV PYTHONPATH=/src/docs
