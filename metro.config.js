const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "@convex-dev/auth/react": path.resolve(__dirname, "node_modules/@convex-dev/auth/dist/react/index.js"),
};

module.exports = config;
