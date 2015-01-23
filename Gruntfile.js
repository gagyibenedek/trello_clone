module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      sass: {
        files: ['app/**/*.scss'],
        tasks: ['sass:dist']
      },
      concat: {
        files: ['app/factories/*.js', 'app/components/main.js', 'app/components/*/*.js'],
        tasks: ['concat']
      }
    },
    sass: {
      options: {
        sourceMap: true,
        outputStyle: 'compressed'
      },
      dist: {
        files: {
          'app/dist/app.css': 'app/styles/app.scss'
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['app/components/main.js', 'app/factories/*.js', 'app/components/*/*.js'],
        dest: 'app/dist/app.js'
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '*'
        }
      }
    }
  });
  grunt.registerTask('default', ['concat', 'sass:dist', 'connect', 'watch']);
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
};