const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
	entry: './src/index.tsx',
	devtool: false,
	plugins: [
		new HtmlWebpackPlugin({
			publicPath: '/script/',
			filename: path.resolve(__dirname, 'static', 'index.html'),
			template: path.resolve(__dirname, 'src', 'static', 'production.html')
		})
	],
	resolve: {
		extensions: ['*', '.ts', '.tsx', '.js'],
		plugins: [
			new TsconfigPathsPlugin({
				extensions: ['.js', '.json', '.ts', '.tsx']
			})
		]
	},
	optimization: {
		minimize: true,
	},
	module: {
		rules: [
			{
				test: /\.tsx?/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: {
								localIdentName: '[hash:base64:6]'
							}
						}
					}
				]
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: {
								localIdentName: '[hash:base64:6]'
							}
						}
					}
				, 'sass-loader']
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			"@": path.resolve(__dirname, './src/')
		}
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'public', 'scripts')
	}
};