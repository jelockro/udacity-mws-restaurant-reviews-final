module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            name: 'banner',
            width: 500,
            height: 167,
            suffix: '_1x',
            quality: 20,
            aspectRatio: false
          },{
            name: 'banner',
            width: 1000,
            height: 334,
            suffix: '_2x',
            quality: 40,
            aspectRatio: false
          },{
            name: 'tile',
            width: 300,
            suffix: '_1x',
            quality: 20
          },{
            name: 'tile',
            width: 600,
            suffix: '_2x',
            quality: 40
          }]
        },
        files: [{
          expand: true,
          src: ['**.{gif,jpg,png}'],
          cwd: 'img/',
          dest: 'img/test'
        }]
      }
    },

  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.registerTask('default', ['responsive_images']);
  grunt.loadNpmTasks('grunt-browserify');
  grunt.registerTask('browser', ['grunt-browserify'])

};
