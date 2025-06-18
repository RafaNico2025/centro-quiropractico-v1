export default {
  testEnvironment: 'node',
  transform: {}, // <- No usamos Babel
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // permite que los imports .js funcionen
  },
};