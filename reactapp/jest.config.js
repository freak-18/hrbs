module.exports = {
  // Ignore everything in node_modules except axios
  transformIgnorePatterns: [
    "/node_modules/(?!(axios)/)"
  ],
};
