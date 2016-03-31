var webpack = require('webpack');
var config = {
  entry: '',
  path: '',
  publicPath: '',
  name: ''
};

module.exports = function(config) {
  var release = config.release;
  console.log(config)

  return {
    entry: config.entry,
    output: {
      path: config.path,
      publicPath: config.publicPath,
      filename: 'build.js',
      library: config.filename || "isomorphic"
    },
    cache: !release,
    watch: true,
    debug: !release,
    devtool: false,
    stats: {
      colors: true,
      reasons: !release
    },
    plugins: release ? [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false
      }),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
    ] : [],
    resolve: {
      extensions: ['', '.js', '.jsx'],
      modulesDirectories: ['node_modules', 'bower_components'],
      alias: {
        app: config.app
      }
    },
    module: {
      loaders: [{
        test: /\.vue$/,
        loader: 'vue'
      }, {
        test: /\.js$/,
        // excluding some local linked packages.
        // for normal use cases only node_modules is needed.
        exclude: /node_modules|vue\/src|vue-router\/|vue-loader\/|vue-hot-reload-api\//,
        loader: 'babel'
      }]
    },
    babel: {
      presets: ['es2015'],
      plugins: ['transform-runtime']
    }
  }
};