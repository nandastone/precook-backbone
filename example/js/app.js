$(function() {

    precook = new Precook()

    // listen for the configuration to be loaded - will be instant for passed through config object
    precook.on('preloader:configLoaded', function() {
        precook.load('ONE');
    });

    precook.on('preloader:completed', function(group) {
        // do something based on the group being completed
        console.log('Completed preloading 1:', group);

        $('#done').show();
    });

    // initialise preloader and load the config from a file
    precook.setConfig('preload.json');

});