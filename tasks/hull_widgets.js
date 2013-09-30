module.exports = function (grunt) {
  "use strict";

  var basename = require("path").basename;

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  var widgetsSrc,
      widgetNamespace,
      tmpDir = 'tmp',
      destinationPath,
      uglifyWidgetsFiles,
      concatWidgetsFiles,
      copyWidgetsFiles,
      handlebarsWidgetsFiles,
      optimize;

  /**
   * Generates all the object literals that will be needed to manipulate
   * the widgets sources in order to generate a minified widget file
   */
  function generateFilesPath() {
    handlebarsWidgetsFiles = {};
    concatWidgetsFiles = {};
    uglifyWidgetsFiles = {};
    copyWidgetsFiles = {};

    var widgetsDirs = grunt.file.glob.sync([process.cwd(), widgetsSrc, "**/main.js"].join('/')).map(function (f) {
      var arr = f.split('/');
      arr.pop();
      return arr.join('/');
    });
    widgetsDirs.forEach(function (widgetPath) {
      widgetPath = widgetPath.replace(process.cwd() + '/', '');
      //Handlebars templates
      var destTemplatePath = [tmpDir, widgetPath, "templates.js"].join('/');
      var templatesFiles = [widgetPath, "**", "*.hbs"].join('/');
      handlebarsWidgetsFiles[destTemplatePath] = templatesFiles;
      //concat Files
      var destConcatPath = [tmpDir, widgetPath, "main.js"].join('/');
      var srcConcatFiles = [[tmpDir, widgetPath, "templates.js"].join('/'), [widgetPath, 'main.js'].join('/')];
      concatWidgetsFiles[destConcatPath] = srcConcatFiles;
      //Uglify
      var destUglifyPath = [destinationPath, widgetPath, 'main.js'].join('/');
      var srcUglifyFiles = [tmpDir, widgetPath, 'main.js'].join('/');
      uglifyWidgetsFiles[destUglifyPath] = srcUglifyFiles;
      //Copy
      var destCopyPath = [destinationPath, widgetPath].join('/');
      var srcCopyFiles = [['**', '*.js'].join('/'), '!main.js'];
      copyWidgetsFiles[widgetPath] = {
        expand: true,
        src: srcCopyFiles,
        cwd: widgetPath,
        dest: destCopyPath
      };
      grunt.log.warn(destCopyPath);
    });
  }



  /**
   * This task is supposedly the only one to be called from a Gruntfile.js
   * It has many options:
   *
   * * `src`: The root path for the widgets. Defaults to `widgets`
   * * `dest`: The root path for the built widgets. Defaults to `dist`
   * * `namespace`: The namespace in which the templates will be registered. It will be Hull.templates.%namespace%i. Defaults to `_default`
   * * `before`: An array of tasks to be executed before the compilation begins. These tasks will run after the cleaning of `dest` and before the first internal _actual_ build task
   * * `after`: An array of tasks to be executed after the building is done.
   */
  grunt.registerMultiTask('hull_widgets', 'Compile Hull.io widgets for production.', function () {
    widgetsSrc = this.data.src || 'widgets';
    destinationPath = this.data.dest || "dist";
    widgetNamespace = this.data.namespace || "_default";
    optimize = this.data.hasOwnProperty('optimize') ? this.data.optimize : true;

    var tasks = ['__moveConfig', 'clean'];
    tasks = tasks.concat(this.data.before || []);
    tasks = tasks.concat(['handlebars', 'concat', 'uglify', 'copy']);
    tasks = tasks.concat(this.data.after || []);
    tasks = tasks.concat(['__restore']);

    generateFilesPath();
    grunt.task.run(tasks);
  });



  /**
   * In this task, the config for the building tasks is built from the given configuration
   * The tasks that are used are renamed to avoid to override a potentially existing configuration
   * in the caller Gruntfile.js
   */
  grunt.registerTask('__moveConfig', 'Restores the initial Grunt config', function () {
    grunt.config.set('__hull_widgets_clean', {
      widgets: {
        src: ['tmp']
      }
    });
    grunt.config.set('__hull_widgets_handlebars', {
      widgets: {
        options: {
          wrapped: false,
          namespace: "Hull.templates." + widgetNamespace,
          processName: function (filename) {
            return filename.replace(widgetsSrc + "/", "").replace(/\.hbs$/, '');
          }
        },
        files: handlebarsWidgetsFiles
      }
    });
    grunt.config.set('__hull_widgets_concat', {
      widgets: {
        options: {
          stripBanners: true,
        },
        files: concatWidgetsFiles
      }
    });
    grunt.config.set('__hull_widgets_uglify', {
      widgets: {
        files: uglifyWidgetsFiles
      },
      options: {
        mangle: optimize,
        compress: optimize,
        beautify: !optimize,
        preserveComments: optimize ? false : 'all'
      }
    });
    grunt.config.set('__hull_widgets_copy',
      copyWidgetsFiles
    );

    grunt.renameTask('clean', '__hull_widgets_clean');
    grunt.renameTask('handlebars', '__hull_widgets_handlebars');
    grunt.renameTask('concat', '__hull_widgets_concat');
    grunt.renameTask('uglify', '__hull_widgets_uglify');
    grunt.renameTask('copy', '__hull_widgets_copy');
  });




  /**
   * Here, we restore the names of the tasks
   */
  grunt.registerTask('__restore', 'Restores the initial Grunt config', function () {
    grunt.renameTask('__hull_widgets_clean', 'clean');
    grunt.renameTask('__hull_widgets_handlebars', 'handlebars');
    grunt.renameTask('__hull_widgets_concat', 'concat');
    grunt.renameTask('__hull_widgets_uglify', 'uglify');
    grunt.renameTask('__hull_widgets_copy', 'copy');
  });
};

