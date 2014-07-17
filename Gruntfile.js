/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
      },
      files: [
        "Gruntfile.js",
        "bower.json",
        "package.json",
      ],
      lib: {
        options: {
          browser: true,
          predef: ['define']
        },
        src: "src/**/*.js",
      }
    },
    jsdoc: {
      dist: {
        src: "<%= jshint.lib.src %>",
        options: {
          destination: "api"
        }
      }
    },
    watch: {
      jshint: {
        files: "<%= jshint.files  %>",
        tasks: ["jshint"]
      },
      lib: {
        files: "<%= jshint.lib.src %>",
        tasks: ["jshint:lib"]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-jsdoc");

  // Default task.
  grunt.registerTask("default", ["jshint"]);
};
