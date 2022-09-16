const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
	devtool: false,
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	},
	output: {
		chunkFilename: (arg) => {
			if (arg.chunk.name.startsWith('font~')) return '[name].ttf';

			return '[name].[contenthash:8].js';
		},
		filename: (arg) => {
			if (arg.chunk.name.startsWith('font~')) return '[name].ttf';

			return '[name].[contenthash:8].js';
		},
		path: path.resolve(__dirname, 'static', 'public', 'script'),
		clean: true
	}
});