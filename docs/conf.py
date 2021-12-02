# -*- coding: utf-8 -*-

import sphinx_rtd_theme

extensions = ['sphinx_rtd_theme', 'xref']

html_logo = '_static/logo.svg'

html_theme = 'sphinx_rtd_theme'

html_theme_options = {
    'display_version': True,
    'logo_only': True,
    'navigation_depth': 4,
}

html_static_path = ['_static']

html_style = 'css/custom.css'

html_title = 'Sedentary'

xref_links = {
    "Object":  "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
    "string":  "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type"
}
