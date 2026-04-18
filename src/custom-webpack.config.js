const CompressionPlugin = require("compression-webpack-plugin");
const BrotliPlugin = require("brotli-webpack-plugin");
const Critters = require("critters-webpack-plugin").default;

module.exports = (config, buildOptions) => {
  const isBrowser = buildOptions.target === 'browser';

  if (isBrowser) {
    config.plugins.push(
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new BrotliPlugin({
        asset: "[path].br[query]",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new Critters({
        preload: "swap",
        pruneSource: true,
        compress: true,
      })
    );
  }

  return config;
};
