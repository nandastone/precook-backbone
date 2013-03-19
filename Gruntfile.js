module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        //  project metadata
        pkg: grunt.file.readJSON('package.json'),

        // compile and concat coffee
        coffee: {
            compile: {
                files: {
                    'dist/<%= pkg.name %>.js': ['src/*.coffee']
                }
            }
        },

        // list of files to be minified with UglifyJS.
        uglify: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
                }
            }
        },

        watch: {
            files: 'src/*.coffee',
            tasks: ['default']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // default singular task
    grunt.registerTask('default', ['coffee', 'uglify']);

};