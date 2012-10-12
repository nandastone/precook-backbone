root = exports ? this

class AssetImageLoader

    # mixin eventing methods (on, off, trigger)
    _.extend @prototype, Backbone.Events

    _sourceFile: ''

    constructor: ->

    setSourceFile: (@_sourceFile) ->

    load: ->
        @image = new Image()

        $(@image).bind 'load error', (event) =>
            @complete()

        @image.src = @_sourceFile

        # images can not fire a load event if they're already cache
        @_checkCached()

    _checkCached: ->
        if @image.complete or @image.complete is undefined
            src = @image.src;
            # webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
            # data uri bypasses webkit log warning (thx doug jones)
            @image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            @image.src = src;

    complete: ->
        $(@image).unbind()
        @.trigger 'asset:completed'


root.PrecookImage = AssetImageLoader