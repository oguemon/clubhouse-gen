// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
const browsersync = require('browser-sync');

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

function compileSass () {
    return gulp.src('./sass/*.scss')
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest('./'))
}

function compileTS () {
    return gulp.src('./ts/*.ts', {base: './'})
            .pipe(webpackStream(webpackConfig, webpack))
            .pipe(gulp.dest('./'));
}

function buildServer (done) {
    browsersync.init({
        proxy: 'https://clubhouse-gen.oguemon.localhost/',
        open:"external",
        online: true,
    });
    done();
}

function browserReload (done){
    browsersync.reload();
    done();
}

function watch () {
    gulp.watch('./**/*.php', gulp.series(browserReload));
    gulp.watch('./sass/*.scss', gulp.series(compileSass, browserReload));
    gulp.watch('./ts/*.ts', gulp.series(compileTS, browserReload));
}

exports.default = gulp.series(buildServer, watch);
exports.compileTS = gulp.series(compileTS);
