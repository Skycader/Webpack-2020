const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;
// console.log("IS DEV:", isDev);

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
};

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
    const loaders = [
     
            {
              loader: MiniCssExtractPlugin.loader,
              options: {},
            },
            "css-loader",
       
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders;
}

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
            ],
        plugins: [
            "@babel/plugin-proposal-class-properties"
        ]
      }

    if (preset) {
        opts.presets.push(preset)
    }

    return opts;
}

const jsLoaders = () => {
    const loaders = [{
        loader: "babel-loader",
        options: babelOptions(),   
      }]

    return loaders;
}

module.exports = {
  context: path.resolve(__dirname, "src"),
  mode: "development",
  entry: {
    main: ["@babel/polyfill","./index.jsx"], //it works without polyfill anyway
    analytics: "./analytics.ts",
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".js", ".json", ".png"],
    alias: {
      "@models": path.resolve(__dirname, "src/models"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimization: optimization(),
  devServer: {
    port: 4200,
    hot: isDev,
    static: {
        directory: path.join(__dirname, "src")
      }
  },
//   devtool: isDev ? 'source-map' : '',
  devtool: isProd ? false : 'source-map',
  plugins: [
    new HTMLWebpackPlugin({
      template: "./index.html",
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(),
    new ESLintPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/favicon.ico"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),
  ],
  module: {
    rules: [
      // {
      //     test: /\.css$/,
      //     use: ['style-loader','css-loader'] //goes from right to left
      // },
      {
        test: /\.(jpg|png|svg|gif)$/,
        type: "asset/resource",
      },
      {
        test: /\.(ttf)$/,
        use: ["file-loader"],
      },
      {
        test: /\.xml$/,
        use: ["xml-loader"],
      },
      {
        test: /\.csv$/,
        use: ["csv-loader"],
      },
      {
        test: /\.css$/i,
        use: cssLoaders(),
      },
      {
        test: /\.less$/i,
        use: cssLoaders('less-loader')
      },
      {
        test: /\.s[ac]ss$/i,
        use: cssLoaders('sass-loader')
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: babelOptions('@babel/preset-typescript'),   
        }
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: babelOptions('@babel/preset-react'),   
        }
      }
    ],
  },
};
