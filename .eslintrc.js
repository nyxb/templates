module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `@nyxb/eslint-config`
  extends: ['@nyxb'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
}
