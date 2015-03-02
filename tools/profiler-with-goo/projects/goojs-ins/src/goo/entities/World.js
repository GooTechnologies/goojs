define([
    'goo/entities/Entity',
    'goo/entities/managers/EntityManager',
    'goo/entities/components/TransformComponent',
    'goo/entities/managers/Manager',
    'goo/entities/systems/System',
    'goo/entities/components/Component',
    'goo/entities/EntitySelection'
], function (Entity, EntityManager, TransformComponent, Manager, System, Component, EntitySelection) {
    'use strict';
    __touch(4531);
    function World(gooRunner) {
        this.gooRunner = gooRunner;
        __touch(4554);
        this._managers = [];
        __touch(4555);
        this._systems = [];
        __touch(4556);
        this._addedEntities = [];
        __touch(4557);
        this._changedEntities = [];
        __touch(4558);
        this._removedEntities = [];
        __touch(4559);
        this.by = {};
        __touch(4560);
        this._installDefaultSelectors();
        __touch(4561);
        this.entityManager = new EntityManager();
        __touch(4562);
        this.setManager(this.entityManager);
        __touch(4563);
        this.time = 0;
        __touch(4564);
        this.tpf = 1;
        __touch(4565);
        this._components = [];
        __touch(4566);
    }
    __touch(4532);
    World.time = 0;
    __touch(4533);
    World.tpf = 1;
    __touch(4534);
    World.prototype._installDefaultSelectors = function () {
        this.by.system = function (systemType) {
            var system = this.getSystem(systemType);
            __touch(4571);
            return new EntitySelection(system._activeEntities);
            __touch(4572);
        }.bind(this);
        __touch(4567);
        this.by.component = function (componentType) {
            var entities = this.entityManager.getEntities();
            __touch(4573);
            return new EntitySelection(entities.filter(function (entity) {
                return !!entity[componentType];
                __touch(4575);
            }));
            __touch(4574);
        }.bind(this);
        __touch(4568);
        this.by.tag = function (tag) {
            var entities = this.entityManager.getEntities();
            __touch(4576);
            return new EntitySelection(entities.filter(function (entity) {
                return entity.hasTag(tag);
                __touch(4578);
            }));
            __touch(4577);
        }.bind(this);
        __touch(4569);
        this.by.attribute = function (attribute) {
            var entities = this.entityManager.getEntities();
            __touch(4579);
            return new EntitySelection(entities.filter(function (entity) {
                return entity.hasAttribute(attribute);
                __touch(4581);
            }));
            __touch(4580);
        }.bind(this);
        __touch(4570);
    };
    __touch(4535);
    World.prototype.add = function () {
        for (var i = 0; i < arguments.length; i++) {
            var argument = arguments[i];
            __touch(4583);
            if (argument instanceof Entity) {
                this.addEntity(argument);
                __touch(4584);
            } else if (argument instanceof Manager) {
                this.setManager(argument);
                __touch(4585);
            } else if (argument instanceof System) {
                this.setSystem(argument);
                __touch(4586);
            } else if (argument instanceof Component) {
                this.registerComponent(argument);
                __touch(4587);
            }
        }
        return this;
        __touch(4582);
    };
    __touch(4536);
    World.prototype.registerComponent = function (componentConstructor) {
        if (this._components.indexOf(componentConstructor) === -1) {
            this._components.push(componentConstructor);
            __touch(4589);
        }
        return this;
        __touch(4588);
    };
    __touch(4537);
    World.prototype.setManager = function (manager) {
        this._managers.push(manager);
        __touch(4590);
        manager.applyAPI(this.by);
        __touch(4591);
        return this;
        __touch(4592);
    };
    __touch(4538);
    World.prototype.getManager = function (type) {
        for (var i = 0; i < this._managers.length; i++) {
            var manager = this._managers[i];
            __touch(4593);
            if (manager.type === type) {
                return manager;
                __touch(4594);
            }
        }
    };
    __touch(4539);
    World.prototype.setSystem = function (system) {
        var priority = system.priority;
        __touch(4595);
        for (var i = 0; i < this._systems.length; i++) {
            if (this._systems[i].priority > priority) {
                break;
                __touch(4598);
            }
        }
        this._systems.splice(i, 0, system);
        __touch(4596);
        return this;
        __touch(4597);
    };
    __touch(4540);
    World.prototype.getSystem = function (type) {
        for (var i = 0; i < this._systems.length; i++) {
            var system = this._systems[i];
            __touch(4599);
            if (system.type === type) {
                return system;
                __touch(4600);
            }
        }
    };
    __touch(4541);
    World.prototype.clearSystem = function (type) {
        for (var i = 0; i < this._systems.length; i++) {
            var system = this._systems[i];
            __touch(4602);
            if (system.type === type) {
                if (system.cleanup) {
                    system.cleanup();
                    __touch(4604);
                }
                this._systems.splice(i, 1);
                __touch(4603);
            }
        }
        return this;
        __touch(4601);
    };
    __touch(4542);
    World.prototype.createEntity = function () {
        var entity = new Entity(this);
        __touch(4605);
        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'string') {
                entity.name = arguments[i];
                __touch(4607);
            } else {
                entity.set(arguments[i]);
                __touch(4608);
            }
        }
        if (!entity.transformComponent) {
            entity.setComponent(new TransformComponent());
            __touch(4609);
        }
        return entity;
        __touch(4606);
    };
    __touch(4543);
    World.prototype.getEntities = function () {
        return this.entityManager.getEntities();
        __touch(4610);
    };
    __touch(4544);
    World.prototype.addEntity = function (entity, recursive) {
        if (this._addedEntities.indexOf(entity) === -1) {
            this._addedEntities.push(entity);
            __touch(4612);
        }
        if (entity.transformComponent && (recursive === undefined || recursive === true)) {
            var children = entity.transformComponent.children;
            __touch(4613);
            for (var i = 0; i < children.length; i++) {
                this.addEntity(children[i].entity, recursive);
                __touch(4614);
            }
        }
        for (var i = 0; i < this._managers.length; i++) {
            var manager = this._managers[i];
            __touch(4615);
            manager.added(entity);
            __touch(4616);
        }
        return this;
        __touch(4611);
    };
    __touch(4545);
    World.prototype.removeEntity = function (entity, recursive) {
        if (this._removedEntities.indexOf(entity) === -1) {
            this._removedEntities.push(entity);
            __touch(4619);
        }
        var transformComponent = entity.transformComponent;
        __touch(4617);
        if (transformComponent.parent) {
            transformComponent.parent.detachChild(transformComponent);
            __touch(4620);
            transformComponent.parent = null;
            __touch(4621);
        }
        if (recursive === false) {
            var children = transformComponent.children;
            __touch(4622);
            for (var i = 0; i < children.length; i++) {
                children[i].parent = null;
                __touch(4624);
            }
            transformComponent.children = [];
            __touch(4623);
        } else {
            var children = transformComponent.children;
            __touch(4625);
            for (var i = 0; i < children.length; i++) {
                this._recursiveRemoval(children[i].entity, recursive);
                __touch(4626);
            }
        }
        for (var i = 0; i < this._managers.length; i++) {
            var manager = this._managers[i];
            __touch(4627);
            manager.removed(entity);
            __touch(4628);
        }
        return this;
        __touch(4618);
    };
    __touch(4546);
    World.prototype._recursiveRemoval = function (entity, recursive) {
        if (this._removedEntities.indexOf(entity) === -1) {
            this._removedEntities.push(entity);
            __touch(4629);
        }
        for (var i = 0; i < this._managers.length; i++) {
            var manager = this._managers[i];
            __touch(4630);
            manager.removed(entity);
            __touch(4631);
        }
        if (entity.transformComponent && (recursive === undefined || recursive === true)) {
            var children = entity.transformComponent.children;
            __touch(4632);
            for (var i = 0; i < children.length; i++) {
                this._recursiveRemoval(children[i].entity, recursive);
                __touch(4633);
            }
        }
    };
    __touch(4547);
    World.prototype.changedEntity = function (entity, component, eventType) {
        var event = { entity: entity };
        __touch(4634);
        if (component !== undefined) {
            event.component = component;
            __touch(4636);
        }
        if (eventType !== undefined) {
            event.eventType = eventType;
            __touch(4637);
        }
        this._changedEntities.push(event);
        __touch(4635);
    };
    __touch(4548);
    World.prototype.processEntityChanges = function () {
        this._check(this._addedEntities, function (observer, entity) {
            if (observer.added) {
                observer.added(entity);
                __touch(4641);
            }
            if (observer.addedComponent) {
                for (var i = 0; i < entity._components.length; i++) {
                    observer.addedComponent(entity, entity._components[i]);
                    __touch(4642);
                }
            }
        });
        __touch(4638);
        this._check(this._changedEntities, function (observer, event) {
            if (observer.changed) {
                observer.changed(event.entity);
                __touch(4643);
            }
            if (event.eventType !== undefined) {
                if (observer[event.eventType]) {
                    observer[event.eventType](event.entity, event.component);
                    __touch(4644);
                }
            }
        });
        __touch(4639);
        this._check(this._removedEntities, function (observer, entity) {
            if (observer.removed) {
                observer.removed(entity);
                __touch(4645);
            }
            if (observer.removedComponent) {
                for (var i = 0; i < entity._components.length; i++) {
                    observer.removedComponent(entity, entity._components[i]);
                    __touch(4646);
                }
            }
        });
        __touch(4640);
    };
    __touch(4549);
    World.prototype.process = function () {
        this.processEntityChanges();
        __touch(4647);
        for (var i = 0; i < this._systems.length; i++) {
            var system = this._systems[i];
            __touch(4648);
            if (!system.passive) {
                system._process(this.tpf);
                __touch(4649);
            }
        }
    };
    __touch(4550);
    World.prototype._check = function (entities, callback) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(4651);
            for (var systemIndex = 0; systemIndex < this._systems.length; systemIndex++) {
                var system = this._systems[systemIndex];
                __touch(4652);
                callback(system, entity);
                __touch(4653);
            }
        }
        entities.length = 0;
        __touch(4650);
    };
    __touch(4551);
    World.prototype.clear = function () {
        for (var i = 0; i < this._systems.length; i++) {
            var system = this._systems[i];
            __touch(4661);
            if (system.clear) {
                system.clear();
                __touch(4662);
            }
        }
        this._systems = [];
        __touch(4654);
        var allEntities = this.entityManager.getEntities();
        __touch(4655);
        for (var i = 0; i < allEntities.length; i++) {
            var entity = allEntities[i];
            __touch(4663);
            entity._world = null;
            __touch(4664);
        }
        this.entityManager.clear();
        __touch(4656);
        this._addedEntities = [];
        __touch(4657);
        this._changedEntities = [];
        __touch(4658);
        this._removedEntities = [];
        __touch(4659);
        this.gooRunner = null;
        __touch(4660);
    };
    __touch(4552);
    return World;
    __touch(4553);
});
__touch(4530);