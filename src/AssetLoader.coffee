root = exports ? this

AssetLoader =

    _config: null

    # Define our loader types. New loaders can be added here.
    _loaders:
        image: -> new PrecookImage()
        video: -> new PrecookVideo()

    # Used to match asset file extensions to a loader type.
    _types:
        image: ['png', 'jpg', 'jpeg', 'gif']
        video: ['mp4', 'webm', 'ogv']

    _assets: []
    _toLoad: []
    _numToLoad: 0
    _numLoaded: 0
    _group: null
    _groups: []

    ###
        Initialise the AssetLoader with configuration determining the assets to be loaded.
        Fires a callback (preloader:configLoaded) when this process has completed.

        @param {object} source A JSON object of configuration data OR
        @param {string} source A URL to load JSON configuration data from
    ###
    setConfig: (source) ->
        return @_configFromObject source if _.isObject source

        # retrieve the config json from the server
        jsonRequest = $.getJSON source

        # success
        jsonRequest.done (data, event) =>
            if not data.GROUPS?
                throw new Error 'Invalid JSON format passed to the preloader configuration.'

            @_config = data
            @.trigger 'preloader:configLoaded'

        # failure
        jsonRequest.fail (data, event) =>
            # we shouldn't halt the application from displaying if we can't retrieve the preloader
            # configuration. Signal the application to continue.
            @.trigger 'preloader:configLoaded'

        return

    ###
        Actually load a group of assets. Assets for the group are assigned to a loader tpe
        and then loaded. The exact loading functionality is determined by the loader type.

        @param {array} groups. List of key strings detailing groups to be loaded.
    ###
    load: (groups...) -> # load('group1', 'group2') = ['group1', 'group2']    
        # abort loading if there's nothing to load - we don't want to block the app
        return @_finished() if not @_config?

        # make sure the preload group exists in the config
        # TODO: loop and check all exist
        
        for group in groups            
           if not @_config.GROUPS[group]?
               throw new Error 'Invalid group passed to preloader.'
           @_groups.push @_config.GROUPS[group]
        
        @_group = groups[0]
        @_groups = [].concat @_groups...

        
        # merge all groups into single group
        # store all the data from config.GROUPS in @_groups

        @_addAsset asset for asset in @_groups
        @_startLoader asset for asset in @_toLoad

    _configFromObject: (data) ->
        @_config = data
        @.trigger 'preloader:configLoaded'

    _resetLoader: ->
        # remove all assets from memory
        @_removeAsset asset for asset in @_toLoad

        # reset lists
        @_toLoad = []
        @_numToLoad = @_numLoaded = 0
        @_group = null
        @_groups = []

    _removeAsset: (asset) ->
        # disable all events on assets to remove pointers
        asset.off 'asset:completed'

        # set asset to null
        asset = null

    _addAsset: (src) ->
        type = @_determineType src
        if not type
            throw new Error "Unable to determine asset type for #{ src }"

        # create a new asset loader based on the this asset's type
        loader = @_getLoader type
        loader.setSourceFile @_config.BASE_URL + src

        # track the list of assets to load
        @_toLoad.push loader
        @_numToLoad += 1

    _determineType: (file) ->
        extension = file.substr (file.lastIndexOf(".") + 1), file.length

        for type, extensions of @_types
            return type if extension in extensions

        return false

    _getLoader: (type) ->
        return @_loaders[type]()

    _startLoader: (asset) ->
        asset.on 'asset:completed', =>
            @_numLoaded += 1
            @_checkFinished()

        asset.load()

    _checkFinished: ->
        return @_finished() if @_numToLoad is @_numLoaded

    _finished: ->
        currentGroup = @_group

        # memory mgmt
        @_resetLoader()

        @.trigger 'preloader:completed', currentGroup

# mixin eventing methods (on, off, trigger)
_.extend AssetLoader, Backbone.Events

root.Precook = AssetLoader