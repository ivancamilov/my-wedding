var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: ''
    }
  });
});

gulp.task('reload', function() {
  browserSync.reload();
});

gulp.task('watch', function() {
  gulp.watch('css/**/*.css', { interval: 500 }, ['reload']);
  gulp.watch('js/**/*.js', { interval: 500 }, ['reload']);
  gulp.watch('*.html', { interval: 500 }, ['reload']);
});

gulp.task('default', ['serve', 'watch']);