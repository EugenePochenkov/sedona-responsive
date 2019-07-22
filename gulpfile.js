const {
  src, dest, parallel, series, watch,
} = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const ghPages = require('gulp-gh-pages');
const server = require('browser-sync').create();

function clean() {
  return del('build');
}

function copy() {
  return src([
    'source/fonts/**/*.{woff,woff2}',
    'source/js/modernizr-custom.js',
  ], {
    base: 'source',
  })
    .pipe(dest('build'));
}

function images() {
  return src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.jpegtran({
        progressive: true,
      }),
      imagemin.optipng({
        optimizationLevel: 3,
      }),
      imagemin.svgo(),
    ]))
    .pipe(dest('build/img'));
}

function webpConvert() {
  return src('source/img/**/*.{png,jpg}')
    .pipe(webp({
      quality: 80,
    }))
    .pipe(dest('build/img'));
}

function compressJs() {
  return src('source/js/app.js')
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .pipe(uglify())
    .pipe(dest('build/js'))
    .on('end', server.reload);
}

function sprite() {
  return src('build/img/icons/*.svg')
    .pipe(svgstore({
      inlineSvg: true,
    }))
    .pipe(rename('sprite.svg'))
    .pipe(dest('build/img'));
}

function cleanSvgWhichInSprite() {
  return del('build/img/icons');
}

function html() {
  return src('source/*.html')
    .pipe(posthtml([
      include(),
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(dest('build'))
    .on('end', server.reload);
}

function style() {
  return src('source/less/style.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      cssnano(),
    ]))
    .pipe(dest('build/css'))
    .pipe(server.reload({
      stream: true,
    }));
}

function serve() {
  return server.init({
    server: {
      baseDir: 'build',
    },
  });
}

function watchFiles() {
  watch('source/less/**/*.less', style);
  watch('source/**/*.html', html);
  watch('source/js/**/*.js', compressJs);
}

function deploy() {
  return src('./build/**/*')
    .pipe(ghPages());
}

exports.default = series(
  clean,
  parallel(
    copy,
    images,
    webpConvert,
    compressJs,
  ),
  sprite,
  cleanSvgWhichInSprite,
  html,
  style,
  parallel(
    watchFiles,
    serve,
  ),
);

exports.deploy = deploy;
