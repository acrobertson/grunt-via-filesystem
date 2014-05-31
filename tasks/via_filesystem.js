/*
 * grunt-via-filesystem
 *
 */

'use strict';

module.exports = function(grunt) {

    var fs = require('fs');
    var path = require('path');
    var viaEnvironment = require('via-environment');

    /**
     * Creates symbolic link
     *
     * @param {String} srcPath
     * @param {String} destPath
     * @returns {null}
     */
    function createSymbolicLink(srcPath, destPath) {

        var srcAbsolutePath = path.resolve(process.cwd(), srcPath);
        var destAbsolutePath = path.resolve(process.cwd(), destPath);

        if (!grunt.file.exists(srcAbsolutePath) && !grunt.file.isLink(srcAbsolutePath)) {
            grunt.log.error().error('Symbolic link source directory does not exist: ' + srcPath.red);
            return;
        }

        if (!grunt.file.exists(destPath)) {
            grunt.log.write(destPath.cyan + ' -> ' + srcPath.cyan + '... ');
            fs.symlinkSync(srcAbsolutePath, destAbsolutePath);
            grunt.log.ok();
        } else {
            grunt.log.writeln('Destination path already exists: ' + destPath.cyan);
        }

    }

    /**
     * Creates directory and optionally set permissions
     *
     * @param {String} path
     * @param {String} permissions octal
     * @returns {null}
     */
    function createDirectory(path, permissions) {

        if (grunt.file.exists(path)) {
            grunt.log.writeln(path.cyan + ' already exists.');
        } else {
            grunt.log.write(path.cyan + '... ');
            grunt.file.mkdir(path);
            grunt.log.ok();
        }

        if (permissions !== undefined) {
            grunt.log.write('Setting permissions (' + permissions.cyan + '): ' + path.cyan + '... ');
            fs.chmodSync(path, permissions);
            grunt.log.ok();
        }

    }

    grunt.registerTask('via_filesystem', 'Grunt plugin for setting up a project filesystem at Via Studio.', function() {

        //detect environment
        var env = (typeof grunt.forceEnvironment === 'undefined') ? viaEnvironment.getEnvironment() : grunt.forceEnvironment;

        console.log(env);

        //setup config
        var defaultConfig = grunt.config.get('via_filesystem').default;
        var envConfig = grunt.config.get('via_filesystem')[env];

        if (envConfig === undefined) {
            grunt.fail.fatal('No configuration defined for this environment: ' + env);
        }

        var symLinks = (typeof envConfig.symLinks === "undefined") ? defaultConfig.symLinks : envConfig.symLinks;
        var dirs = (typeof envConfig.dirs === "undefined") ? defaultConfig.dirs : envConfig.dirs;

        //create symlinks
        if (symLinks !== undefined && symLinks instanceof Array) {
            grunt.log.subhead("Creating Symbolic Links...");
            symLinks.forEach(function(symLink) {
                createSymbolicLink(symLink.src, symLink.dest);
            });
        } else {
            grunt.log.writeln("No symbolic links defined.");
        }

        //create dirs
        if (dirs !== undefined && dirs instanceof Array) {
            grunt.log.subhead("Creating Directories...");
            dirs.forEach(function(dir) {
                createDirectory(dir.path, dir.permissions);
            });
        } else {
            grunt.log.writeln("No directories defined.");
        }


    });

};
