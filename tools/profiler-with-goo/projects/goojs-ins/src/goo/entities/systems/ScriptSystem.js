define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/util/ObjectUtil',
    'goo/scripts/Scripts'
], function (System, SystemBus, _, Scripts) {
    'use strict';
    __touch(5673);
    function ScriptSystem(world) {
        System.call(this, 'ScriptSystem', ['ScriptComponent']);
        __touch(5683);
        this._world = world;
        __touch(5684);
        var renderer = this._world.gooRunner.renderer;
        __touch(5685);
        this.context = {
            domElement: renderer.domElement,
            viewportWidth: renderer.viewportWidth,
            viewportHeight: renderer.viewportHeight,
            world: world,
            activeCameraEntity: null,
            worldData: {}
        };
        __touch(5686);
        SystemBus.addListener('goo.setCurrentCamera', function (data) {
            this.context.activeCameraEntity = data.entity;
            __touch(5691);
        }.bind(this));
        __touch(5687);
        SystemBus.addListener('goo.viewportResize', function (data) {
            this.context.viewportWidth = data.width;
            __touch(5692);
            this.context.viewportHeight = data.height;
            __touch(5693);
        }.bind(this));
        __touch(5688);
        this.manualSetup = false;
        __touch(5689);
        this.priority = 500;
        __touch(5690);
    }
    __touch(5674);
    ScriptSystem.prototype = Object.create(System.prototype);
    __touch(5675);
    ScriptSystem.prototype.constructor = ScriptSystem;
    __touch(5676);
    ScriptSystem.prototype.process = function (entities, tpf) {
        for (var i = 0; i < entities.length; i++) {
            var scriptComponent = entities[i].scriptComponent;
            __touch(5694);
            scriptComponent.run(entities[i], tpf);
            __touch(5695);
        }
    };
    __touch(5677);
    ScriptSystem.prototype.addedComponent = function (entity, component) {
        if (component.type === 'ScriptComponent' && !this.manualSetup) {
            component.setup(entity);
            __touch(5696);
        }
    };
    __touch(5678);
    ScriptSystem.prototype.removedComponent = function (entity, component) {
        if (component.type === 'ScriptComponent' && !this.manualSetup) {
            component.cleanup();
            __touch(5697);
        }
    };
    __touch(5679);
    ScriptSystem.prototype.clear = function () {
        for (var i = 0; i < this._activeEntities.length; i++) {
            var entity = this._activeEntities[i];
            __touch(5701);
            entity.scriptComponent.cleanup();
            __touch(5702);
        }
        this._world = null;
        __touch(5698);
        this.context = null;
        __touch(5699);
        System.prototype.clear.call(this);
        __touch(5700);
    };
    __touch(5680);
    Scripts.addClass('ScriptSystem', ScriptSystem);
    __touch(5681);
    return ScriptSystem;
    __touch(5682);
});
__touch(5672);