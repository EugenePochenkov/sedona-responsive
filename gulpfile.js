const gulp = require('gulp');
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
const pipeline = require('readable-stream');
const ghPages = require('gulp-gh-pages');
const server = require('browser-sync').create();


gulp.task('clean', () => del('build'));


gulp.task('copy', () => gulp.src([
  'source/fonts/**/*.{woff,woff2}',
  'source/js/**/*.js',
], {
  base: 'source',
})
  .pipe(gulp.dest('build')));


gulp.task('images', () => gulp.src('source/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.jpegtran({
      progressive: true,
    }),
    imagemin.optipng({
      optimizationLevel: 3,
    }),
    imagemin.svgo(),
  ]))
  .pipe(gulp.dest('build/img')));


gulp.task('webp', () => gulp.src('source/img/**/*.{png,jpg}')
  .pipe(webp({
    quality: 80,
  }))
  .pipe(gulp.dest('build/img')));


gulp.task('compress', done => pipeline(
  gulp.src('build/js/*.js'),
  babel(),
  uglify(),
  gulp.dest('build/js').on('end', server.reload),
  done(),
));


gulp.task('sprite', () => gulp.src('build/img/icons/*.svg')
  .pipe(svgstore({
    inlineSvg: true,
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img')));


gulp.task('cleanSvgWhichInSprite', () => del('build/img/icons'));


gulp.task('html', () => gulp.src('source/*.html')
  .pipe(posthtml([
    include(),
  ]))
  .pipe(htmlmin({
    collapseWhitespace: true,
  }))
  .pipe(gulp.dest('build'))
  .on('end', server.reload));


gulp.task('style', () => gulp.src('source/less/style.less')
  .pipe(plumber())
  .pipe(less())
  .pipe(postcss([
    autoprefixer(),
    cssnano(),
  ]))
  .pipe(gulp.dest('build/css'))
  .pipe(server.reload({
    stream: true,
  })));


gulp.task('serve', () => server.init({
  server: {
    baseDir: 'build',
  },
}));


gulp.task('watch', () => {
  gulp.watch('source/less/**/*.less', gulp.series('style'));
  gulp.watch('source/**/*.html', gulp.series('html'));
  gulp.watch('source/js/**/*.js', gulp.series('compress'));
});


gulp.task('default', gulp.series('clean',
  gulp.parallel('copy', 'images', 'webp', 'compress'), 'sprite', 'cleanSvgWhichInSprite', 'html', 'style', gulp.parallel('watch', 'serve')));


gulp.task('deploy', () => gulp.src('./build/**/*')
  .pipe(ghPages()));
