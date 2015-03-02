define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/TransformComponent',
    'goo/math/MathUtils',
    'goo/util/ObjectUtil',
    'goo/util/rsvp'
], function (ComponentHandler, TransformComponent, MathUtils, _, RSVP) {
    'use strict';
    __touch(9640);
    function TransformComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(9650);
        this._type = 'TransformComponent';
        __touch(9651);
    }
    __touch(9641);
    TransformComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(9642);
    TransformComponentHandler.prototype.constructor = TransformComponentHandler;
    __touch(9643);
    ComponentHandler._registerClass('transform', TransformComponentHandler);
    __touch(9644);
    TransformComponentHandler.prototype._prepare = function (config) {
        return _.defaults(config, {
            translation: [
                0,
                0,
                0
            ],
            rotation: [
                0,
                0,
                0
            ],
            scale: [
                1,
                1,
                1
            ]
        });
        __touch(9652);
    };
    __touch(9645);
    TransformComponentHandler.prototype._create = function () {
        return new TransformComponent();
        __touch(9653);
    };
    __touch(9646);
    TransformComponentHandler.prototype._remove = function (entity) {
        var component = entity.transformComponent;
        __touch(9654);
        component.transform.translation.setd(0, 0, 0);
        __touch(9655);
        component.transform.setRotationXYZ(0, 0, 0);
        __touch(9656);
        component.transform.scale.setd(1, 1, 1);
        __touch(9657);
        for (var i = 0; i < component.children.length; i++) {
            var child = component.children[i];
            __touch(9659);
            component.detachChild(child);
            __touch(9660);
        }
        component.setUpdated();
        __touch(9658);
    };
    __touch(9647);
    TransformComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(9661);
        function attachChild(component, ref) {
            return that.loadObject(ref, options).then(function (entity) {
                if (entity && entity.transformComponent) {
                    component.attachChild(entity.transformComponent);
                    __touch(9666);
                    var entityInWorld = that.world.entityManager.containsEntity(entity) || that.world._addedEntities.indexOf(entity) !== -1;
                    __touch(9667);
                    var parentInWorld = that.world.entityManager.containsEntity(component.entity) || that.world._addedEntities.indexOf(component.entity) > -1;
                    __touch(9668);
                    if (!entityInWorld && parentInWorld) {
                        entity.addToWorld();
                        __touch(9669);
                    }
                } else {
                    console.error('Failed to add child to transform component');
                    __touch(9670);
                }
                return component;
                __touch(9665);
            });
            __touch(9664);
        }
        __touch(9662);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(9676);
            }
            component.transform.translation.seta(config.translation);
            __touch(9671);
            component.transform.setRotationXYZ(MathUtils.DEG_TO_RAD * config.rotation[0], MathUtils.DEG_TO_RAD * config.rotation[1], MathUtils.DEG_TO_RAD * config.rotation[2]);
            __touch(9672);
            component.transform.scale.seta(config.scale);
            __touch(9673);
            var promises = [];
            __touch(9674);
            if (config.children) {
                var keys = Object.keys(config.children);
                __touch(9677);
                for (var i = 0; i < keys.length; i++) {
                    var childRef = config.children[keys[i]].entityRef;
                    __touch(9678);
                    promises.push(attachChild(component, childRef));
                    __touch(9679);
                }
                for (var i = 0; i < component.children.length; i++) {
                    var child = component.children[i];
                    __touch(9680);
                    var id = child.entity.id;
                    __touch(9681);
                    if (!config.children[id]) {
                        component.detachChild(child);
                        __touch(9682);
                    }
                }
            } else {
                for (var i = 0; i < component.children.length; i++) {
                    var child = component.children[i];
                    __touch(9683);
                    component.detachChild(child);
                    __touch(9684);
                }
            }
            return RSVP.all(promises).then(function () {
                component.setUpdated();
                __touch(9685);
                return component;
                __touch(9686);
            });
            __touch(9675);
        });
        __touch(9663);
    };
    __touch(9648);
    return TransformComponentHandler;
    __touch(9649);
});
__touch(9639);