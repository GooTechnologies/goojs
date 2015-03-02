define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/renderer/Renderer',
    'goo/logic/LogicLayer',
    'goo/logic/LogicInterface'
], function (System, SystemBus, Renderer, LogicLayer, LogicInterface) {
    'use strict';
    __touch(9875);
    function LogicSystem() {
        System.call(this, 'LogicSystem', null);
        __touch(9889);
        this.passive = true;
        __touch(9890);
        this._entities = {};
        __touch(9891);
    }
    __touch(9876);
    LogicSystem.prototype = Object.create(System.prototype);
    __touch(9877);
    LogicSystem.prototype.inserted = function (entity) {
        this._entities[entity.name] = {
            entity: entity,
            inserted: false
        };
        __touch(9892);
    };
    __touch(9878);
    LogicSystem.prototype.deleted = function (entity) {
        delete this._entities[entity.name];
        __touch(9893);
    };
    __touch(9879);
    LogicSystem.prototype.process = function (entities, tpf) {
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            __touch(9894);
            if (e.logicComponent !== undefined) {
                e.logicComponent.process(tpf);
                __touch(9895);
            }
        }
    };
    __touch(9880);
    LogicSystem.prototype.resolveEntityRef = function (entityRef) {
        var e = this._entities[entityRef];
        __touch(9896);
        if (e !== undefined) {
            return e.entity;
            __touch(9897);
        }
    };
    __touch(9881);
    LogicSystem.prototype.getLayerByEntity = function (entityName) {
        var e = this._entities[entityName];
        __touch(9898);
        if (e === undefined) {
            return e;
            __touch(9901);
        }
        var c = e.entity.logicComponent;
        __touch(9899);
        if (c === undefined) {
            return c;
            __touch(9902);
        }
        return c.logicLayer;
        __touch(9900);
    };
    __touch(9882);
    LogicSystem.prototype.makeOutputWriteFn = function (sourceEntity, outPortDesc) {
        var matches = [];
        __touch(9903);
        this.forEachLogicObject(function (o) {
            if (o.type === 'LogicNodeEntityProxy' && o.entityRef === sourceEntity.name) {
                matches.push([
                    o.logicInstance,
                    LogicInterface.makePortDataName(outPortDesc)
                ]);
                __touch(9906);
            }
        });
        __touch(9904);
        return function (v) {
            for (var i = 0; i < matches.length; i++) {
                LogicLayer.writeValue(matches[i][0], matches[i][1], v);
                __touch(9907);
            }
        };
        __touch(9905);
    };
    __touch(9883);
    LogicSystem.prototype.forEachLogicObject = function (f) {
        for (var n in this._entities) {
            var e = this._entities[n].entity;
            __touch(9909);
            if (e.logicComponent !== undefined) {
                e.logicComponent.logicLayer.forEachLogicObject(f);
                __touch(9910);
            }
        }
        __touch(9908);
    };
    __touch(9884);
    LogicSystem.prototype.play = function () {
        this.passive = false;
        __touch(9911);
        this.forEachLogicObject(function (o) {
            if (o.onSystemStarted !== undefined) {
                o.onSystemStarted();
                __touch(9913);
            }
        });
        __touch(9912);
    };
    __touch(9885);
    LogicSystem.prototype.pause = function () {
        this.passive = true;
        __touch(9914);
        this.forEachLogicObject(function (o) {
            if (o.onSystemStopped !== undefined) {
                o.onSystemStopped(true);
                __touch(9916);
            }
        });
        __touch(9915);
    };
    __touch(9886);
    LogicSystem.prototype.stop = function () {
        this.passive = true;
        __touch(9917);
        this.forEachLogicObject(function (o) {
            if (o.onSystemStopped !== undefined) {
                o.onSystemStopped(false);
                __touch(9920);
            }
        });
        __touch(9918);
        for (var k in this._entities) {
            this._entities[k].inserted = false;
            __touch(9921);
        }
        __touch(9919);
    };
    __touch(9887);
    return LogicSystem;
    __touch(9888);
});
__touch(9874);