define([
    'goo/util/rsvp',
    'goo/util/PromiseUtil'
], function (RSVP, PromiseUtil) {
    'use strict';
    __touch(8755);
    function ConfigHandler(world, getConfig, updateObject, loadObject) {
        this.world = world;
        __touch(8769);
        this.getConfig = getConfig;
        __touch(8770);
        this.updateObject = updateObject;
        __touch(8771);
        this.loadObject = loadObject;
        __touch(8772);
        this._objects = {};
        __touch(8773);
        this._loading = {};
        __touch(8774);
    }
    __touch(8756);
    ConfigHandler.prototype._create = function () {
        return {};
        __touch(8775);
    };
    __touch(8757);
    ConfigHandler.prototype._remove = function (ref) {
        delete this._objects[ref];
        __touch(8776);
    };
    __touch(8758);
    ConfigHandler.prototype._prepare = function (config) {
        config = config;
        __touch(8777);
    };
    __touch(8759);
    ConfigHandler.prototype._load = function (ref, options) {
        return this.loadObject(ref, options);
        __touch(8778);
    };
    __touch(8760);
    ConfigHandler.prototype.load = function (ref, options) {
        var type = ref.substr(ref.lastIndexOf('.') + 1);
        __touch(8779);
        if (type !== this.constructor._type) {
            throw new Error('Trying to load type' + type + ' with handler for ' + this._type);
            __touch(8781);
        }
        var that = this;
        __touch(8780);
        if (this._loading[ref]) {
            return this._loading[ref];
            __touch(8782);
        } else if (this._objects[ref] && !options.reload) {
            return PromiseUtil.resolve(this._objects[ref]);
            __touch(8783);
        } else {
            return this._loading[ref] = this.getConfig(ref, options).then(function (config) {
                return that.update(ref, config, options);
                __touch(8785);
            }).then(function (object) {
                delete that._loading[ref];
                __touch(8786);
                return object;
                __touch(8787);
            }).then(null, function (err) {
                delete that._loading[ref];
                __touch(8788);
                throw err;
                __touch(8789);
            });
            __touch(8784);
        }
    };
    __touch(8761);
    ConfigHandler.prototype.clear = function () {
        var promises = [];
        __touch(8790);
        for (var ref in this._objects) {
            promises.push(this.update(ref, null, {}));
            __touch(8795);
        }
        __touch(8791);
        for (var key in this._objects) {
            delete this._objects[key];
            __touch(8796);
        }
        __touch(8792);
        for (var key in this._loading) {
            delete this._loading[key];
            __touch(8797);
        }
        __touch(8793);
        return RSVP.all(promises);
        __touch(8794);
    };
    __touch(8762);
    ConfigHandler.prototype.update = function (ref, config, options) {
        var that = this;
        __touch(8798);
        return this._loading[ref] = this._update(ref, config, options).then(function (object) {
            delete that._loading[ref];
            __touch(8800);
            return object;
            __touch(8801);
        });
        __touch(8799);
    };
    __touch(8763);
    ConfigHandler.prototype._update = function (ref, config, options) {
        if (!config) {
            this._remove(ref, options);
            __touch(8804);
            return PromiseUtil.resolve();
            __touch(8805);
        }
        if (!this._objects[ref]) {
            this._objects[ref] = this._create();
            __touch(8806);
        }
        this._prepare(config);
        __touch(8802);
        return PromiseUtil.resolve(this._objects[ref]);
        __touch(8803);
    };
    __touch(8764);
    ConfigHandler.handlerClasses = {};
    __touch(8765);
    ConfigHandler.getHandler = function (type) {
        return ConfigHandler.handlerClasses[type];
        __touch(8807);
    };
    __touch(8766);
    ConfigHandler._registerClass = function (type, klass) {
        klass._type = type;
        __touch(8808);
        return ConfigHandler.handlerClasses[type] = klass;
        __touch(8809);
    };
    __touch(8767);
    return ConfigHandler;
    __touch(8768);
});
__touch(8754);