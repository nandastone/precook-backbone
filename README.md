# precook-backbone
precook is a CoffeeScript preloader implementation. It currently preloads images and HTML5 videos, with the ability to add new asset loader modules.

_precook was written in half a day to solve a specific problem. As such, it doesn't currently offer a great deal of flexibility. Feel free to fork or suggest improvements._

## Requirements
**Backbone.js** - precook has a hard dependency on [Backbone.js](/documentcloud/backbone) as it mixes Backbone.Events into its objects. This could be removed by adding a simple Pubsub implementation.

## Getting started
1. Define the assets to be configured. Assets are grouped for phased preloading.
2. Define the event listeners (config loaded, preloader complete)
3. Load the configuration into the preloader
4. Once configuration is loaded, start preloading an asset group
5. Do something when preloading is finished (blocking preloading), or simply do nothing (non-blocking background preloading)

## Usage
preload.json

```coffeescript
{
    "BASE_URL": "/bundles/hollerapp/assets/",
    
    "GROUPS": {
        
        "SplashScreen": [
            "img/splash/single-1.jpg",
            "img/splash/single-2.jpg"
        ],
        
        "OtherScreens": [
            "img/sprite.png"
        ]
        
    }
}
```

app.coffee

```coffeescript
AssetLoader.on 'preloader:configLoaded', ->
    AssetLoader.load 'SplashScreen'

AssetLoader.on 'preloader:completed', (group) =>
    # kick off your app
```

precook can be configured via an external JSON configuration file, or an inline Javascript object.