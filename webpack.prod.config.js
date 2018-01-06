const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')

const plugins = [
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({
        title: "Blindfold Chess Trainer",
        template: "./src/htmlTemplate.ejs",
        inject: true
    })
]

if (process.env.NODE_ENV === 'fakerun') {
    plugins.push(new BundleAnalyzerPlugin)
}

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        client: [
            './src/index.ts',
            './src/styles.scss'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist/artifacts'),
        filename: 'bundle-[chunkhash].js'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json", ".css", ".scss"],
        modules: [
            path.resolve('./src/index'),
            'node_modules'
        ]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loaders: ['awesome-typescript-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                use: [{ loader: 'url-loader' }]
            }
        ]
    },

    plugins: plugins
}
