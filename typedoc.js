module.exports = {
  src: ['src'],
  out: 'docs',
  mode: 'file',
  exclude: ['**/node_modules/**', '**/*.test.*'],
  readme: 'README.md',
  tsconfig: './tsconfig.json',
  name: 'next-data-component',
  excludePrivate: true,
  ignoreCompilerErrors: true
};
