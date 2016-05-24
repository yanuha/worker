// Include Gulp
var     gulp            = require('gulp');
// All of your plugins
var     browserSync     = require('browser-sync');
var     reload          = browserSync.reload;
var     wiredep         = require('wiredep').stream;
var     plumber         = require('gulp-plumber');
var     uglify          = require('gulp-uglify');
var     notify          = require('gulp-notify');
var     del             = require('del');
var     useref          = require('gulp-useref');
// var     sass            = require('gulp-sass');
var     compass         = require('gulp-compass');
var     csso            = require('gulp-csso');
var     cssnano       = require('gulp-cssnano');
var     jadeInheritance = require('gulp-jade-inheritance');
var     jade            = require('gulp-jade');
var     changed         = require('gulp-changed');
var     cached          = require('gulp-cached');
var     gulpif          = require('gulp-if');
var     filter          = require('gulp-filter');
var     svg2png         = require('gulp-svg2png');
var     svgmin          = require('gulp-svgmin');
var     imagemin        = require('gulp-imagemin');
var     pngquant        = require('imagemin-pngquant');

//Browser sync
gulp.task('browser-sync', function() {
    var files = [
        'app/**/*.html',
    ];
    browserSync.init(files, {
        server: {
            baseDir: "app",
            browser: 'google chrome'
        }
    });
});

// Svg2png
gulp.task('svg2png', function () {
    gulp.src('app/img/svg/**/*.svg')
        .pipe(plumber(plumberErrorHandler))
        .pipe(svg2png())
        .pipe(gulp.dest('app/img/png'));
});

// svgmin
gulp.task('svgmin', function () {
    gulp.src('app/img/svg/**/*.svg')
        .pipe(plumber(plumberErrorHandler))
        .pipe(svgmin())
        .pipe(gulp.dest('app/img/svg'));
});


// Clean
gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

// Build
gulp.task('build', ['copym', 'copyico', 'fonts'], function () {
    var assets = useref.assets();
    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cssnano()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('copym', function () {
    return gulp.src(['app/img/**/*.{png,jpg,gif,svg}'])
        .pipe(imagemin({
            progressive: true,
            svgminPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
    gulp.src(['app/favicon/*.{png,ico}'])
        .pipe(gulp.dest('dist/favicon'));
});

// copyico
gulp.task('copyico', function () {
    return  gulp.src(['app/favicon/**/*'])
        .pipe(gulp.dest('dist/favicon'));
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src([
        'app/fonts/**/*.{eot,svg,ttf,woff,woff2}',
        'app/bower_components/fontawesome/fonts/fontawesome-webfont.*'])
    .pipe(gulp.dest('dist/fonts/'));
});

// Bower
gulp.task('bower', function () {
  gulp.src('app/_head.jade')
    .pipe(wiredep({
      directory : "app/bower_components"
    }))
    .pipe(gulp.dest('app'))
    .pipe(notify({ message: 'Bower task complete' }));
});


// Compile HTML from Jade 2
gulp.task('jade', function() {
    var YOUR_LOCALS = {};
    return gulp.src('app/**/*.jade')
        .pipe(plumber(plumberErrorHandler))
        //only pass unchanged *main* files and *all* the partials
        .pipe(changed('app', {extension: '.html'}))

        //filter out unchanged partials, but it only works when watching
        .pipe(gulpif(global.isWatching, cached('jade')))

        //find files that depend on the files that have changed('app
        .pipe(jadeInheritance({basedir: 'app'}))

        //filter out partials (folders and files starting with "_" )
        .pipe(filter(function (file) {
            return !/\/_/.test(file.path) && !/^_/.test(file.relative);
        }))

        //process jade templates
        .pipe(jade({
            locals: YOUR_LOCALS,
            pretty: true
        }))

        //save all the files
        .pipe(gulp.dest('app'))
        .pipe(notify({ message: 'Your Jade file has been molded into HTML.' }));
});
gulp.task('setWatch', function() {
    global.isWatching = true;
});

// Compass
gulp.task('compass', function() {
  gulp.src('app/scss/**/*.scss')
    .pipe(plumber(plumberErrorHandler))
    // .pipe(globbing({
    //     // Configure it to use SCSS files
    //     extensions: ['.scss']
    // }))
    .pipe(compass({
        css: 'app/css',
        sass: 'app/scss',
        img: 'app/img'
    }))
    .pipe(reload({stream:true}))
    .pipe(gulp.dest('app/css'))
    .pipe(notify({ message: 'Compass task complete' }));
});


//the title and icon that will be used for the Grunt notifications
var notifyInfo = {
    title: 'Gulp'
};

//error notification settings for plumber
var plumberErrorHandler = { errorHandler: notify.onError({
        title: notifyInfo.title,
        icon: notifyInfo.icon,
        message: "Error: <%= error.message %>"
    })
};

gulp.task('watch', ['browser-sync', 'compass', 'setWatch', 'jade', 'bower', 'svg2png', 'svgmin'], function() {
    gulp.watch('app/scss/**/*.scss', ['compass'])
    gulp.watch('bower.json', ['bower'])
    gulp.watch('app/**/*.jade', ['setWatch', 'jade'])
    gulp.watch('app/img/*.svg', ['svg2png', 'svgmin']);
});


// Default task to be run with `gulp`
gulp.task('default', ['watch'], function () {

});
