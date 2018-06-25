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
debug = require('gulp-debug'),
include = require('gulp-include'),
rename = require('gulp-rename'),
sass = require('gulp-sass');

function getDest() {
  var destination = 'build/';
  switch(argv.env){
    case 'prod':
      destination += 'prod';
      break;
    case 'stag':
      destination += 'stag';
      break;
    default:
      destination += 'dev';
      break;
  }
  return destination;
}

function isBundled(){
  var bundled = argv && argv.hasOwnProperty('bundle');
  return bundled;
}

function getAppSrcArr(source){
  source = source || '';
  return [ source + '/js/**/!(app|router)*.js',  source + '/js/router.js', source + '/js/app.js'];
}

function getLibSrcArr(source){
  source = source || '';
  return  [source + '/lib/es5-shim.min.js',
  (argv.env == 'prod' ? source + '/lib/vue.min.js' : source + '/lib/vue.js'),
  (argv.env == 'prod' ? source + '/lib/vuetify.min.js' : source + '/lib/vuetify.js'),
  (argv.env == 'prod' ? source + '/lib/vue-router.min.js' : source + '/lib/vue-router.js'),
  source + '/lib/es6-shim.min.js',
  source + '/lib/axios.min.js',
  source + '/lib/jquery.min.js',
  source + '/lib/lodash.js'];
}

function getStyleArr(source){
  source = source || '';
  return [source + '/lib/**/*.css', source + '/css/style.css'];
}

gulp.task('lint', function() {
  return gulp.src('source/js/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('bundle-css', function() {
  var source = getStyleArr('source');
  return gulp.src(source)
  .pipe(concat('bundle.css'))
  .pipe(gulp.dest(getDest() + '/css'));
});

gulp.task('bundle-js', function() {
  var source = getAppSrcArr('source');
  return gulp.src(source)
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest(getDest() + '/js'));
});

gulp.task('bundle-lib-js', function() {
  var sourceFiles = getLibSrcArr('source');
  return gulp.src(sourceFiles)
  .pipe(concat('bundle.lib.js'))
  .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('bundle-lib-js-no-jquey', function() {
  var libSrcArr = getLibSrcArr('source');
  var jqueryIndex = libSrcArr.indexOf('source/lib/jquery.min.js');
  libSrcArr.splice(jqueryIndex, 1);
  return gulp.src(libSrcArr)
  .pipe(concat('bundle.lib.no.jquery.js'))
  .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('bundle-lib-css', function() {
  return gulp.src('source/lib/**/*.css')
  .pipe(concat('bundle.lib.css'))
  .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('copy-lib-assets', function(){
  return gulp.src(['source/lib/**/*.{ttf,woff,eof,png,jpg,gif,svg}'])
  .pipe(rename({dirname:'images'}))
  .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('inject-html', function() {
  return gulp.src(getDest() + '/index.html')
    .pipe(debug())
  //inject html tempaltes into index
  .pipe(inject(gulp.src('source/templates/*.html'), {
    starttag: '<!-- inject:templates -->',
    endtag: '<!-- endinject -->',
    transform: function(filePath, file) {
      // return file contents as string
      return file.contents.toString('utf8');
    }
  }))
  .pipe(gulp.dest(getDest() + '/'));
});

gulp.task('inject-css', function() {
  var destination = getDest();
  argv.testing = ((!argv.production && !argv.staging) || argv.testing);
  var source = (isBundled() ? [destination + '/css/bundle.css'] : getStyleArr(destination));
  return gulp.src(getDest() + '/index.html')
  .pipe(debug())
  //inject html tempaltes into index
  .pipe(inject(gulp.src(source), {
    starttag: '<!-- inject:css -->',
    endtag: '<!-- endinject -->',
    transform: function(filepath) {
      //parse out destination filepath
      filepath = filepath.replace('/' + getDest() + '/', '');

      return '<link rel="stylesheet" href="' + filepath + '"></script>';

    }
  }))
  .pipe(gulp.dest(getDest() + '/'));
});

gulp.task('inject-js', function() {
  var destination = getDest();
  argv.testing = ((!argv.production && !argv.staging) || argv.testing);
  var source = (isBundled() ? [destination + '/js/bundle.js'] : getAppSrcArr(destination));
  return gulp.src(getDest() + '/index.html')
  .pipe(debug())
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

gulp.task('inject-lib-js', function() {
  var destination = getDest();
  var source =  (isBundled() ? [destination + '/lib/bundle.lib.js'] : getLibSrcArr(destination));
  return gulp.src(destination+ '/index.html')
  .pipe(debug())
  //inject html tempaltes into index
  .pipe(inject(gulp.src(source), {
    starttag: '<!-- inject:lib-js -->',
    endtag: '<!-- endinject -->',
    transform: function(filepath) {
      //parse out destination filepath
      filepath = filepath.replace('/' + destination + '/', '');
      return '<script src="' + filepath + '"></script>';
    }
  }))
  .pipe(gulp.dest(destination + '/'));
});



gulp.task('prettify', function() {
  gulp.src([getDest() + '/**/*.css', getDest() + '/**/*.html', getDest() + '/**/*.js'])
  .pipe(prettify())
  .pipe(gulp.dest(getDest() + '/'));
});

//Delete destination directory.
//Used pre-build
gulp.task('clean', function() {
  return del([getDest() + '/**'], {force: true});
});

//Delete all js files/folders in js destination directory.
//This is used in combination with bundle-js since our source files are merged.
gulp.task('delete-js', function() {
  return del([getDest() + '/js/**'], {force: true});
});

//copy all files in source directory to destination directory
gulp.task('copy', function() {
  source = [];
//  if(isBundled()){
    source = ['source/*.html'];
//  } else {
//        source = ['source/**/*',  '!source/templates/', '!source/templates/**/*', '!source/css/*.scss'];
  return gulp.src(source)
  .pipe(gulp.dest(getDest()));
});


gulp.task('scss', function(){
  gulp.src('source/css/style.scss')
  .pipe(sass())
  .pipe(gulp.dest('source/css'));
});

gulp.task('copy-assets', function(){
  return gulp.src(['source/assets/**/*'])
  .pipe(gulp.dest(getDest() + '/assets'));
});

gulp.task('copy-css', function(){
  var source = ['source/css/*.css'];
  return gulp.src(source)
  .pipe(gulp.dest(getDest() + '/css'));
});

gulp.task('copy-lib-css', function(){
  var source = ['source/lib/**/*.css'];
  return gulp.src(source)
  .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('copy-js', function(){
  return gulp.src(getAppSrcArr('source'))
  .pipe(gulp.dest(getDest() + '/js'));
});

gulp.task('copy-jquery', function(){
  return gulp.src(['source/lib/jquery.min.js'])
  .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('copy-lib', function(){
  return gulp.src(getLibSrcArr('source'))
  .pipe(gulp.dest(getDest() + '/lib'));
});

gulp.task('watch-styles', function(callback){
  gulp.watch('source/css/*.scss', function(callback){
  //  runSequence('foundation-scss', 'scss');
  runSequence('scss');
  });
});
//auto update source folder
gulp.task('watch-build', function(){
    gulp.watch('source/**/*', ['build']);
});

gulp.task('build', function(callback) {
    var tasks = [/*'clean', */'copy',  'scss'];
    var bundled = isBundled();
    if(bundled){
      tasks.push('bundle-js', 'bundle-lib-js', 'bundle-lib-js-no-jquey', 'bundle-css', 'copy-jquery');
    } else {
      tasks.push( 'copy-css', 'copy-lib-css', 'copy-js', 'copy-lib');
    }
    tasks.push('inject-html','inject-css');
    tasks.push('inject-js', 'inject-lib-js');
    runSequence.apply(null, tasks);
    callback();
});

gulp.task('build-watch', function(callback){
  runSequence('build', 'watch-build');
  callback();
});
