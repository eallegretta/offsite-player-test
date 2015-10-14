'use strict';
var distFolder = 'dist',
	gulp = require('gulp'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    inject = require('gulp-inject'),
    jshint = require('gulp-jshint'),
    uglyfly = require('gulp-uglyfly'),
    lintReporter = require('jshint-stylish'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat'),
    rev = require('gulp-rev'),
    clean = require('gulp-clean'),
    minifyCss = require('gulp-minify-css'),
    templateScriptsFile = 'Views/Home/ScriptsBundle.template.cshtml',
    destScriptsFile = 'Views/Home/ScriptsBundle.versioned.cshtml',
    templateCssFile = 'Views/Home/CssBundle.template.cshtml',
    destCssFile = 'Views/Home/CssBundle.versioned.cshtml',
    homePath = '/Areas/OffsitePlayer',
    lessFiles = ['styles/player.less'],
    jsPlayerFiles = ['scripts/MinimumM.js',
                     'scripts/**/*.js'];


gulp.task('injectDevFiles', function () {
    var sources = gulp.src(jsPlayerFiles, { read: false });

    return gulp.src(templateScriptsFile)
				.pipe(rename(destScriptsFile))
				.pipe(inject(sources, { addPrefix: homePath }))
				.pipe(gulp.dest('.'));
});


gulp.task('cleanDist', function () {
    return gulp.src(distFolder, { read: false }).pipe(clean({ force: true })); //clean
});

gulp.task('less', ['cleanDist'], function () {
   var sources = gulp.src(lessFiles)
    		.pipe(less())
            .on('error', notify.onError(function (error) {
                return {
                    message: error.message,
                    title: 'Offsite player less error'
                };
            }))
    		.pipe(gulp.dest(distFolder));

   return gulp.src(templateCssFile)
          .pipe(rename(destCssFile))
          .pipe(inject(sources, { addPrefix: homePath }))
          .pipe(gulp.dest('.'));
});

gulp.task('lint', function() {
    var filesToLint = jsPlayerFiles.concat(['gulpfile.js']);
    return gulp.src(filesToLint)
    		.pipe(jshint())
    		.pipe(jshint.reporter(lintReporter))
    		.pipe(jshint.reporter('fail')) //fails the stream when an error is found
    		.on('error', notify.onError(function (error) {
        		return { message: error.message,
        				 title: 'Offsite player lint error'};
      		})); 
});

gulp.task('bundleJs', function(){
    var sources = gulp.src(jsPlayerFiles)
    				.pipe(concat('bundle.js'))
    				.pipe(rev())
    				.pipe(uglyfly())
    				.pipe(gulp.dest(distFolder));

    return gulp.src(templateScriptsFile)
    		.pipe(rename(destScriptsFile))
      		.pipe(inject(sources, { addPrefix: homePath }))
      		.pipe(gulp.dest('.'));
});

gulp.task('bundleStyles', ['cleanDist'], function () {
  var sources = gulp.src(lessFiles)
            .pipe(less())
            .pipe(rev())
            .pipe(minifyCss({ compatibility: 'ie8' }))
    		.pipe(gulp.dest(distFolder));

  return gulp.src(templateCssFile)
    .pipe(rename(destCssFile))
    .pipe(inject(sources, { addPrefix: homePath }))
    .pipe(gulp.dest('.'));
});

//Main tasks
gulp.task('watch', function(){
	var listToWatch = lessFiles.concat(jsPlayerFiles); 
	var watcher = gulp.watch(listToWatch, ['default']);
	watcher.on('change', function(event) {
  		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});	
});

gulp.task('default', ['lint', 'less', 'injectDevFiles']);
gulp.task('build:Debug', ['default']);
gulp.task('build:Release', ['default']); //['lint', 'bundleStyles', 'bundleJs']);