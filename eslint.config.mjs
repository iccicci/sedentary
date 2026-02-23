// cSpell:ignore linebreak multilines nonwords

import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sortKeys from "eslint-plugin-sort-keys";
import globals from "globals";
import tsEslint from "typescript-eslint";

/** @type {import('eslint').Rule.RuleModule} */
const catchRule = {
  create: context => ({
    CatchClause: node => {
      const isValid = node.param?.type === "Identifier" && node.param.name === "error";

      if(! isValid) {
        context.report({
          fix:       fixer => (node.param ? null : fixer.insertTextAfter(context.sourceCode.getFirstToken(node), " (error)")),
          messageId: "missingParam",
          node
        });
      }
    }
  }),
  meta: {
    docs:     { description: "Require catch clauses to declare a parameter named 'error'.", recommended: false },
    fixable:  "code",
    messages: { missingParam: "Catch clause must declare a parameter named 'error'." },
    schema:   [],
    type:     "suggestion"
  }
};

/** @type {import('eslint').Rule.RuleModule} */
const quotes = {
  create: context => ({
    Literal: node => {
      const { value, raw } = node;

      if(typeof value !== "string") return;

      const current = raw[0];
      const hasDouble = value.includes('"');
      const hasSingle = value.includes("'");
      const preferred = hasDouble && hasSingle ? "`" : hasDouble ? "'" : '"';

      if(current === preferred) return;

      const preferredLabel = preferred === "`" ? "backticks" : preferred === "'" ? "single quotes" : "double quotes";
      const reason = preferred === "`" ? `both " and '` : preferred === "'" ? '"' : "default";

      context.report({
        data: { preferred: preferredLabel, reason },
        fix:  fixer => {
          let wrapped;
          if(preferred === '"') wrapped = `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
          else if(preferred === "'") wrapped = `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
          else wrapped = `\`${value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\``;

          return fixer.replaceText(node, wrapped);
        },
        messageId: "wrongQuote",
        node
      });
    }
  }),
  meta: { fixable: "code", messages: { wrongQuote: "Prefer {{preferred}} delimiter ({{reason}})." }, schema: [], type: "suggestion" }
};

const local = { rules: { catch: catchRule, quotes } };

const overrides = { catch: { after: false }, for: { after: false }, if: { after: false }, switch: { after: false }, while: { after: false } };
const unusedVarsOptions = { argsIgnorePattern: "^_", caughtErrors: "none", ignoreRestSiblings: true };

export default defineConfig([
  { ignores: ["coverage", "docs", "packages/sedentary/dist", "packages/sedentary-pg/dist", "vitest-env.d.ts"] },
  {
    files:           ["**/*.cjs"],
    languageOptions: { globals: { ...globals.node } }
  },
  {
    extends:         [js.configs.recommended, ...tsEslint.configs.strictTypeChecked, ...tsEslint.configs.recommendedTypeChecked, ...tsEslint.configs.stylisticTypeChecked],
    files:           ["**/*.{cjs,js,mjs,ts}"],
    languageOptions: {
      ecmaVersion:   2020,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs", "vitest.config.ts"],
          defaultProject:      "tsconfig.json"
        },
        tsconfigRootDir: import.meta.dirname
      }
    },

    plugins: {
      "@stylistic":         stylistic,
      import:               importPlugin,
      local,
      "simple-import-sort": simpleImportSort,
      "sort-keys":          sortKeys
    },
    rules: {
      "@stylistic/keyword-spacing":                                ["error", { before: true, overrides }],
      "@stylistic/space-before-function-paren":                    ["error", { anonymous: "never", asyncArrow: "always", catch: "never", named: "never" }],
      "@typescript-eslint/consistent-indexed-object-style":        "off",
      "@typescript-eslint/consistent-type-definitions":            "off",
      "@typescript-eslint/no-base-to-string":                      "off",
      "@typescript-eslint/no-confusing-void-expression":           "off",
      "@typescript-eslint/no-dynamic-delete":                      "off",
      "@typescript-eslint/no-empty-function":                      "off",
      "@typescript-eslint/no-empty-interface":                     "off",
      "@typescript-eslint/no-extraneous-class":                    "off",
      "@typescript-eslint/no-misused-spread":                      "off",
      "@typescript-eslint/no-namespace":                           "off",
      "@typescript-eslint/no-non-null-assertion":                  "off",
      "@typescript-eslint/no-unnecessary-condition":               "off",
      "@typescript-eslint/no-unsafe-argument":                     "off",
      "@typescript-eslint/no-unsafe-assignment":                   "off",
      "@typescript-eslint/no-unsafe-call":                         "off",
      "@typescript-eslint/no-unsafe-member-access":                "off",
      "@typescript-eslint/no-unsafe-return":                       "off",
      "@typescript-eslint/no-unused-vars":                         ["error", unusedVarsOptions],
      "@typescript-eslint/prefer-nullish-coalescing":              "off",
      "@typescript-eslint/prefer-regexp-exec":                     "off",
      "@typescript-eslint/restrict-template-expressions":          "off",
      "@typescript-eslint/unbound-method":                         "off",
      "@typescript-eslint/unified-signatures":                     "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "arrow-body-style":                                          ["error", "as-needed"],
      "arrow-parens":                                              ["error", "as-needed"],
      "arrow-spacing":                                             "error",
      "brace-style":                                               ["error", "1tbs", { allowSingleLine: true }],
      curly:                                                       ["error", "multi-or-nest"],
      eqeqeq:                                                      ["error"],
      "import/first":                                              "error",
      "import/newline-after-import":                               "error",
      "import/no-duplicates":                                      "error",
      indent:                                                      ["error", 2],
      "key-spacing":                                               ["error", { align: { afterColon: true, beforeColon: false, on: "value" } }],
      "linebreak-style":                                           ["error", "unix"],
      "local/catch":                                               "error",
      "local/quotes":                                              "error",
      "max-len":                                                   ["error", { code: 200, ignoreStrings: true }],
      "no-console":                                                "warn",
      "no-mixed-spaces-and-tabs":                                  ["error", "smart-tabs"],
      "prefer-const":                                              ["error", { destructuring: "all" }],
      "prefer-template":                                           "error",
      semi:                                                        ["error", "always"],
      "simple-import-sort/exports":                                "error",
      "simple-import-sort/imports":                                "error",
      "sort-keys":                                                 "off",
      "sort-keys/sort-keys-fix":                                   "error",
      "space-unary-ops":                                           ["error", { nonwords: false, overrides: { "!": true }, words: true }]
    }
  },
  {
    files:           ["**/*.test.ts"],
    languageOptions: { globals: { ...globals.vitest } }
  }
]);
