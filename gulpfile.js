// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const {src, dest, watch, series, parallel } = require('gulp');

// Configuration
const config = {
	localhostPort: 8080,
	scripts: true,     // Turn on/off script tasks
	styles: true,      // Turn on/off styles tasks 
	cacheBust: true   // Turn on/off cacheBust tasks
}

/**
 * File Version
 */

const package = require('./package.json');
function parseVersion(string) {
	return string.split('.').join('-');
}
var fileVersion = config.cacheBust ? '-' + parseVersion(package.version) : '';

// Importing all the Gulp-related packages we want to use
const replace = require('gulp-replace');
const del = require('del');
const rename = require('gulp-rename');
const connect = require('gulp-connect');
const htmlhint = require("gulp-htmlhint");


// Scripts
const jshint  = config.scripts ? require('gulp-jshint') : null;
const stylish = config.scripts ? require('jshint-stylish') : null;
const concat  = config.scripts ? require('gulp-concat') : null;
const uglify  = config.scripts ? require('gulp-uglify-es').default : null;

// Styles
const sass = config.styles ? require('gulp-sass') : null;
const sourcemaps = config.styles ? require('gulp-sourcemaps') : null;
const autoprefixer = config.styles ? require('gulp-autoprefixer') : null;
const cssnano = config.styles ? require('gulp-cssnano') : null;
const postcss = config.styles ? require('gulp-postcss') : null;


// File paths to project folders
const paths = {
	input: 'src',
	output: 'dist',
	scripts: {
		input: 'src/js/*',
		output: 'dist/js'
	},
	styles: {
		input: 'src/scss/**/*.{scss,sass}',
		output: 'dist/css/'
	},
	html: {
		input: 'src/*.html',
		output: 'dist/'
	},
	assets: {
		input: 'src/assets/**/*',
		output: 'dist/assets/'
	}
};

// Cachebust
//var cbString = new Date().getTime(); 
function cacheBust(){
    return src([paths.input + '/index.html'])
        //.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		  .pipe(replace('style.min.css', 'style'+fileVersion+'.min.css'))
		  .pipe(replace('main.min.js', 'main'+fileVersion+'.min.js'))
        .pipe(dest(paths.output));
}


// Delete dist directory
function cleanDist() {
	return del([paths.output]);
};

// CSS Transpile: compiles the style.scss file into style.css
function cssTranspile() {
	if(!config.styles) return;
	
	return src(paths.styles.input)
		.pipe(sourcemaps.init()) // initialize sourcemaps first
		.pipe(sass())  // compile SCSS to CSS		
      .pipe(postcss([autoprefixer, cssnano]))
		.pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
		.pipe(dest(paths.styles.output)) // put final CSS in dist folder
		.pipe(connect.reload());
};

// CSS Minify: minify css and add suffix
function cssMinify(){
	if(!config.styles) return;	
	
	return src(paths.styles.output+'style.css')
		 .pipe(cssnano())		
		 .pipe(rename({
			suffix: fileVersion + ".min"	
		 }))
		 .pipe(dest(paths.styles.output)); // put final CSS in dist folder
}

// JS Transpile: concatenates and uglifies JS files to script.js
function jsTranspile() {
	if(!config.scripts) return;	
	
	return src([paths.scripts.input, '!'+paths.scripts.input+'.min.js'])
		.pipe(concat('main.js'))
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(dest(paths.scripts.output))
		.pipe(connect.reload());
};

// JS Minify: minify js and add suffix
function jsMinify(){
	if(!config.scripts) return;	
	
	return src(paths.scripts.output+'/main.js')	
		 .pipe(uglify())
		 .pipe(rename({	
			suffix: fileVersion + ".min"			
		 }))  // rename to *.min.js
		 .pipe(dest(paths.scripts.output)); // put final js in dist folder
}

// Copy Assets files
function copyAssets() {
	return src([paths.assets.input])
		.pipe(dest(paths.assets.output));
};


// HTML Tasks: copy index.html file
// FIXME: htmlhint didn't catch error
function htmlTask() {
//	return src([paths.html.input])
//		.pipe(htmlhint('.htmlhintrc'))
//		.pipe(dest(paths.html.output))
//		.pipe(connect.reload());
  return src('index.html')
		.pipe(htmlhint('.htmlhintrc'))
		.pipe(connect.reload());
};


// Pug
function pugTask() {
	return src([paths.pug.input])
		.pipe(pug())
		.pipe(dest(paths.pug.output))
}

// run a webserver (with Livereload)
function connectServer(done) {
	var options = {
		root: paths.output,
		port: config.localhostPort,
		livereload: true		
	}
	connect.server(options);
	done()
};

// Watch task: watch SCSS and JS paths for changes
// If any change, run scss and js tasks simultaneously
function watchTask(done) {
	watch('index.html', htmlTask);
	watch(paths.styles.input, series(cssTranspile, cssMinify));
	watch(paths.scripts.input, series(jsTranspile, jsMinify));
	done();
};

// Export the default Gulp task so it can be run
// delete dist, copy vendor files
// Runs the scss and js tasks simultaneously
// then runs connectServer, then watch task
exports.default = series(
	cleanDist,
	parallel(cssTranspile, jsTranspile),
	parallel(cssMinify, jsMinify),
	parallel(htmlTask, copyAssets),
	//cacheBust,
	connectServer,
	watchTask
);

/* Export for testing purpose
   TODO: comment out / remove after testing
  */
exports.cleanDist = cleanDist;
exports.connectServer = connectServer;
exports.cssTranspile = cssTranspile;
exports.cssMinify = cssMinify;
exports.jsTranspile = jsTranspile;
exports.jsMinify = jsMinify;
exports.htmlTask = htmlTask;
exports.pugTask = pugTask;
exports.cacheBust = cacheBust;