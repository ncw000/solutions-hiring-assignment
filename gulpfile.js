var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var less = require('gulp-less-sourcemap');
var watchify = require('watchify');
var browserify = require('browserify');
var babel = require('gulp-babel');
var buffer = require('vinyl-buffer');
// Allows browserify output to be sent to other gulp modules
// see http://blog.revathskumar.com/2016/02/browserify-with-gulp.html
var source = require("vinyl-source-stream");
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var fs = require('fs');
var _ = require('lodash');

// Static Server
gulp.task('serve', function() {
    browserSync.init({
        server: "."
    });
});

// Watching scss/less/html files
gulp.task('watch', ['serve', 'sass', 'less'], function() {
    gulp.watch("assets/scss/*.scss", ['sass']);
    gulp.watch("assets/less/*.less", ['less']);
    gulp.watch("*.html").on('change', browserSync.reload);
    gulp.watch("assets/js/*.js", ['react']);
});

// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
// Use gulp-babel to transform React code. Adapted from https://github.com/babel/gulp-babel
// TODO: Probably nix watchify; doesn't seem to make reloads any faster
gulp.task('react', function() {
  let b = watchify(browserify({
      entries: 'assets/js/app.js'
    })
    .transform('babelify', {presets: ['es2015', 'react']}));

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer()) 
    .pipe(concat('all.js'))
    .pipe(gulp.dest('assets/js/dist/'))
    .pipe(browserSync.stream());
});

// Compile SASS into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src("assets/scss/*.scss")
    .pipe(sass({
      sourceComments: 'map',
      sourceMap: 'scss'
    }))
    .pipe(gulp.dest("assets/css"))
    .pipe(browserSync.stream());
});

// Compile LESS into CSS & auto-inject into browsers
gulp.task('less', function() {
  return gulp.src("assets/less/*.less")
    .pipe(less({
      sourceMap: {
        sourceMapRootpath: './assets/less' // Optional absolute or relative path to your LESS files
      }
    }))
    .pipe(gulp.dest("assets/css"))
    .pipe(browserSync.stream());
});


// Merge the retaurants_info.csv and restaurants_list.json datasets into a single file named
// restaurants_data_merged.json
gulp.task('merge-data', function() {
  // Just use readFileSync for easy data reading into a single string.
  // TODO: Does this bottleneck on larger input files? Consider using node's readline module
  // to stream data in from a buffer

  // An array of strings corresponding to rows of data in the CSV file
  const csvLines = fs.readFileSync('resources/dataset/restaurants_info.csv','UTF-8').split('\n');
  // An array of restaurant objects as given in the json file
  const restaurantList = JSON.parse(fs.readFileSync('resources/dataset/restaurants_list.json', 'UTF-8'));

  let sortedRestaurants = _.sortBy(restaurantList, (o) => { return o.objectID; });

  // Ignore the header and the final empty line
  for (var i = 1; i < csvLines.length-1; i++) {
    const line = csvLines[i];
    const lineData = line.split(';');
    const restaurantID = parseInt(lineData[0]);
    const objectIndex = _.sortedIndexBy(sortedRestaurants, {objectID: restaurantID}, function(o) { return o.objectID; });
    const restaurantObj = sortedRestaurants[objectIndex];
    restaurantObj.food_type = lineData[1];
    restaurantObj.stars_count = parseFloat(lineData[2]);
    restaurantObj.reviews_count = lineData[3];
    restaurantObj.neighborhood = lineData[4];
    restaurantObj.phone_number = lineData[5];
    restaurantObj.price_range = lineData[6];
    restaurantObj.dining_style = lineData[7];
  }
  
  let destPath = 'resources/dataset/restaurants_data_merged.json';
  fs.writeFile(destPath, JSON.stringify(sortedRestaurants), 'utf-8', (err) => {
    if (err) throw err;
    console.log('Wrote merged data to ' + destPath);
  });
});


gulp.task('default', ['serve']);
gulp.task('server', ['serve']);
gulp.task('dev', ['watch']);
