const HtmlWebPackPlugin = require('html-webpack-plugin');
const SassLintPlugin = require('sass-lint-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const walkSync = require('../utils/walkSync');
const Dotenv = require('dotenv-webpack');

// This returns an array with paths to all
// scripts files inside /src/js/ that are
// later given to webpack as an entry point
const scripts = walkSync('src/js')
    .map((scriptPath) => `./${scriptPath}`);

const webpackBaseConfig = {
    entry: {
        main: scripts,
    },
    output: {
        path: path.resolve(__dirname, '../dist/'),
    },
    module: {
        rules: [
            {
                test: /\.twig$/,
                loader: 'twig-loader',
                options: {
                    // See options section below
                },
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                        },
                    },
                ],
            },
            {
                // use enforce flag to make sure that eslint checks unbabeled files
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                    'eslint-loader',
                ],
            },
            {
                test: /\.font\.js/,
                use: [
                    // Needed to insert newly created font
                    // in styles file
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            // Disable url() filtering
                            // https://github.com/webpack-contrib/css-loader#url
                            url: false,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                    },
                    {
                        loader: 'webfonts-loader',
                        options: {
                            // prefix for generated font links in main.css file
                            publicPath: './',
                        },
                    },
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            // Save files with thier original names
                            name: '[name].[ext]',
                            outputPath: 'images',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: 'src/index.html',
            filename: 'index.html',
        }),
        // Plugin allows to lint sa/css files
        // https://www.npmjs.com/package/sass-lint-webpack
        new SassLintPlugin(),
        new MiniCssExtractPlugin({
            // filename allwos styles file
            // to be extracted to separate file
            filename: 'main.css',
        }),
        // If images are only referenced in HTML files as <img> tags
        // webpack won't pick them up by default
        new CopyWebpackPlugin([
            {
                from: 'src/images',
                to: 'images',
            },
            {
                from: 'src/media',
                to: 'media',
            },
            {
                from: 'src/fonts',
                to: 'fonts',
            },
        ]),
        new Dotenv(),
    ],
};


// Following part tells webpack to
// digest every template partial
// given in config object
const templates = walkSync('src/templates');

templates.forEach((template) => {
    webpackBaseConfig.plugins.push(
        new HtmlWebPackPlugin({
            template: template,
            // if the path is 'src/file-name.html.twig'
            // we want to cut 'src/' and '.twig'
            // to cerate new file with correct name
            filename: template.substring(4).slice(0, -5),
        })
    );
});

module.exports = webpackBaseConfig;
