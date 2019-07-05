const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WriteBundleFilePlugin = require('./WriteBundleFilePlugin');
const Compression = require('compression-webpack-plugin');

const pathsToClean = [
    'dist'
];

const publicPaths = {
    DEVELOPMENT: 'https://manywho-ui-development.s3.eu-west-2.amazonaws.com/',
    QA: 'https://s3.amazonaws.com/manywho-cdn-react-qa/',
    STAGING: 'https://s3.amazonaws.com/manywho-cdn-react-staging/',
    PRODUCTION: 'https://assets.manywho.com/',
	END2END: 'http://localhost:9000/flow/'
}

const mapPublicPath = (assets, publicPaths) => {

    const assetsKey = typeof assets === 'string' ? assets.toLocaleLowerCase() : null;

    switch (assets) {

        case 'local':
            return publicPaths.LOCAL;

        case 'development':
            return publicPaths.DEVELOPMENT;

        case 'qa':
            return publicPaths.QA;

        case 'staging':
            return publicPaths.STAGING;

        case 'production':
            return publicPaths.PRODUCTION;
		
		case 'end2end':
			return publicPaths.END2END;

        default:
            return publicPaths.PRODUCTION;
    }
}


const config = {
    entry: './js/index.js',
    devtool: 'source-map',
    module: {
        noParse: [new RegExp('node_modules/localforage/dist/localforage.js')],
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    failOnHint: true
                },
            },
            {
                test: /\.less$/,
                use: [
                    {loader: 'style-loader'}, 
                    {loader: 'css-loader'},
                    {loader: 'less-loader'}
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(pathsToClean),
        new UglifyJsPlugin({
            sourceMap: true
        }),
        new Compression({
            filename: '[file]',
            exclude: /bundle\.json/,
            algorithm: 'gzip',
            minRatio: 0.8,
        }),
        new WriteBundleFilePlugin({
            filename: 'offline-bundle.json',
            bundleKey: 'offline',
            pathPrefix: '/',
            // remove sourcemaps from the bundle list
            filenameFilter: filename => !filename.endsWith('.map'),
        }),
    ],
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'js/ui-offline-[chunkhash].js',
    }
};

module.exports = (env) => {
    var defaultDirectory = 'dist';
    const assets = (env && env.assets) ? env.assets : 'production';
    const publicPath = mapPublicPath(assets, publicPaths);

    if (env && env.build)
        defaultDirectory = env.build;

    config.output.path = path.resolve(__dirname, defaultDirectory);
    config.output.publicPath = publicPath + 'js/';
    return config;
};