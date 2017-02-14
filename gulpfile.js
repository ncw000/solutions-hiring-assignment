var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var less = require('gulp-less-sourcemap');
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
    // Added a watch for javascript that calls our React compilation step. This will reload the website
    // when a React component file changes.
    // TODO: Consider hooking this into browserSync
    gulp.watch(["assets/js/*.js","assets/js/components/*.js"], ['react']);
});

// Use gulp-babel to transform React code. Adapted from https://github.com/babel/gulp-babel and
// // https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
gulp.task('react', function() {
  // Init browserify with our main piont of entry (app.js) and the correct babel presets, via babelify
  let b = browserify({
      entries: 'assets/js/app.js'
    })
    .transform('babelify', {presets: ['es2015', 'react']});

  // Bundle the transformed js files together into a single bundle, collapsing JS imports by including 
  // required packages by using what's installed via NPM.
  // So,  'import React from 'react';' causes the react package to be grabbed from node_modules, etc
  return b.bundle()
    // Print errors
    // http://latviancoder.com/story/error-handling-browserify-gulp
    .on('error', function (err) {
      console.log(err.toString());
      this.emit('end');
    })
    // I'll admit this is still a bit black magic-y to me. Coerce the bundle() output into the fright transform
    // for concatenating the above output files into a single 'all.js' file
    // TODO: Investigate if the above is actually generating multiple files, or if this is an extra step
    .pipe(source('app'))
    .pipe(buffer()) 
    .pipe(concat('all.js'))
    // Output all.js to dist, and stream via browsersync
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
  /* Read the data in from both the .csv and the .json. For this exercise, both files contain data for the
   * same 5000 restaurants, one entry per restaurant in each file.
   * While the approach is a bit clumsy, we parse the json file into an object and then modifiy each restaurant
   * object's data to include the data given in the csv. Then, convert that back into JSON (an array of objects)
   * and write to disk */

  // To keep things simple, we just use readFileSync for easy data reading into a single string.
  // TODO: Does this bottleneck on larger input files? Consider using node's readline module
  // to stream data in from a buffer

  // An array of strings corresponding to rows of data in the CSV file
  const csvLines = fs.readFileSync('resources/dataset/restaurants_info.csv','UTF-8').split('\n');
  // An array of restaurant objects as given in the json file
  const restaurantList = JSON.parse(fs.readFileSync('resources/dataset/restaurants_list.json', 'UTF-8'));

  // Sort the restaurants so that we can more efficiently look up members by object ID via a binary search
  let sortedRestaurants = _.sortBy(restaurantList, (o) => { return o.objectID; });

  // Ignore the header and the final empty line
  for (var i = 1; i < csvLines.length-1; i++) {
    // Get this line
    const line = csvLines[i]; 
    // Oddly, the restaurants csv is semicolon delimited, not comman delimited
    const lineData = line.split(';');
    // Get the object ID for this restaurant as an int. This is then used to do a binary search for the relevant restaurant
    // object in the objects list via  binary search.
    // NOTE: There are definitely more efficient solutions from an algorithmic complexity perspective. For instance,
    // you could sort both data lists and walk through them in sync. But, this serves the purpose for a once-off script
    const restaurantID = parseInt(lineData[0]);
    // Get the index of the restaurant object via binary search, and get the object
    const objectIndex = _.sortedIndexBy(sortedRestaurants, {objectID: restaurantID}, function(o) { return o.objectID; });
    const restaurantObj = sortedRestaurants[objectIndex];
    // Modify the object to include the new properties imported from the csv
    restaurantObj.food_type = lineData[1];
    restaurantObj.stars_count = parseFloat(lineData[2]); // Parse this count as a float to enable numerical attribute searches via Algolia
    restaurantObj.reviews_count = lineData[3];
    restaurantObj.neighborhood = lineData[4];
    restaurantObj.phone_number = lineData[5];
    restaurantObj.price_range = lineData[6];
    restaurantObj.dining_style = lineData[7];
  }
  
  // Write this file back out to disk
  let destPath = 'resources/dataset/restaurants_data_merged.json';
  fs.writeFile(destPath, JSON.stringify(sortedRestaurants), 'utf-8', (err) => {
    if (err) throw err;
    console.log('Wrote merged data to ' + destPath);
  });
});


gulp.task('default', ['serve']);
gulp.task('server', ['serve']);
gulp.task('dev', ['watch']);
