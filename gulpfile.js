var exec = require('child_process').exec,
  fs = require('fs'),
  path = require('path'),
  extend = require('util')._extend;

var webpack = require('webpack'),
  WebpackDevServer = require("webpack-dev-server"),
  gulp = require('gulp'),
  gulpWebpack = require('gulp-webpack'),
  rename = require('gulp-rename'),
  gutil = require("gulp-util"),
  sass = require('gulp-sass'),
  minifycss = require('gulp-minify-css'),
  browserify = require('browserify'),
  browserSync = require('browser-sync'),
  notify = require('gulp-notify'),
  argv = require('yargs').argv;

var buildConfig = require('./webpack.config.js');

var config = {
  html_src_path: '',
  html_dest_path: '',
  sass_src_path: '',
  sass_dest_path: '',
  js_src_path: '',
  js_dest_path: '',
}

function htmlTask(callback) {
  // Serve files from the root of this project
  gulp.src(config.html_src_path)
    .on('error', gutil.log)
    .pipe(gulp.dest(config.html_dest_path))
    .pipe(browserSync.stream({
      stream: true
    }))
    .on('finish', callback);
}

function sassTask(callback) {
  // Serve files from the root of this project
  gulp.src(config.sass_src_path)
    .pipe(sass())
    .on('error', gutil.log)
    .pipe(rename('app.css'))
    //.pipe(minifycss())
    .pipe(gulp.dest(config.sass_dest_path))
    .pipe(browserSync.stream({
      stream: true
    }))
    .pipe(notify('app.css to build complete'))
    .on('finish', callback);
}

function webpackTask(callback) {
  return gulp.src(config.js_src_path)
    .pipe(gulpWebpack({
      watch: true,
      resolve: {
        extensions: ['', '.js', '.json', '.jsx']
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
        }, {
          test: /\.css$/,
          loader: 'style!css!autoprefixer'
        }, {
          test: /\.scss$/,
          loader: 'style!css!autoprefixer!sass'
        }, ]
      },
      babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }))
    .pipe(rename('app.js'))
    .pipe(gulp.dest(config.js_dest_path))
    .on('finish', callback);
}

gulp.task('default', function() {
  //console.log('webpacK', webpackConfig);
  console.log("file name [" + argv.w + "]")
  if (!argv.w) {
    console.log("need file name");
    return false;
  }

  config = {
    html_src_path: path.join(process.cwd(), 'src', argv.w, 'index.html'),
    html_dest_path: path.join(process.cwd(), 'build', argv.w),
    sass_src_path: path.join(process.cwd(), 'src', argv.w, 'sass', 'main.scss'),
    sass_dest_path: path.join(process.cwd(), 'build', argv.w, 'css'),
    js_src_path: path.join(process.cwd(), 'src', argv.w, 'js', 'main.js'),
    js_dest_path: path.join('build', argv.w, 'js')
  }

  function cb(task){
    console.log(task + " end !");
  }

  htmlTask(cb);
  sassTask(cb);
  webpackTask(cb);

  gulp.watch([path.join(process.cwd(), 'src', argv.w, 'index.html')], gulp.series(htmlTask));
  gulp.watch([path.join(process.cwd(), 'src', argv.w, 'sass', '*.scss')], gulp.series(sassTask));
  gulp.watch([path.join(process.cwd(), 'build', argv.w, 'js', 'app.js')], browserSync.reload);

});



gulp.task("server", function(callback) {
  // Start a webpack-dev-server
  var compiler = webpack({
    output: {
      path: process.cwd() + '/build/'
    },
  });

  new WebpackDevServer(compiler, {
    // server and middleware options
  }).listen(8080, "localhost", function(err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    // Server listening
    gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");

    // keep the server alive or continue?
    // callback();
  });
});