/**
 * Also install:
 * yarn add -D eslint eslint-config-airbnb-typescript eslint-config-prettier eslint-plugin-prettier eslint-plugin-promise @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import
 *
 */

module.exports = {
    extends: [
        'airbnb-typescript',
        "plugin:promise/recommended",
        "plugin:prettier/recommended"
    ],
    rules: {
        "jsx-a11y/label-has-associated-control": "off",
        "jsx-a11y/anchor-is-valid": "off",
        "react/react-in-jsx-scope": "off",
        "no-underscore-dangle": 0,
        "@typescript-eslint/naming-convention": [
            0,
            {
                "format": ["camelCase"],
                "leadingUnderscore": "allow"
            },
        ],
        "prettier/prettier": [
            "error",
            {
                "endOfLine": "auto"
            },
        ],
    },
    globals: {
        "React": "writable"
    },
    parserOptions: {
        project: './tsconfig.json'
    }
};
