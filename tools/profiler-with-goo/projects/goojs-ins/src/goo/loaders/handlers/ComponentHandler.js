define(['goo/util/PromiseUtil'], function (PromiseUtil) {
    'use strict';
    __touch(8726);
    function ComponentHandler(world, getConfig, updateObject, loadObject) {
        this.world = world;
        __touch(8737);
        this.getConfig = getConfig;
        __touch(8738);
        this.updateObject = updateObject;
        __touch(8739);
        this.loadObject = loadObject;
        __touch(8740);
    }
    __touch(8727);
    ComponentHandler.prototype._prepare = function () {
    };
    __touch(8728);
    ComponentHandler.prototype._create = function () {
        throw new Error('ComponentHandler._create is abstract, use ComponentHandler.getHandler(type)');
        __touch(8741);
    };
    __touch(8729);
    ComponentHandler.prototype._remove = function (entity) {
        entity.clearComponent(this._type);
        __touch(8742);
    };
    __touch(8730);
    ComponentHandler.prototype._load = function (ref, options) {
        return this.loadObject(ref, options);
        __touch(8743);
    };
    __touch(8731);
    ComponentHandler.prototype.update = function (entity, config) {
        if (!entity) {
            return PromiseUtil.reject('Entity is missing');
            __touch(8747);
        }
        if (!config) {
            this._remove(entity);
            __touch(8748);
            return PromiseUtil.resolve();
            __touch(8749);
        }
        var component = entity.getComponent(this._type);
        __touch(8744);
        if (!component) {
            component = this._create();
            __touch(8750);
            entity.setComponent(component);
            __touch(8751);
        }
        this._prepare(config);
        __touch(8745);
        return PromiseUtil.resolve(component);
        __touch(8746);
    };
    __touch(8732);
    ComponentHandler.handlerClasses = {};
    __touch(8733);
    ComponentHandler.getHandler = function (type) {
        return ComponentHandler.handlerClasses[type];
        __touch(8752);
    };
    __touch(8734);
    ComponentHandler._registerClass = function (type, klass) {
        ComponentHandler.handlerClasses[type] = klass;
        __touch(8753);
    };
    __touch(8735);
    return ComponentHandler;
    __touch(8736);
});
__touch(8725);