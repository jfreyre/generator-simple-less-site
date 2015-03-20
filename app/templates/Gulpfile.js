var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    sass        = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    gutil = require('gulp-util'),
    beep = require('beepbeep')
;

// Reload du ou des navigateurs
gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Lance un serveur web.
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});
// - Compilation des fichiers sass
// - Auto-prefix
// - Minéfaction
// - Reload du navigateur
gulp.task('sass', function () {
    return gulp.src('assets/sass/**/*.scss')
        .pipe(sass({
            onError: function (err) {
                beep(3, 150);
                gutil.log(err);
            }
        }))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});


// Tâche par défaut
// - Surveille les fichiers sass et html
gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch("assets/sass/**/*.scss", ['sass']);
    gulp.watch("assets/sass/**/**/*.scss", ['sass']);
    gulp.watch("*.html", ['bs-reload']);
});