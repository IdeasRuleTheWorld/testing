var gulp = require('gulp')
var sass = require('gulp-sass')
var concat = require('gulp-concat')
var accord = require('gulp-accord')
var plumber = require('gulp-plumber')
var browserSync = require('browser-sync')
var postcss = require('gulp-postcss')
var sourcemaps = require('gulp-sourcemaps')
var autoprefixer = require('gulp-autoprefixer')
var jsbeautify = require('gulp-jsbeautify')
var cssbeautify = require('gulp-cssbeautify')

function onError(err){
  console.log.beep();
  console.log(err);
  this.emit('end');
}

/* Jade compile*/

gulp.task('jade-compile', function(){
    gulp.src(['src/jade/pages/**/*.jade'])
      .pipe(plumber())
      .pipe(accord('jade',{pretty:true}))
      .pipe(gulp.dest('app'))
		  .pipe(browserSync.reload({stream:true}))
})

/* image */

gulp.task('image-render',function(){
  gulp.src(['src/images/**/*.jpg','src/images/**/*.png'])
    .pipe(plumber())
    .pipe(gulp.dest('app/content/dam/cognizant_foundation/images'))
})

/* scss compile*/

gulp.task('scss-compile', function(){
  return gulp.src([
    './src/styles/app.scss'
  ])
  .pipe(plumber())
  .pipe(autoprefixer({
    browsers:['last 2 versions'],
    add:true
  }))
  .pipe(sourcemaps.init())
  .pipe(sass({
    includePaths:[
      './bower_components/foundation-sites/scss',
      './bower_components/motion-ui/src/'
    ]
  }))
  .pipe(concat('app.css'))
  .pipe(autoprefixer())
  .pipe(sourcemaps.write())
  .pipe(cssbeautify({
    indent:' ',
    autosemicolon:true
  }))
  .pipe(gulp.dest('./app/css'))
});

/* Js compile
,'src/script/vendor/head-min.js','src/script/vendor/fastclick.js','src/script/vendor/jquery.cookie.js','src/script/vendor/jquery.placeholder.js','src/script/vendor/what-input.min.js','src/script/vendor/motion-ui.min.js','src/script/vendor/jquery.chocolat.min.js','src/script/vendor/jquery.scrollUp.min.js','src/script/vendor/jquery.sumoselect.min.js','src/script/vendor/slick.min.js','src/script/vendor/flatpickr.min.js','src/script/vendor/plyr.js'
*/

gulp.task('js-vendor', function(){
  gulp.src(['src/script/vendor/jquery.min.js','src/script/vendor/foundation.min.js'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('app/js'))
})

gulp.task('js-custom', function(){
  gulp.src(['src/script/app.js'])
    .pipe(concat('custom.js'))
    .pipe(jsbeautify({indentSize: 2}))
    .pipe(gulp.dest('app/js'))
})

/* gulp browser-sync*/

gulp.task('browser-sync', function() {
  return browserSync({
    port: 8088,
    open: false,
    tunnel: false,
    online: true,
    logConnections: true,
    snippetOptions: {
      rule: {
        match: /<browsersync>/i,
        fn: function(snippet, match) {
          return snippet + match;
        }
      }
    },
    files: ['app/**/*', 'docs/styleguide/**/*'],
    server: {
      baseDir: ['app', 'docs']
    }
  });
});

/* gulp watch*/

gulp.task('watch', function(){
  gulp.watch('src/styles/**/*.scss',['scss-compile'])
  gulp.watch('src/jade/**/*.jade',['jade-compile'])
  gulp.watch('src/script/vendor/**/*.js',['js-vendor'])
  gulp.watch('src/script/app.js',['js-custom'])
  gulp.watch(['src/images/**/*.jpg','src/images/**/*.png'],['image-render'])
})

gulp.task('default',['watch','scss-compile','jade-compile','js-vendor','js-custom','image-render','browser-sync'])

/* */
