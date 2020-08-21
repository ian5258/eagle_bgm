const VueAutoRoutingPlugin = require("vue-auto-routing/lib/webpack-plugin");
const WebpackAutoInject = require("webpack-auto-inject-version");
const GenLocalesWebpackPlugin = require("gen-locales-webpack-plugin");
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const CompressionWebpackPlugin = require("compression-webpack-plugin");

// vue.config.js
module.exports = {
  configureWebpack: config => {
    config.plugins = [...config.plugins, new MomentLocalesPlugin()];

    const development = [
      // gen i18n locales
      new GenLocalesWebpackPlugin({
        path: "./src/plugins/i18n",
        target: "locales.json"
      })
    ];

    const production = [
      new WebpackAutoInject(),
      new CompressionWebpackPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        threshold: 10240,
        minRatio: 0.8
      })
    ];

    if (process.env.NODE_ENV === "production") {
      config.plugins = [...config.plugins, ...production];
    } else {
      config.plugins = [...config.plugins, ...development];
    }

    config.optimization = {
      usedExports: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ["console.log"] // 移除console
            }
          }
        })
      ]
    };
  },
  chainWebpack: config => {
    // webpack-bundle-analyzer
    if (process.env.NODE_ENV !== "production") {
      config
        .plugin("webpack-bundle-analyzer")
        .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin);
    }

    // vue-auto-routing
    config.plugin("vue-auto-routing").use(VueAutoRoutingPlugin, [
      {
        pages: "src/views",
        importPrefix: "@/views/",
        dynamicImport: true
      }
    ]);

    config.plugin("loadshReplace").use(new LodashModuleReplacementPlugin()); // 优化lodash

    return config;
  },
  devServer: {
    disableHostCheck: true,
    https: true,
    proxy: {
      "/api": {
        target: "https://csofans.ap.ngrok.io/api/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/"
        }
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: "@import \"@/styles/_layout.scss\";"
      }
    }
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    },
    i18n: {
      locale: "zh",
      fallbackLocale: "zh",
      localeDir: "locales",
      enableInSFC: true
    }
  }
};
