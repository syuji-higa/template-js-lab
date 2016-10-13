import gulp from 'gulp';
import gutil from 'gulp-util';
import minimist from 'minimist';
import { File, PluginError, log, replaceExtension } from 'gulp-util';
import { join, relative, dirname, basename } from 'path';
import watch from 'gulp-watch';
import connect from 'gulp-connect-php';
import bs from 'browser-sync';
import runSequence from 'run-sequence';
import pug from 'pug';
import gulpPug from 'gulp-pug';
import stylus from 'gulp-stylus';
import nib from 'nib';
import webpack from 'webpack';
import bower from 'gulp-bower';
import sourcemaps from 'gulp-sourcemaps';
import cache from 'gulp-cached';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';

const argv        = minimist(process.argv.slice(2));
const browserSync = bs.create();


/**
 * directory
 */
const DEST_ROOT = 'htdocs';

const PUG_SRC  = './pug';
const PUG_DEST = DEST_ROOT;

const STYLUS_SRC  = './stylus/src';
const STYLUS_DEST = DEST_ROOT;

const WEBPACK_SRC  = './webpack';
const WEBPACK_DEST = DEST_ROOT;


/**
 * error
 */
const PLUMBER_OPTS = { errorHandler: notify.onError('<%= error.message %>') };


/**
 * default
 */
gulp.task('default', (done) => {
  runSequence([ 'pug', 'stylus', 'webpack' ], 'browser-sync', 'watch', done);
});


/**
 * watch
 */
const watchStart = (files, cb = null) => {
  watch(files, { ignoreInitial: true }, cb);
};

gulp.task('watch', (done) => {
  watchStart([ join(PUG_SRC, '/**/*.pug') ], () => gulp.start('pug'));
  watchStart([ join(STYLUS_SRC, '/**/*.styl') ], () => gulp.start('stylus'));
  watchStart([ join(WEBPACK_SRC, '/**/*.js') ], () => gulp.start('webpack') );
  watchStart([ join(DEST_ROOT, '/**/*.+(html|php|css|js|png|jpg|jpeg|gif|svg)') ], (file) => {
    gulp.src(file.path)
      .pipe(browserSync.reload({ stream: true }));
  });
  done();
});


/**
 * browser-sync
 */
gulp.task('browser-sync', (done) => {
  if(!argv.php) {
    browserSync.init({
      server: {
        baseDir: DEST_ROOT,
      },
      open  : false,
      notify: false,
      reloadOnRestart: true,
      // directory: true,
    }, done);
  }
  else {
    connect.server({
      port: 3002,
      base: DEST_ROOT,
      keepalive: false,
    });
    browserSync.init({
      proxy     : 'localhost:3002',
      open      : false,
      notify    : false,
      reloadOnRestart: true,
    }, done);
  }
});


/**
 * pug
 */
gulp.task('pug', () => {
  return gulp.src(join(PUG_SRC, '/**/*.pug'))
    .pipe(plumber(PLUMBER_OPTS))
    .pipe(cache('pug'))
    .pipe(gulpPug({
      pug    : pug,
      pretty : true,
      basedir: join(__dirname, PUG_SRC),
    }))
    .pipe(gulp.dest(PUG_DEST));
});


/**
 * stylus
 */
gulp.task('stylus', () => {
  return gulp.src(join(STYLUS_SRC, '/**/*.styl'))
    .pipe(plumber(PLUMBER_OPTS))
    .pipe(cache('stylus'))
    .pipe(stylus({
      'include css': true,
      import       : [ 'nib' ],
      use          : [ nib() ],
      compress     : false,
    }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(STYLUS_DEST));
});

/**
 * webpack
 */
gulp.task('webpack', () => {
  return webpack({
    entry: join(__dirname, WEBPACK_SRC, 'main.js'),
    output: {
      path    : join(__dirname, DEST_ROOT),
      filename: 'bundle.js',
    },
    resolve: {
      root      : [ join(__dirname, 'bower_components') ],
      extensions: [ '', '.js' ],
    },
    module: {
      loaders:[{
        test  : /\.js$/,
        loader: 'babel',
        query : {
          presets: [ 'es2015', 'stage-0' ],
          plugins: [ 'transform-object-assign' ],
        },
      }],
    },
    devtool: 'source-map',
    plugins: [
      new webpack.ResolverPlugin(
        new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', [ 'main' ])
      ),
    ],
  }, (err, stats) => {
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString());
  });
});
