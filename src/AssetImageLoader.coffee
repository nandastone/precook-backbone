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

    complete: ->
        $(@image).unbind()
        @.trigger 'asset:completed'


root.AssetImageLoader = AssetImageLoader