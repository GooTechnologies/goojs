define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus'
], function (System, SystemBus) {
    'use strict';
    __touch(5440);
    function LightingSystem() {
        System.call(this, 'LightingSystem', [
            'LightComponent',
            'TransformComponent'
        ]);
        __touch(5448);
        this.overrideLights = null;
        __touch(5449);
        this._needsUpdate = true;
        __touch(5450);
        this.lights = [];
        __touch(5451);
    }
    __touch(5441);
    LightingSystem.prototype = Object.create(System.prototype);
    __touch(5442);
    LightingSystem.prototype.setOverrideLights = function (overrideLights) {
        this.overrideLights = overrideLights;
        __touch(5452);
        SystemBus.emit('goo.setLights', this.overrideLights);
        __touch(5453);
        this._needsUpdate = true;
        __touch(5454);
    };
    __touch(5443);
    LightingSystem.prototype.clearOverrideLights = function () {
        this.overrideLights = undefined;
        __touch(5455);
        this._needsUpdate = true;
        __touch(5456);
    };
    __touch(5444);
    LightingSystem.prototype.inserted = function (entity) {
        entity.lightComponent.updateLight(entity.transformComponent.worldTransform);
        __touch(5457);
    };
    __touch(5445);
    LightingSystem.prototype.process = function (entities) {
        if (!this.overrideLights) {
            this.lights.length = 0;
            __touch(5458);
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                __touch(5461);
                var transformComponent = entity.transformComponent;
                __touch(5462);
                var lightComponent = entity.lightComponent;
                __touch(5463);
                if (transformComponent._updated || this._needsUpdate) {
                    lightComponent.updateLight(transformComponent.worldTransform);
                    __touch(5464);
                }
                if (!lightComponent.hidden) {
                    this.lights.push(lightComponent.light);
                    __touch(5465);
                }
            }
            this._needsUpdate = false;
            __touch(5459);
            SystemBus.emit('goo.setLights', this.lights);
            __touch(5460);
        }
    };
    __touch(5446);
    return LightingSystem;
    __touch(5447);
});
__touch(5439);