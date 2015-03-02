define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/entities/SystemBus',
    'goo/util/ArrayUtil',
    'goo/util/ObjectUtil',
    'goo/util/rsvp'
], function (ConfigHandler, SystemBus, ArrayUtil, _, RSVP) {
    'use strict';
    __touch(9307);
    function SceneHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9319);
    }
    __touch(9308);
    SceneHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9309);
    SceneHandler.prototype.constructor = SceneHandler;
    __touch(9310);
    ConfigHandler._registerClass('scene', SceneHandler);
    __touch(9311);
    SceneHandler.prototype._remove = function (ref) {
        var scene = this._objects[ref];
        __touch(9320);
        if (scene) {
            for (var i = 0; i < scene.entities.length; i++) {
                scene.entities[i].removeFromWorld();
                __touch(9322);
            }
        }
        delete this._objects[ref];
        __touch(9321);
    };
    __touch(9312);
    SceneHandler.prototype._create = function () {
        return {
            id: null,
            entities: {},
            posteffects: [],
            environment: null,
            initialCameraRef: null
        };
        __touch(9323);
    };
    __touch(9313);
    SceneHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(9324);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (scene) {
            if (!scene) {
                return;
                __touch(9330);
            }
            scene.id = ref;
            __touch(9326);
            var promises = [];
            __touch(9327);
            promises.push(that._handleEntities(config, scene, options));
            __touch(9328);
            if (config.posteffectsRef) {
                promises.push(that._load(config.posteffectsRef, options));
                __touch(9331);
            }
            if (config.environmentRef) {
                promises.push(that._load(config.environmentRef, options));
                __touch(9332);
            }
            if (!options.scene || !options.scene.dontSetCamera) {
                if (config.initialCameraRef && config.initialCameraRef !== scene.initialCameraRef) {
                    promises.push(that._load(config.initialCameraRef, options).then(function (cameraEntity) {
                        if (cameraEntity && cameraEntity.cameraComponent) {
                            SystemBus.emit('goo.setCurrentCamera', {
                                camera: cameraEntity.cameraComponent.camera,
                                entity: cameraEntity
                            });
                            __touch(9335);
                        }
                        scene.initialCameraRef = config.initialCameraRef;
                        __touch(9334);
                    }));
                    __touch(9333);
                }
            }
            return RSVP.all(promises).then(function () {
                return scene;
                __touch(9336);
            });
            __touch(9329);
        });
        __touch(9325);
    };
    __touch(9314);
    SceneHandler.prototype._handleEntities = function (config, scene, options) {
        var that = this;
        __touch(9337);
        var promises = [];
        __touch(9338);
        var addedEntityIds = _.clone(config.entities);
        __touch(9339);
        var removedEntityIds = [];
        __touch(9340);
        for (var id in scene.entities) {
            if (addedEntityIds[id]) {
                delete addedEntityIds[id];
                __touch(9344);
            } else {
                removedEntityIds[id] = id;
                __touch(9345);
            }
        }
        __touch(9341);
        _.forEach(config.entities, function (entityConfig) {
            promises.push(that._load(entityConfig.entityRef, options));
            __touch(9346);
        }, null, 'sortValue');
        __touch(9342);
        return RSVP.all(promises).then(function (entities) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                __touch(9348);
                if (addedEntityIds[entity.id]) {
                    entity.addToWorld();
                    __touch(9350);
                }
                if (!addedEntityIds[entity.id] && !removedEntityIds[entity.id] && !entity._world.entityManager.containsEntity(entity)) {
                    entity.addToWorld();
                    __touch(9351);
                }
                scene.entities[entity.id] = entity;
                __touch(9349);
            }
            for (var id in removedEntityIds) {
                delete scene.entities[id];
                __touch(9352);
            }
            __touch(9347);
        });
        __touch(9343);
    };
    __touch(9315);
    SceneHandler.prototype._handlePosteffects = function (config, scene, options) {
        return this._load(config.posteffectsRef, options);
        __touch(9353);
    };
    __touch(9316);
    SceneHandler.prototype._handleEnvironment = function (config, scene, options) {
        return this._load(config.environmentRef, options);
        __touch(9354);
    };
    __touch(9317);
    return SceneHandler;
    __touch(9318);
});
__touch(9306);