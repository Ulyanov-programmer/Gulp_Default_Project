const fileinclude = require('gulp-file-include');

const projectFolder = require('path').basename(__dirname);
const sourceFolder = '#src';

let fs = require('fs');

let paths = {
  build: {
    html: `${projectFolder}/`,
    css: `${projectFolder}/css/`,
    scripts: `${projectFolder}/scripts/`,
    scriptModules: `${projectFolder}/scripts/modules/`,
    images: `${projectFolder}/img/`,
    fonts: `${projectFolder}/fonts/`,
  },
  scr: {
    html: [`${sourceFolder}/*.html`, `!${sourceFolder}/*.htm`],
    css: [`${sourceFolder}/sass/*.sass`, `!${sourceFolder}/sass/_*.sass`],
    scripts: `${sourceFolder}/scripts/*.js`,
    scriptModules: `${sourceFolder}/scripts/modules/*.mjs`,
    images: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
    fonts: `${sourceFolder}/fonts/*`,
  },
  watch: {
    html: [`${sourceFolder}/**/*.html`, `${sourceFolder}/**/*.htm`],
    css: `${sourceFolder}/sass/**/*.sass`,
    scripts: `${sourceFolder}/scripts/**/*.js`,
    scriptModules: `${sourceFolder}/scripts/**/*.mjs`,
    images: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
  },
  clean: `./${projectFolder}/`,
}
let fontsFIlePath = `${sourceFolder}/sass/_fonts.sass`;

let { scr, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileInclude = require('gulp-file-include'),
  del = require('del'),
  gulpSass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  groupMedia = require('gulp-group-css-media-queries'),
  cleanCss = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  cleanJs = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  squoosh = require('gulp-libsquoosh'),
  webpHTML = require('gulp-webp-html-fix');

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: paths.clean,
    },
    port: 3000,
    notify: false,
  });
}
function html() {
  return gulp.src(paths.scr.html)
    .pipe(fileInclude())
    .pipe(webpHTML())
    .pipe(dest(paths.build.html))
    .pipe(browsersync.stream());
}
function css() {
  return gulp.src(paths.scr.css)
    .pipe(gulpSass({
      outputStyle: 'expanded',
    }))
    .pipe(groupMedia())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 5 versions'],
      cascade: true,
    }))
    //save css files
    .pipe(dest(paths.build.css))

    //save cleaning and renaming new css files
    .pipe(cleanCss())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(paths.build.css))
    .pipe(browsersync.stream());
}
function watchFIles() {
  gulp.watch(paths.watch.html, html);
  gulp.watch([paths.watch.css], css);
  gulp.watch([paths.watch.scripts], scripts);
  gulp.watch([paths.watch.scriptModules], scripts);
  gulp.watch([paths.watch.images], images);
}
function clean() {
  return del(paths.clean);
}
function scripts() {
  //? save .js files
  gulp.src(paths.scr.scripts)
    .pipe(fileinclude())

    .pipe(dest(paths.build.scripts))
    .pipe(browsersync.stream());

  //? save .mjs modules
  return gulp.src(paths.scr.scriptModules)
    .pipe(fileinclude())

    //save modules
    .pipe(dest(paths.build.scriptModules))

    //save minimize and renaming new .mjs files
    .pipe(cleanJs())
    .pipe(rename({
      extname: '.min.mjs'
    }))
    .pipe(dest(paths.build.scriptModules))
    .pipe(browsersync.stream());
}
function images() {
  return gulp.src(paths.scr.images)
    .pipe(squoosh({
      webp: {},
    }))
    .pipe(dest(paths.build.images))
    .pipe(gulp.src(paths.scr.images))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3,
    }))
    .pipe(dest(paths.build.images))
    .pipe(browsersync.stream());
}
function fonts() {
  return gulp.src(paths.scr.fonts)
    .pipe(ttf2woff2({
      ignoreExt: true,
    }))
    .pipe(dest(paths.build.fonts));
}

function fontsStyle() {
  let file_content = fs.readFileSync(fontsFIlePath)
    .toString().replace(/\s/g, "");

  if (file_content == "") {
    fs.writeFile(fontsFIlePath, '', () => { });
    return fs.readdir(paths.build.fonts, (err, items) => {

      if (items) {
        let c_fontname;

        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];

          if (c_fontname != fontname) {
            fs.appendFile(fontsFIlePath, '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', () => { });
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

//! Make sure you install the swiper via NPM!
function setupSwiperJs() {
  const modules = [
    'node_modules/swiper/swiper-bundle.min.js',
    'node_modules/swiper/swiper-bundle.min.js.map',
  ];

  return gulp.src(modules)
    .pipe(dest(paths.build.scripts));
};
function setupSwiperCss() {
  const modules = [
    'node_modules/swiper/swiper-bundle.min.css',
  ];

  return gulp.src(modules)
    .pipe(dest(paths.build.css));
};

let build = gulp.series(clean, setupSwiperJs, setupSwiperCss, gulp.parallel(scripts, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFIles, browserSync);

exports.setupSwiperCss = setupSwiperCss;
exports.setupSwiperJs = setupSwiperJs;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.scripts = scripts;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;