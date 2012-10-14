(function() {
  var AssetImageLoader, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  AssetImageLoader = (function() {

    _.extend(AssetImageLoader.prototype, Backbone.Events);

    AssetImageLoader.prototype._sourceFile = '';

    function AssetImageLoader() {}

    AssetImageLoader.prototype.setSourceFile = function(_sourceFile) {
      this._sourceFile = _sourceFile;
    };

    AssetImageLoader.prototype.load = function() {
      var _this = this;
      this.image = new Image();
      $(this.image).bind('load error', function(event) {
        return _this.complete();
      });
      this.image.src = this._sourceFile;
      return this._checkCached();
    };

    AssetImageLoader.prototype._checkCached = function() {
      if (this.image.complete || this.image.complete === void 0) {
        return this.complete();
      }
    };

    AssetImageLoader.prototype.complete = function() {
      $(this.image).unbind();
      return this.trigger('asset:completed');
    };

    return AssetImageLoader;

  })();

  root.PrecookImage = AssetImageLoader;

}).call(this);

(function() {
  var AssetLoader, root,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  AssetLoader = {
    _config: null,
    _loaders: {
      image: function() {
        return new PrecookImage();
      },
      video: function() {
        return new PrecookVideo();
      }
    },
    _types: {
      image: ['png', 'jpg', 'jpeg', 'gif'],
      video: ['mp4', 'webm', 'ogv']
    },
    _assets: [],
    _toLoad: [],
    _numToLoad: 0,
    _numLoaded: 0,
    _group: null,
    /*
            Initialise the AssetLoader with configuration determining the assets to be loaded.
            Fires a callback (preloader:configLoaded) when this process has completed.
    
            @param {object} source A JSON object of configuration data OR
            @param {string} source A URL to load JSON configuration data from
    */

    setConfig: function(source) {
      var jsonRequest,
        _this = this;
      if (_.isObject(source)) {
        return this._configFromObject(source);
      }
      jsonRequest = $.getJSON(source);
      jsonRequest.done(function(data, event) {
        if (!(data.GROUPS != null)) {
          throw new Error('Invalid JSON format passed to the preloader configuration.');
        }
        _this._config = data;
        return _this.trigger('preloader:configLoaded');
      });
      jsonRequest.fail(function(data, event) {
        return _this.trigger('preloader:configLoaded');
      });
    },
    /*
            Actually load a group of assets. Assets for the group are assigned to a loader tpe
            and then loaded. The exact loading functionality is determined by the loader type.
    
            @param {string} _group String key for the group to be loaded.
    */

    load: function(_group) {
      var asset, _i, _j, _len, _len1, _ref, _ref1, _results;
      this._group = _group;
      if (!(this._config != null)) {
        return this._finished();
      }
      if (!(this._config.GROUPS[this._group] != null)) {
        throw new Error('Invalid group passed to preloader.');
      }
      _ref = this._config.GROUPS[this._group];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        asset = _ref[_i];
        this._addAsset(asset);
      }
      _ref1 = this._toLoad;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        asset = _ref1[_j];
        _results.push(this._startLoader(asset));
      }
      return _results;
    },
    _configFromObject: function(data) {
      this._config = data;
      return this.trigger('preloader:configLoaded');
    },
    _resetLoader: function() {
      var asset, _i, _len, _ref;
      _ref = this._toLoad;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        asset = _ref[_i];
        this._removeAsset(asset);
      }
      this._toLoad = [];
      this._numToLoad = this._numLoaded = 0;
      return this._group = null;
    },
    _removeAsset: function(asset) {
      asset.off('asset:completed');
      return asset = null;
    },
    _addAsset: function(src) {
      var loader, type;
      type = this._determineType(src);
      if (!type) {
        throw new Error("Unable to determine asset type for " + src);
      }
      loader = this._getLoader(type);
      loader.setSourceFile(this._config.BASE_URL + src);
      this._toLoad.push(loader);
      return this._numToLoad += 1;
    },
    _determineType: function(file) {
      var extension, extensions, type, _ref;
      extension = file.substr(file.lastIndexOf(".") + 1, file.length);
      _ref = this._types;
      for (type in _ref) {
        extensions = _ref[type];
        if (__indexOf.call(extensions, extension) >= 0) {
          return type;
        }
      }
      return false;
    },
    _getLoader: function(type) {
      return this._loaders[type]();
    },
    _startLoader: function(asset) {
      var _this = this;
      asset.on('asset:completed', function() {
        _this._numLoaded += 1;
        return _this._checkFinished();
      });
      return asset.load();
    },
    _checkFinished: function() {
      if (this._numToLoad === this._numLoaded) {
        return this._finished();
      }
    },
    _finished: function() {
      var currentGroup;
      currentGroup = this._group;
      this._resetLoader();
      return this.trigger('preloader:completed', currentGroup);
    }
  };

  _.extend(AssetLoader, Backbone.Events);

  root.Precook = AssetLoader;

}).call(this);

(function() {
  var AssetVideoLoader, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  AssetVideoLoader = (function() {

    _.extend(AssetVideoLoader.prototype, Backbone.Events);

    AssetVideoLoader.prototype._sourceFile = '';

    function AssetVideoLoader() {}

    AssetVideoLoader.prototype.setSourceFile = function(sourceFile) {
      if (Modernizr.video.webm) {
        sourceFile = this._swapExtension(sourceFile, 'webm');
      } else if (Modernizr.video.h264) {
        sourceFile = this._swapExtension(sourceFile, 'mp4');
      } else if (Modernizr.video.ogg) {
        sourceFile = this._swapExtension(sourceFile, 'ogv');
      }
      return this._sourceFile = sourceFile;
    };

    AssetVideoLoader.prototype._swapExtension = function(file, extension) {
      var filename;
      filename = file.substr(0, file.lastIndexOf("."));
      return "" + filename + "." + extension;
    };

    AssetVideoLoader.prototype.load = function() {
      var _this = this;
      this.video = $("<video/>", {
        src: this._sourceFile,
        preload: 'auto'
      });
      return $(this.video).bind('canplaythrough load error', function(event) {
        return _this.complete();
      });
    };

    AssetVideoLoader.prototype.complete = function() {
      $(this.video).unbind();
      return this.trigger('asset:completed');
    };

    return AssetVideoLoader;

  })();

  root.PrecookVideo = AssetVideoLoader;

}).call(this);
