var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: ''
    }
  });
});

gulp.task('sass', function() {
  return gulp.src('sass/*.scss')
      .pipe(sass({
        sourcemap: true,
        includePaths: require('node-neat').includePaths
      }))
      .pipe(gulp.dest('css'))
      .pipe(reload({stream:true}));
});

gulp.task('reload', function() {
  browserSync.reload();
});

gulp.task('watch', function() {
  gulp.watch('sass/*.scss', { interval: 500 }, ['sass']);
  gulp.watch('css/**/*.css', { interval: 500 }, ['reload']);
  gulp.watch('js/**/*.js', { interval: 500 }, ['reload']);
  gulp.watch('*.html', { interval: 500 }, ['reload']);
});

gulp.task('default', ['sass', 'serve', 'watch']);