define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/loaders/handlers/ComponentHandler',
    'goo/util/Ajax',
    'goo/util/rsvp',
    'goo/util/StringUtil',
    'goo/util/PromiseUtil',
    'goo/util/ShapeCreatorMemoized',
    'goo/loaders/handlers/CameraComponentHandler',
    'goo/loaders/handlers/EntityHandler',
    'goo/loaders/handlers/LightComponentHandler',
    'goo/loaders/handlers/MaterialHandler',
    'goo/loaders/handlers/MeshDataComponentHandler',
    'goo/loaders/handlers/MeshDataHandler',
    'goo/loaders/handlers/MeshRendererComponentHandler',
    'goo/loaders/handlers/SceneHandler',
    'goo/loaders/handlers/ShaderHandler',
    'goo/loaders/handlers/TextureHandler',
    'goo/loaders/handlers/TransformComponentHandler',
    'goo/loaders/handlers/ProjectHandler',
    'goo/loaders/handlers/SoundComponentHandler',
    'goo/loaders/handlers/SoundHandler',
    'goo/loaders/handlers/EnvironmentHandler',
    'goo/loaders/handlers/SkyboxHandler',
    'goo/loaders/handlers/HtmlComponentHandler'
], function (ConfigHandler, ComponentHandler, Ajax, RSVP, StringUtil, PromiseUtil, ShapeCreatorMemoized) {
    'use strict';
    __touch(8196);
    function DynamicLoader(options) {
        if (options.world) {
            this._world = options.world;
            __touch(8215);
        } else {
            throw new Error('World argument cannot be null');
            __touch(8216);
        }
        if (options.ajax) {
            this._ajax = options.ajax;
            __touch(8217);
        } else if (options.rootPath) {
            this._ajax = new Ajax(options.rootPath);
            __touch(8218);
        } else {
            throw new Error('ajax or rootPath must be defined');
            __touch(8219);
        }
        this._objects = {};
        __touch(8213);
        this._handlers = {};
        __touch(8214);
    }
    __touch(8197);
    DynamicLoader.prototype.preload = function (bundle, clear) {
        this._ajax.prefill(bundle, clear);
        __touch(8220);
    };
    __touch(8198);
    DynamicLoader.prototype.clear = function () {
        var promises = [];
        __touch(8221);
        for (var type in this._handlers) {
            promises.push(this._handlers[type].clear());
            __touch(8224);
        }
        __touch(8222);
        if (this._ajax.clear instanceof Function) {
            this._ajax.clear();
            __touch(8225);
        }
        if (this._world && this._world.gooRunner) {
            ShapeCreatorMemoized.clearCache(this._world.gooRunner.renderer.context);
            __touch(8226);
            for (var i = 0; i < this._world.gooRunner.renderSystems.length; i++) {
                var lights = this._world.gooRunner.renderSystems[i].lights;
                __touch(8228);
                if (lights) {
                    for (var j = 0; j < lights.length; j++) {
                        lights[j].destroy(this._world.gooRunner.renderer);
                        __touch(8229);
                    }
                }
            }
            this._world.gooRunner.renderer.clearShaderCache();
            __touch(8227);
        }
        return RSVP.all(promises);
        __touch(8223);
    };
    __touch(8199);
    DynamicLoader.prototype.load = function (ref, options) {
        options = options || {};
        __touch(8230);
        var load = this._loadObject.bind(this, ref, options);
        __touch(8231);
        if (options.preloadBinaries === true) {
            return this._loadBinariesFromRefs(ref, options).then(load);
            __touch(8232);
        } else {
            return load();
            __touch(8233);
        }
    };
    __touch(8200);
    DynamicLoader.prototype.update = function (ref, config, options) {
        var that = this;
        __touch(8234);
        options = options || {};
        __touch(8235);
        return this._ajax.update(ref, config).then(function (config) {
            return that._updateObject(ref, config, options);
            __touch(8237);
        }).then(null, function (err) {
            console.error('Error updating ' + ref + ' ' + err);
            __touch(8238);
            throw err;
            __touch(8239);
        });
        __touch(8236);
    };
    __touch(8201);
    DynamicLoader.prototype._loadObject = function (ref, options) {
        var type = DynamicLoader.getTypeForRef(ref);
        __touch(8240);
        var handler = this._getHandler(type);
        __touch(8241);
        if (handler) {
            return handler.load(ref, options);
            __touch(8242);
        } else {
            return this._loadRef(ref, options);
            __touch(8243);
        }
    };
    __touch(8202);
    DynamicLoader.prototype.remove = function (ref) {
        delete this._objects[ref];
        __touch(8244);
        return this.update(ref, null);
        __touch(8245);
    };
    __touch(8203);
    DynamicLoader.prototype._updateObject = function (ref, config, options) {
        var type = DynamicLoader.getTypeForRef(ref);
        __touch(8246);
        var handler = this._getHandler(type);
        __touch(8247);
        if (handler) {
            return handler.update(ref, config, options);
            __touch(8248);
        } else if (DynamicLoader._isRefTypeInGroup(ref, 'binary') || type !== 'bundle') {
            return PromiseUtil.resolve(config);
            __touch(8249);
        } else {
            console.warn('No handler for type ' + type);
            __touch(8250);
            return PromiseUtil.resolve(config);
            __touch(8251);
        }
    };
    __touch(8204);
    DynamicLoader.prototype._loadRef = function (ref, options) {
        return this._ajax.load(ref, options == null ? false : options.noCache);
        __touch(8252);
    };
    __touch(8205);
    DynamicLoader.prototype._loadBinariesFromRefs = function (references, options) {
        var that = this;
        __touch(8253);
        function loadBinaryRefs(refs) {
            var handled = 0;
            __touch(8257);
            function load(ref) {
                return that._loadRef(ref, options).then(function () {
                    handled++;
                    __touch(8261);
                    if (options.progressCallback instanceof Function) {
                        options.progressCallback(handled, refs.length);
                        __touch(8262);
                    }
                });
                __touch(8260);
            }
            __touch(8258);
            return RSVP.all(refs.map(function (ref) {
                return load(ref);
                __touch(8263);
            }));
            __touch(8259);
        }
        __touch(8254);
        function traverse(refs) {
            var binaryRefs = {};
            __touch(8264);
            var jsonRefs = {};
            __touch(8265);
            var promises = [];
            __touch(8266);
            function loadFn(ref) {
                promises.push(that._loadRef(ref, options).then(traverseFn));
                __touch(8271);
            }
            __touch(8267);
            function traverseFn(config) {
                var refs = that._getRefsFromConfig(config);
                __touch(8272);
                for (var i = 0, keys = Object.keys(refs), len = refs.length; i < len; i++) {
                    var ref = refs[keys[i]];
                    __touch(8273);
                    if (DynamicLoader._isRefTypeInGroup(ref, 'asset') && !binaryRefs[ref]) {
                        binaryRefs[ref] = true;
                        __touch(8274);
                    } else if (DynamicLoader._isRefTypeInGroup(ref, 'json') && !jsonRefs[ref]) {
                        jsonRefs[ref] = true;
                        __touch(8275);
                        loadFn(ref);
                        __touch(8276);
                    }
                }
            }
            __touch(8268);
            traverseFn({ collectionRefs: refs });
            __touch(8269);
            return RSVP.all(promises).then(function () {
                return Object.keys(binaryRefs);
                __touch(8277);
            });
            __touch(8270);
        }
        __touch(8255);
        return traverse(references).then(loadBinaryRefs);
        __touch(8256);
    };
    __touch(8206);
    DynamicLoader.prototype._getHandler = function (type) {
        var handler = this._handlers[type];
        __touch(8278);
        if (handler) {
            return handler;
            __touch(8281);
        }
        var Handler = ConfigHandler.getHandler(type);
        __touch(8279);
        if (Handler) {
            return this._handlers[type] = new Handler(this._world, this._loadRef.bind(this), this._updateObject.bind(this), this._loadObject.bind(this));
            __touch(8282);
        }
        return null;
        __touch(8280);
    };
    __touch(8207);
    var refRegex = new RegExp('\\S+refs?$', 'i');
    __touch(8208);
    DynamicLoader.prototype._getRefsFromConfig = function (config) {
        var refs = [];
        __touch(8283);
        function traverse(key, value) {
            if (refRegex.test(key) && key !== 'thumbnailRef') {
                if (value instanceof Object) {
                    for (var i = 0, keys = Object.keys(value), len = keys.length; i < len; i++) {
                        if (value[keys[i]]) {
                            refs.push(value[keys[i]]);
                            __touch(8287);
                        }
                    }
                } else if (value) {
                    refs.push(value);
                    __touch(8288);
                }
            } else if (value instanceof Object) {
                for (var i = 0, keys = Object.keys(value), len = keys.length; i < len; i++) {
                    if (value.hasOwnProperty(keys[i])) {
                        traverse(keys[i], value[keys[i]]);
                        __touch(8289);
                    }
                }
            }
        }
        __touch(8284);
        traverse('', config);
        __touch(8285);
        return refs;
        __touch(8286);
    };
    __touch(8209);
    DynamicLoader.getTypeForRef = function (ref) {
        return ref.substr(ref.lastIndexOf('.') + 1).toLowerCase();
        __touch(8290);
    };
    __touch(8210);
    DynamicLoader._isRefTypeInGroup = function (ref, group) {
        var type = DynamicLoader.getTypeForRef(ref);
        __touch(8291);
        return type && Ajax.types[group] && Ajax.types[group][type];
        __touch(8292);
    };
    __touch(8211);
    return DynamicLoader;
    __touch(8212);
});
__touch(8195);