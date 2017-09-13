const webpack = require("webpack");
const path = require('path');

module.exports = {
	entry: {
		background: path.join(__dirname, 'src/background.ts'),
		bigquery_statistics: path.join(__dirname, 'src/bigquery_statistics.ts'),
		appengine_log_script: path.join(__dirname, 'src/appengine_log_script.ts'),
		dataflow_price_content_script: path.join(__dirname, 'src/dataflow_price_content_script.ts'),
		"prod-color": path.join(__dirname, 'src/prod-color.ts'),
		storage_preview_script: path.join(__dirname, 'src/storage_preview_script.ts'),
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},
	module: {
		loaders: [{
			exclude: /node_modules/,
			test: /\.tsx?$/,
			loader: 'ts-loader'
		}]
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	plugins: [

		// pack common vender files
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: Infinity
		}),

		// exclude locale files in moment
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

		// minify
		// new webpack.optimize.UglifyJsPlugin()
	]
};
