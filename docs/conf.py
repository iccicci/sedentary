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
    "Array":            "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
    "Arrow Functions":  "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
    "Function":         "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions",
    "Object":           "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
    "Promise":          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
    "boolean":          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type",
    "console.log":      "https://developer.mozilla.org/en-US/docs/Web/API/Console/log",
    "number":           "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type",
    "pg-documentation": "https://node-postgres.com/",
    "pg":               "https://www.npmjs.com/package/pg",
    "pg.Pool":          "https://node-postgres.com/api/pool",
    "pg.PoolConfig":    "https://node-postgres.com/features/connecting",
    "string":           "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type",
    "void":             "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void"
}
