import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import ts from 'gulp-typescript';

gulp.task('ts', function () {
  return gulp.src('./source/ts/*.ts')
    .pipe(ts({
      noImplicitAny: true,
    }))
    .pipe(gulp.dest('./source/js'));
});

gulp.task('sass', function () {
  return gulp.src('./source/scss/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./source/css'));
});

gulp.task('default', ['sass', 'ts'], function () {
  gulp.watch('./source/scss/*.scss', ['sass']);
  gulp.watch('./source/js/*.ts', ['ts']);
});
