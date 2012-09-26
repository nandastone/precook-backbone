module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        //  project metadata, used by the <banner> directive.
        meta: {},

        // list of files to be minified with UglifyJS.
        min: {
            dist: {
                src: ['src/*.coffee'],
                dest: 'dist/precook.min.js'
            }
        },

        // uglify-js settings
        uglify: {
            mangle: {toplevel: true},
            squeeze: {dead_code: false},
            codegen: {quote_keys: true}
        }

    });

};