const babelPolyfill = require("babel-polyfill");
const del = require('del');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const clean_css = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babelify = require('babelify');

const dirs = {
    src: 'src',
    dest: 'build'
};

const clean = () => del(['build']);  
const build_html = () => {
    return gulp.src([ `${dirs.src}/public/*.html` ])
        .pipe(gulp.dest(`${dirs.dest}/public/`));
};

const build_css_source = (source) => {
    return gulp.src([
        `${dirs.src}/public/css/styles.css`
        ])
        .pipe(clean_css({ sourceMap: true}))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(concat(`${source}.min.css`))
        .pipe(gulp.dest(`${dirs.dest}/public/css`));
};


// const build_css_source = (source) => {
//     return gulp.src([
//             `${dirs.src}/public/css/styles.css`,
//             //`${dirs.src}/public/css/${source}.css`,
//             //`${dirs.src}/public/css/toast.css`
//         ])
//         .pipe(clean_css({ sourceMap: true }))
//         .pipe(autoprefixer('last 2 version'))
//         .pipe(concat(`${source}.min.css`))
//         .pipe(gulp.dest(`${dirs.dest}/public/css`));
// }

const build_css_index = () => build_css_source('index');
const build_css_restaurant = () => build_css_source('restaurant');

const build_css = gulp.series(build_css_index, build_css_restaurant);
//
//  Bundle each js file and send it to the build folder, I am not trying to optimize
//  or modularize at this moment.
//
// const build_scripts = () => {
//     return browserify(`${dirs.src}/public/js/*.js`, { debug: true })
//         //.transform('babelify')
//         .bundle()
//         // .pipe(source(filename))
//         // .pipe(buffer())
//         // .pipe(sourcemaps.init({ loadMaps: true }))
//         // .pipe(uglify())
//         //.pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest(`${dirs.dest}/public/js`));
// };

const build_db = (file) => {
   return browserify(`${dirs.src}/public/${file}`, { debug: true })
    //.transform('babelify')
    .bundle()
    .pipe(source(`${file}`))
    // .pipe(buffer())
    // .pipe(sourcemaps.init({ loadMaps: true }))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${dirs.dest}/public`));
};

const build_js = (file) => {

   return browserify(`${dirs.src}/public/js/${file}`, { debug: true })
    //.transform('babelify')
    .bundle()
    .pipe(source(`${file}`))
    // .pipe(buffer())
    // .pipe(sourcemaps.init({ loadMaps: true }))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${dirs.dest}/public/js`));

};

//const build_js_db= () => build_db('dbhelper.js');
//const build_jsscripts = () => build_js('main.js');

//const build_scripts = gulp.parallel(build_js_db, build_jsscripts);

const copy_static = () => {
    return gulp.src([
        `${dirs.src}/public/**/*.json`,
        `${dirs.src}/public/img/**/*.jpg`,
        `${dirs.src}/public/img/**/*.ico`,
        `${dirs.src}/public/img/**/*.png`,
        `${dirs.src}/public/img/**/*.svg`,
        `${dirs.src}/server.js`,
        `${dirs.src}/public/js/main.js`,
        `${dirs.src}/public/js/register.js`,
        `${dirs.src}/public/js/restaurant_info.js`,
        `${dirs.src}/public/js/idb.js`,
        `${dirs.src}/public/sw.js`,
        `${dirs.src}/public/js/dbhelper.js`

    ],  {base: dirs.src}) 
    .pipe(gulp.dest(`${dirs.dest}`));
};

const build_all = gulp.series(clean, build_html, build_css, copy_static);
gulp.task('watch', () => {
    gulp.watch([dirs.src], build_all);
});

gulp.task('default', gulp.series(build_all, 'watch'), () => {
    console.log('Development started');
});

