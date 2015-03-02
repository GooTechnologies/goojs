define([
    'goo/entities/systems/System',
    'goo/fsmpack/statemachine/actions/Actions'
], function (System) {
    'use strict';
    __touch(6246);
    function StateMachineSystem(engine) {
        System.call(this, 'StateMachineSystem', ['StateMachineComponent']);
        __touch(6255);
        this.engine = engine;
        __touch(6256);
        this.resetRequest = false;
        __touch(6257);
        this.passive = false;
        __touch(6258);
        this.entered = true;
        __touch(6259);
        this.paused = false;
        __touch(6260);
        this.time = 0;
        __touch(6261);
        this.evalProxy = {
            test: function () {
                console.log('test');
                __touch(6264);
            }
        };
        __touch(6262);
        this.priority = 1000;
        __touch(6263);
    }
    __touch(6247);
    StateMachineSystem.prototype = Object.create(System.prototype);
    __touch(6248);
    StateMachineSystem.prototype.process = function (entities, tpf) {
        var component;
        __touch(6265);
        if (this.resetRequest) {
            this.resetRequest = false;
            __touch(6267);
            for (var i = 0; i < entities.length; i++) {
                component = entities[i].stateMachineComponent;
                __touch(6271);
                component.kill();
                __touch(6272);
                component.cleanup();
                __touch(6273);
            }
            this.time = 0;
            __touch(6268);
            if (window.TWEEN) {
                window.TWEEN.removeAll();
                __touch(6274);
            }
            this.passive = true;
            __touch(6269);
            return;
            __touch(6270);
        }
        this.time += tpf;
        __touch(6266);
        if (this.entered) {
            this.entered = false;
            __touch(6275);
            for (var i = 0; i < entities.length; i++) {
                component = entities[i].stateMachineComponent;
                __touch(6276);
                component.init();
                __touch(6277);
                component.doEnter();
                __touch(6278);
            }
        }
        if (window.TWEEN) {
            window.TWEEN.update(this.engine.world.time * 1000);
            __touch(6279);
        }
        for (var i = 0; i < entities.length; i++) {
            component = entities[i].stateMachineComponent;
            __touch(6280);
            component.update(tpf);
            __touch(6281);
        }
    };
    __touch(6249);
    StateMachineSystem.prototype.inserted = function (entity) {
        var component = entity.stateMachineComponent;
        __touch(6282);
        component.entity = entity;
        __touch(6283);
        component.system = this;
        __touch(6284);
        component.init();
        __touch(6285);
    };
    __touch(6250);
    StateMachineSystem.prototype.pause = function () {
        this.passive = true;
        __touch(6286);
        this.paused = true;
        __touch(6287);
    };
    __touch(6251);
    StateMachineSystem.prototype.play = function () {
        this.passive = false;
        __touch(6288);
        if (!this.paused) {
            this.entered = true;
            __touch(6290);
        }
        this.paused = false;
        __touch(6289);
    };
    __touch(6252);
    StateMachineSystem.prototype.reset = function () {
        this.passive = false;
        __touch(6291);
        this.resetRequest = true;
        __touch(6292);
        this.paused = false;
        __touch(6293);
    };
    __touch(6253);
    return StateMachineSystem;
    __touch(6254);
});
__touch(6245);