module.exports = {
  root: true,
  env: {
    browser: true, // Permet les objets globaux du navigateur comme window et document
    es2020: true, // Utilise les fonctionnalités d'ECMAScript 2020
    node: true, // Ajouté pour permettre la reconnaissance de process.env et d'autres objets globaux Node.js
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 'latest', // ou vous pouvez spécifier '2020' pour être cohérent avec la section env
    sourceType: 'module',
  },
  settings: {
    react: {
      version: '18.2', // Assurez-vous que cette version correspond à la version de React utilisée dans votre projet
    },
  },
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'error',
    // Ajoutez ici d'autres règles spécifiques au projet au besoin
    'react/no-unescaped-entities': ['error', { forbid: ['<', '>', '{', '}'] }],
    'react-hooks/exhaustive-deps': 'off', // Ou "off" pour désactiver
    'linebreak-style': 'off',
    // Règles personnalisées
    indent: ['error', 2], // Utiliser 2 espaces pour l'indentation
    semi: ['error', 'never'], // Ne pas utiliser de points-virgules
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ], // Utiliser des guillemets simples pour les chaînes de caractères
  },
}
