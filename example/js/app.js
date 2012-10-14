$(function() {

    // listen for the configuration to be loaded - will be instant for passed through config object
    Precook.on('preloader:configLoaded', function() {
        Precook.load('SplashScreen');
    });
    
    Precook.on('preloader:completed', function(group) {
        // do something based on the group being completed
        console.log('Completed preloading:', group);

        $('#done').show();
    });

    // initialise preloader and load the config from a file
    Precook.setConfig('preload.json');

});