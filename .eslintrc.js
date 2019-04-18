module.exports = {
    "root": true,
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "@typescript-eslint/indent": [
            "error",
            4,
            { "SwitchCase": 0 }
        ],
        "indent": [
            "error",
            4,
            { "SwitchCase": 0 }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};