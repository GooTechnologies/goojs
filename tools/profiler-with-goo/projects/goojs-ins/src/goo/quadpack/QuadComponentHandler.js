define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil',
    'goo/quadpack/QuadComponent'
], function (ComponentHandler, RSVP, PromiseUtil, _, QuadComponent) {
    'use strict';
    __touch(15364);
    function QuadComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(15373);
        this._type = 'QuadComponent';
        __touch(15374);
    }
    __touch(15365);
    QuadComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(15366);
    QuadComponentHandler.prototype.constructor = QuadComponentHandler;
    __touch(15367);
    ComponentHandler._registerClass('quad', QuadComponentHandler);
    __touch(15368);
    QuadComponentHandler.prototype._create = function () {
        return new QuadComponent();
        __touch(15375);
    };
    __touch(15369);
    QuadComponentHandler.prototype._remove = function (entity) {
        if (this.world && this.world.gooRunner) {
            entity.quadComponent.destroy(this.world.gooRunner.renderer.context);
            __touch(15377);
        }
        entity.clearComponent('quadComponent');
        __touch(15376);
    };
    __touch(15370);
    QuadComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(15378);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(15381);
            }
            return that._load(config.materialRef, options).then(function (material) {
                material.cullState.enabled = true;
                __touch(15382);
                if (entity.meshRendererComponent !== component.meshRendererComponent) {
                    entity.setComponent(component.meshRendererComponent);
                    __touch(15387);
                }
                if (entity.meshDataComponent !== component.meshDataComponent) {
                    entity.setComponent(component.meshDataComponent);
                    __touch(15388);
                }
                component.setMaterial(material);
                __touch(15383);
                component.rebuildMeshData();
                __touch(15384);
                component.meshDataComponent.autoCompute = true;
                __touch(15385);
                return component;
                __touch(15386);
            });
            __touch(15380);
        });
        __touch(15379);
    };
    __touch(15371);
    return QuadComponentHandler;
    __touch(15372);
});
__touch(15363);