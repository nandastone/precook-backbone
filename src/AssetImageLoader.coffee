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

        # some browsers will not fire a load event on images if they're cached
        @_checkCached()

    _checkCached: ->
        if @image.complete or @image.complete is undefined
            @complete()

    complete: ->
        $(@image).unbind()
        @.trigger 'asset:completed'


root.PrecookImage = AssetImageLoader