$(function() {

    // listen for the configuration to be loaded - will be instant for passed through config object
    Precook.on('preloader:configLoaded', function() {
         preloader.load('SplashScreen');
    });
    
    preloader.on('preloader:completed', function(group) {
        // do something bacsed on the group being completed
        console.log('Completed preloading:', group);
    });

    // initialise preloader and load the config from a file
    preloader.setConfig('preload.json');

});