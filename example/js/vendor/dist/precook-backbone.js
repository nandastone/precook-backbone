(function() {
  var AssetImageLoader, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  AssetImageLoader = (function() {

    AssetImageLoader.prototype._sourceFile = '';

    function AssetImageLoader() {
      _.extend(this, Backbone.Events);
    }

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
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  AssetLoader = (function() {
    var asset, _i, _j, _len, _len1, _ref, _ref1, _ref2;

    AssetLoader.prototype._loaders = {
      image: function() {
        return new PrecookImage;
      },
      video: function() {
        return new PrecookVideo;
      }
    };

    AssetLoader.prototype._types = {
      image: ['png', 'jpg', 'jpeg', 'gif'],
      video: ['mp4', 'webm', 'ogv']
    };

    function AssetLoader() {
      this._config = null;
      this._toLoad = [];
      this._numToLoad = 0;
      this._numLoaded = 0;
      this._group = '';
      this._groups = [];
      _.extend(this, Backbone.Events);
    }

    /*
        Initialise the AssetLoader with configuration determining the assets to be loaded.
        Fires a callback (preloader:configLoaded) when this process has completed.
    
        @param {object} source A JSON object of configuration data OR
        @param {string} source A URL to load JSON configuration data from
    */


    AssetLoader.prototype.setConfig = function(source) {
      var jsonRequest,
        _this = this;
      if (_.isObject(source)) {
        return this._configFromObject(source);
      }
      jsonRequest = $.getJSON(source);
      jsonRequest.done(function(data, event) {
        if (data.GROUPS == null) {
          throw new Error('Invalid JSON format passed to the preloader configuration.');
        }
        _this._config = data;
        return _this.trigger('preloader:configLoaded');
      });
      jsonRequest.fail(function(data, event) {
        return _this.trigger('preloader:configLoaded');
      });
    };

    /*
        Actually load a group/s of assets. Assets for the group are assigned to a loader tpe
        and then loaded. The exact loading functionality is determined by the loader type.
    
        @param {array} groups Array of group key strings to be loaded.
    */


    AssetLoader.prototype.load = function() {
      var group, groups, _i, _len;
      groups = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this._config == null) {
        return this._finished();
      }
      for (_i = 0, _len = groups.length; _i < _len; _i++) {
        group = groups[_i];
        if (this._config.GROUPS[group] == null) {
          console.log('loading group', group, this._config.GROUPS);
          throw new Error('Invalid group passed to preloader.');
        }
      }
      return this._groups.push(this._config.GROUPS[group]);
    };

    AssetLoader._group = groups[0];

    AssetLoader._groups = (_ref = []).concat.apply(_ref, AssetLoader._groups);

    _ref1 = AssetLoader._groups;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      asset = _ref1[_i];
      AssetLoader._addAsset(asset);
    }

    _ref2 = AssetLoader._toLoad;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      asset = _ref2[_j];
      AssetLoader._startLoader(asset);
    }

    /*
     * [newLoader expose a Loader to be used for a set of file extensions]
     * @param  {[object]} config { type: 'image', loader: PrecookVideo, types: ['png', 'jpg', 'jpeg', 'gif'] }
     * @return {}
    */


    AssetLoader.prototype.newLoader = function(config) {
      this._loaders[config.type] = function() {
        return new config.loader;
      };
      return this._types[config.type] = config.types;
    };

    AssetLoader.prototype._configFromObject = function(data) {
      this._config = data;
      return this.trigger('preloader:configLoaded');
    };

    AssetLoader.prototype._resetLoader = function() {
      var _k, _len2, _ref3;
      _ref3 = this._toLoad;
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        asset = _ref3[_k];
        this._removeAsset(asset);
      }
      this._toLoad = [];
      this._numToLoad = this._numLoaded = 0;
      this._group = null;
      return this._groups = [];
    };

    AssetLoader.prototype._removeAsset = function(asset) {
      asset.off('asset:completed');
      return asset = null;
    };

    AssetLoader.prototype._addAsset = function(src) {
      var loader, type, url;
      type = this._determineType(src);
      if (!type) {
        throw new Error("Unable to determine asset type for " + src);
      }
      loader = this._getLoader(type);
      url = src;
      if (this._config.BASE_URL != null) {
        url = this._config.BASE_URL + url;
      }
      loader.setSourceFile(url);
      this._toLoad.push(loader);
      return this._numToLoad += 1;
    };

    AssetLoader.prototype._determineType = function(file) {
      var extension, extensions, type, _ref3;
      extension = file.substr(file.lastIndexOf(".") + 1, file.length);
      _ref3 = this._types;
      for (type in _ref3) {
        extensions = _ref3[type];
        if (__indexOf.call(extensions, extension) >= 0) {
          return type;
        }
      }
      return false;
    };

    AssetLoader.prototype._getLoader = function(type) {
      return this._loaders[type]();
    };

    AssetLoader.prototype._startLoader = function(asset) {
      var _this = this;
      asset.on('asset:completed', function() {
        _this._numLoaded += 1;
        return _this._checkFinished();
      });
      return asset.load();
    };

    AssetLoader.prototype._checkFinished = function() {
      console.log('finished?', this._numToLoad, 'is', this._numLoaded);
      if (this._numToLoad === this._numLoaded) {
        return this._finished();
      }
    };

    AssetLoader.prototype._finished = function() {
      var currentGroup;
      currentGroup = this._group;
      this._resetLoader();
      return this.trigger('preloader:completed', currentGroup);
    };

    return AssetLoader;

  })();

  root.Precook = AssetLoader;

}).call(this);

(function() {
  var AssetVideoLoader, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  AssetVideoLoader = (function() {

    AssetVideoLoader.prototype._sourceFile = '';

    function AssetVideoLoader() {
      _.extend(this, Backbone.Events);
    }

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
