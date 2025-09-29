import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.{ts,js}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                node: true,
                es2021: true,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier: prettier,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            'prettier/prettier': 'error',
        },
    },
    {
        ignores: ['node_modules/', 'dist/', 'build/', '*.js'],
    },
];
