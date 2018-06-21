module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
//        engine: 'im',
          sizes: [{
            name: 'banner_1x',
            width: '500w',
            suffix: '_1x',
            quality: 20
          },{
            name: 'banner_2x',
            width: '1000w',
            suffix: '_2x',
            quality: 40
          },{
            name: 'tiles_1x',
            width: '300w',
            suffix: '_1x',
            quality: 20
          },{
            name: 'tiles_2x',
            width: '600w',
            suffix: '_2x',
            quality: 40
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: '../img/',
          dest: '../img/images/'
        }]
      }
    },
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.registerTask('default', ['responsive_images']);

};
