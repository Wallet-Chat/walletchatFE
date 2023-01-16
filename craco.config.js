const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
   webpack: {
      configure: (webpackConfig, { env, paths }) => {
         return {
            ...webpackConfig,
            entry: {
               main: [
                  env === 'development' &&
                     require.resolve('react-dev-utils/webpackHotDevClient'),
                  paths.appIndexJs,
               ].filter(Boolean),
               content: paths.appSrc + '/chrome/content.ts',
               background: paths.appSrc + '/chrome/background.ts',
            },
            output: {
               ...webpackConfig.output,
               filename: 'static/js/[name].js',
            },
            optimization: {
               ...webpackConfig.optimization,
               runtimeChunk: false,
            },
            resolve: {
               extensions: ['.js', '.jsx', '.tsx', '.ts', '.js', '.json'],
               modules: [ path.resolve(__dirname, 'node_modules'), 
                          path.resolve(__dirname, 'src'), ],
               fallback: {
                 assert: require.resolve('assert/'),
                 crypto: false,
                 http: false,
                 https: false,
                 os: false,
                 stream: require.resolve('stream-browserify'),
                 url: require.resolve('url/'),
               },
             },
            module: { rules: [ { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader' } }, 
{ test: /\.(css|scss)$/, use: [ 'style-loader', 'css-loader', 'sass-loader', ] }, 
{ test: /\.(png|svg|jpg|gif)$/, use: [ 'file-loader', ], }, ] }, 
            plugins: [
               ...webpackConfig.plugins,
               new HtmlWebpackPlugin({
                  inject: true,
                  chunks: ['options'],
                  template: paths.appHtml,
                  filename: 'options.html',
               })
            ],
         }
      },
   },
}
