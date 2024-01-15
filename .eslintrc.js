/* eslint-disable */

module.exports = {
  overrides: [
    {
      files: ["src/service-worker.js"],
      rules: {
        "no-restricted-globals": ["error", "self"]
      }
    }
  ]
};

/* eslint-enable */


