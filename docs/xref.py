# -*- coding: utf-8 -*-

# Merely copyed from
# https://github.com/MarkHoeber/sublime_sphinx_guide/blob/master/source/ext/xref.py

from docutils import nodes

from sphinx.util import caption_ref_re


def xref(typ, rawtext, text, lineno, inliner, options={}, content=[]):

    title = target = text
    brace = text.find('<')
    if brace != -1:
        m = caption_ref_re.match(text)
        if m:
            target = m.group(2)
            title = m.group(1)
        else:
            target = text[brace+1:]
            title = text[:brace]

    if not (target in xref.links):
        inliner.reporter.warning("missing xref link '%s'" % target)
        return [], []

    link = xref.links[target]

    if brace != -1:
        pnode = nodes.reference(target, title, refuri=link)
    else:
        pnode = nodes.reference(target, target, refuri=link)

    return [pnode], []


def get_refs(app):

    xref.links = app.config.xref_links


def setup(app):

    app.add_config_value('xref_links', {}, True)
    app.add_role('xref', xref)
    app.connect("builder-inited", get_refs)
