root = exports ? this

class AssetImageLoader

    _sourceFile: ''

    constructor: ->
        # mixin eventing methods (on, off, trigger)
        _.extend @, Backbone.Events

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