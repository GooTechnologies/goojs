define([
    'goo/entities/managers/Manager',
    'goo/entities/EntitySelection'
], function (Manager, EntitySelection) {
    'use strict';
    __touch(5198);
    function EntityManager() {
        this.type = 'EntityManager';
        __touch(5212);
        this._entitiesById = {};
        __touch(5213);
        this._entitiesByIndex = {};
        __touch(5214);
        this._entityCount = 0;
        __touch(5215);
        this.api = {
            id: function () {
                var ret = EntityManager.prototype.getEntityById.apply(this, arguments);
                __touch(5217);
                return new EntitySelection(ret);
                __touch(5218);
            }.bind(this),
            name: function (name) {
                var entities = this.getEntities();
                __touch(5219);
                return new EntitySelection(entities.filter(function (entity) {
                    return entity.name === name;
                    __touch(5221);
                }));
                __touch(5220);
            }.bind(this)
        };
        __touch(5216);
    }
    __touch(5199);
    EntityManager.prototype = Object.create(Manager.prototype);
    __touch(5200);
    EntityManager.prototype.added = function (entity) {
        if (!this.containsEntity(entity)) {
            this._entitiesById[entity.id] = entity;
            __touch(5222);
            this._entitiesByIndex[entity._index] = entity;
            __touch(5223);
            this._entityCount++;
            __touch(5224);
        }
    };
    __touch(5201);
    EntityManager.prototype.removed = function (entity) {
        if (this.containsEntity(entity)) {
            delete this._entitiesById[entity.id];
            __touch(5225);
            delete this._entitiesByIndex[entity._index];
            __touch(5226);
            this._entityCount--;
            __touch(5227);
        }
    };
    __touch(5202);
    EntityManager.prototype.containsEntity = function (entity) {
        return this._entitiesByIndex[entity._index] !== undefined;
        __touch(5228);
    };
    __touch(5203);
    EntityManager.prototype.getEntityById = function (id) {
        return this._entitiesById[id];
        __touch(5229);
    };
    __touch(5204);
    EntityManager.prototype.getEntityByIndex = function (index) {
        return this._entitiesByIndex[index];
        __touch(5230);
    };
    __touch(5205);
    EntityManager.prototype.getEntityByName = function (name) {
        for (var i in this._entitiesById) {
            var entity = this._entitiesById[i];
            __touch(5232);
            if (entity.name === name) {
                return entity;
                __touch(5233);
            }
        }
        __touch(5231);
    };
    __touch(5206);
    EntityManager.prototype.size = function () {
        return this._entityCount;
        __touch(5234);
    };
    __touch(5207);
    EntityManager.prototype.getEntities = function () {
        var entities = [];
        __touch(5235);
        for (var i in this._entitiesByIndex) {
            entities.push(this._entitiesByIndex[i]);
            __touch(5238);
        }
        __touch(5236);
        return entities;
        __touch(5237);
    };
    __touch(5208);
    EntityManager.prototype.getTopEntities = function () {
        var entities = [];
        __touch(5239);
        for (var i in this._entitiesByIndex) {
            var entity = this._entitiesByIndex[i];
            __touch(5242);
            if (entity.transformComponent) {
                if (!entity.transformComponent.parent) {
                    entities.push(entity);
                    __touch(5243);
                }
            } else {
                entities.push(entity);
                __touch(5244);
            }
        }
        __touch(5240);
        return entities;
        __touch(5241);
    };
    __touch(5209);
    EntityManager.prototype.clear = function () {
        this._entitiesById = {};
        __touch(5245);
        this._entitiesByIndex = {};
        __touch(5246);
        this._entityCount = 0;
        __touch(5247);
    };
    __touch(5210);
    return EntityManager;
    __touch(5211);
});
__touch(5197);