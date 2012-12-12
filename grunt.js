/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // read some data from package.json file
    pkg: '<json:package.json>',
    // Defines project's meta data
    // the banner is used by minification task and 
    // will be at the beginning of each processed file
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:lib/FILE_NAME.js>'],
        dest: 'dist/FILE_NAME.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/FILE_NAME.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
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
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true,
        define: true,
        require: true
      }
    },
    uglify: {},
    // Define testcular tasks
    testacularServer: {
      unit: {
        options: {
          keepalive: true
        },
        configFile: 'test/testacular.conf.js'
      },
      integration: {
        options: {
          keepalive: true
        },
        configFile: 'test/testacular.conf.js',
        autoWatch: false,
        singleRun: true
      }
    },
    testacularRun: {
      unit: {
        runnerPort: 9100
      }
    }
  });

  // Import the grunt-testacular plugin
  grunt.loadNpmTasks('grunt-testacular');

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

};
