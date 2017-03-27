/* file: gulpfile.js */
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    prettify = require('gulp-jsbeautifier'),
    argv = require('yargs').argv,
    del = require('del'),
    gulpif = require('gulp-if'),
    runSequence = require('run-sequence'),
    inject = require('gulp-inject'),
    include = require('gulp-include'),
    uglify = require('gulp-uglify');

function getDest() {
    var destination;
    if (argv.production) {
        destination = 'production';
    } else if (argv.staging) {
        destination = 'staging';
    } else {
        destination = 'development';
    }
    return destination;
}


gulp.task('lint', function() {
    return gulp.src('source/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function() {
    return gulp.src(getDest() + '/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(getDest() + '/js'));
})

gulp.task('bundle-js', function() {
    var negatedFiles = argv.nobundle ? argv.nobundle.split(',') : '';
    //argv.testing = ((!argv.production && !argv.staging) || argv.testing);
    var source = ['source/js/models/group.js',
    'source/js/models/user.js',
    'source/js/models/library_groups.js',
    'source/js/models/library_users.js',
        'source/js/views/app.js',
        'source/js/views/error.js',
        'source/js/views/fetchingData.js',
        'source/js/views/group.js',
        'source/js/views/group.edit.js',
        'source/js/views/group.list-item.js',
        'source/js/views/group.user-selector.js',
        'source/js/views/group.users.js',
        'source/js/views/library.js',
        'source/js/views/library.groups.js',
        'source/js/views/library.permissions_available.js',
        'source/js/views/library.permissions_selected.js',
        'source/js/views/library.users.js',
        'source/js/views/library.users_available.js',
        'source/js/views/library.users_selected.js',
        'source/js/views/selectEdit.js',
        'source/js/views/user.edit.js',
        'source/js/views/user.js',
        'source/js/views/user.list-item.js',
        'source/js/views/user.permission-selector.js',
        'source/js/views/user.permissions.js',
        'source/js/data.js',
        'source/js/utility.js',
        'source/js/config.js',
        'source/js/app.js',
        'source/js/routes/*.js',
    ];

    return gulp.src(source)
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(getDest() + '/js'));
});

gulp.task('bundle-lib-js', function() {
    var sourceFiles = ['source/lib/**/*.js'];
    return gulp.src(sourceFiles)
        .pipe(concat('bundle.lib.js'))
        .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('bundle-lib-css', function() {
    return gulp.src('source/lib/**/*.css')
        .pipe(concat('bundle.lib.css'))
        .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('inject-min-js', function() {
    return gulp.src(getDest() + '/index.html')
        //inject html tempaltes into index
        .pipe(inject(gulp.src(getDest() + '/js/bundle.js'), {
            starttag: '<!-- inject:minjs -->',
            endtag: '<!-- endinject -->',
            transform: function(filepath) {
                //parse out destination filepath
                filepath = filepath.replace('/' + getDest() + '/', '');

                return '<script src="' + filepath + '"></script>';

            }
        }))
        .pipe(gulp.dest(getDest() + '/'));
});

gulp.task('inject-html', function() {
    return gulp.src(getDest() + '/index.html')
        // .pipe(debug())
        //inject html tempaltes into index
        .pipe(inject(gulp.src('source/js/templates/*.html'), {
            starttag: '<!-- inject:templates -->',
            endtag: '<!-- endinject -->',
            transform: function(filePath, file) {
                // return file contents as string
                return file.contents.toString('utf8');
            }
        }))
        .pipe(gulp.dest(getDest() + '/'));
});

gulp.task('inject-js', function() {
    var destination = getDest();
    argv.testing = ((!argv.production && !argv.staging) || argv.testing);
    var source = [destination + '/js/models/*.js', destination + '/js/views/*.js', destination + '/js/router.js', destination + '/js/app.js'];
    return gulp.src(getDest() + '/index.html')
        //.pipe(debug())
        //inject html tempaltes into index
        .pipe(inject(gulp.src(source), {
            starttag: '<!-- inject:js -->',
            endtag: '<!-- endinject -->',
            transform: function(filepath) {
                //parse out destination filepath
                filepath = filepath.replace('/' + getDest() + '/', '');

                return '<script src="' + filepath + '"></script>';

            }
        }))
        .pipe(gulp.dest(getDest() + '/'));
});

gulp.task('prettify', function() {
    gulp.src([getDest() + '/**/*.css', getDest() + '/**/*.html', getDest() + '/**/*.js'])
        .pipe(prettify())
        .pipe(gulp.dest(getDest() + '/'));
});

//Delete destination directory.
//Used pre-build
gulp.task('clean', function() {
    return del([getDest() + '/**']);
});

//Delete all js files/folders in js destination directory.
//This is used in combination with bundle-js since our source files are merged.
gulp.task('delete-js', function() {
    return del([getDest() + '/js/**']);
});

//copy all files in source directory to destination directory
//do not copy qasp source or templates (these are injected into index.html)
gulp.task('copy', function() {
    return gulp.src(['source/**/*', '!source/js/templates/**/*'])
        .pipe(gulp.dest(getDest()));
});

// Task Runners
gulp.task('build', function(callback) {
    runSequence('clean', 'copy', 'inject-html', 'inject-js');
});

gulp.task('build-min', function(callback) {
    runSequence('clean', 'copy', 'delete-js', 'bundle-js', 'inject-min-js');
});

gulp.task('build-min-ugly', function(callback) {
    runSequence('clean', 'copy', 'delete-js', 'bundle-js', 'uglify', 'inject-min-js');
});

//auto update dev folder
//When using development, testing mode is always enabled.  Not to be used with web service calls.
gulp.task('development', function(callback) {
    gulp.watch('source/**/*', function(callback) {
        runSequence('copy', 'inject-js');
    });
});
