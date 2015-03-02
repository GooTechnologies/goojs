define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/loaders/handlers/ComponentHandler',
    'goo/util/rsvp',
    'goo/util/StringUtil',
    'goo/util/PromiseUtil'
], function (ConfigHandler, ComponentHandler, RSVP, StringUtil, PromiseUtil) {
    'use strict';
    __touch(8811);
    function EntityHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(8825);
        this._componentHandlers = {};
        __touch(8826);
    }
    __touch(8812);
    EntityHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(8813);
    EntityHandler.prototype.constructor = EntityHandler;
    __touch(8814);
    ConfigHandler._registerClass('entity', EntityHandler);
    __touch(8815);
    EntityHandler.prototype._create = function () {
        return this.world.createEntity();
        __touch(8827);
    };
    __touch(8816);
    EntityHandler.prototype._remove = function (ref) {
        var entity = this._objects[ref];
        __touch(8828);
        var that = this;
        __touch(8829);
        if (entity) {
            var promises = [];
            __touch(8830);
            var components = entity._components.slice(0);
            __touch(8831);
            for (var i = 0; i < components.length; i++) {
                var type = this._getComponentType(components[i]);
                __touch(8833);
                var p = this._updateComponent(entity, type, null);
                __touch(8834);
                if (p instanceof RSVP.Promise) {
                    promises.push(p);
                    __touch(8835);
                }
            }
            return RSVP.all(promises).then(function () {
                entity.removeFromWorld();
                __touch(8836);
                delete that._objects[ref];
                __touch(8837);
            });
            __touch(8832);
        }
    };
    __touch(8817);
    function updateTags(entity, tags) {
        entity._tags = {};
        __touch(8838);
        if (!tags) {
            return;
            __touch(8840);
        }
        for (var tag in tags) {
            entity.setTag(tag);
            __touch(8841);
        }
        __touch(8839);
    }
    __touch(8818);
    function updateAttributes(entity, config) {
        entity._attributes = {};
        __touch(8842);
        if (!config) {
            return;
            __touch(8844);
        }
        for (var attribute in config) {
            entity.setAttribute(attribute, config[attribute]);
            __touch(8845);
        }
        __touch(8843);
    }
    __touch(8819);
    EntityHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(8846);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (entity) {
            if (!entity) {
                return;
                __touch(8858);
            }
            entity.id = ref;
            __touch(8848);
            entity.name = config.name;
            __touch(8849);
            window.entities = window.entities || {};
            __touch(8850);
            entity.static = !!config.static;
            __touch(8851);
            updateTags(entity, config.tags);
            __touch(8852);
            updateAttributes(entity, config.attributes);
            __touch(8853);
            var promises = [];
            __touch(8854);
            for (var type in config.components) {
                if (config.components[type]) {
                    var p = that._updateComponent(entity, type, config.components[type], options);
                    __touch(8859);
                    if (p) {
                        promises.push(p);
                        __touch(8860);
                    } else {
                        console.error('Error handling component ' + type);
                        __touch(8861);
                    }
                }
            }
            __touch(8855);
            var components = entity._components;
            __touch(8856);
            for (var i = 0; i < components.length; i++) {
                var type = that._getComponentType(components[i]);
                __touch(8862);
                if (!config.components[type]) {
                    that._updateComponent(entity, type, null, options);
                    __touch(8863);
                }
            }
            return PromiseUtil.optimisticAll(promises).then(function () {
                if (config.hidden) {
                    entity.hide();
                    __touch(8865);
                } else {
                    entity.show();
                    __touch(8866);
                }
                return entity;
                __touch(8864);
            });
            __touch(8857);
        });
        __touch(8847);
    };
    __touch(8820);
    EntityHandler.prototype._updateComponent = function (entity, type, config, options) {
        var handler = this._getHandler(type);
        __touch(8867);
        if (!handler) {
            return null;
            __touch(8870);
        }
        var p = handler.update(entity, config, options);
        __touch(8868);
        if (!p || !p.then) {
            return null;
            __touch(8871);
        }
        return p;
        __touch(8869);
    };
    __touch(8821);
    EntityHandler.prototype._getComponentType = function (component) {
        var type = component.type;
        __touch(8872);
        type = type.slice(0, type.lastIndexOf('Component'));
        __touch(8873);
        type = StringUtil.uncapitalize(type);
        __touch(8874);
        if (type === 'howler') {
            type = 'sound';
            __touch(8876);
        }
        return type;
        __touch(8875);
    };
    __touch(8822);
    EntityHandler.prototype._getHandler = function (type) {
        if (!this._componentHandlers[type]) {
            var Handler = ComponentHandler.getHandler(type);
            __touch(8878);
            if (Handler) {
                this._componentHandlers[type] = new Handler(this.world, this.getConfig, this.updateObject, this.loadObject);
                __touch(8879);
            }
        }
        return this._componentHandlers[type];
        __touch(8877);
    };
    __touch(8823);
    return EntityHandler;
    __touch(8824);
});
__touch(8810);