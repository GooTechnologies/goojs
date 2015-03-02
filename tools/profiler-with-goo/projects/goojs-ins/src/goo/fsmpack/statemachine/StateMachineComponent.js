define([
    'goo/entities/components/Component',
    'goo/util/ArrayUtil',
    'goo/entities/SystemBus'
], function (Component, ArrayUtil, SystemBus) {
    'use strict';
    __touch(6186);
    function StateMachineComponent() {
        this.type = 'StateMachineComponent';
        __touch(6207);
        this._machines = [];
        __touch(6208);
        this.entity = null;
        __touch(6209);
        this.vars = {};
        __touch(6210);
        this.system = null;
        __touch(6211);
        this.time = 0;
        __touch(6212);
        this.active = true;
        __touch(6213);
    }
    __touch(6187);
    StateMachineComponent.prototype = Object.create(Component.prototype);
    __touch(6188);
    StateMachineComponent.vars = {};
    __touch(6189);
    StateMachineComponent.getVariable = function (name) {
        return StateMachineComponent.vars[name];
        __touch(6214);
    };
    __touch(6190);
    StateMachineComponent.prototype.getVariable = function (name) {
        if (this.vars[name] !== undefined) {
            return this.vars[name];
            __touch(6215);
        } else {
            return StateMachineComponent.getVariable(name);
            __touch(6216);
        }
    };
    __touch(6191);
    StateMachineComponent.applyOnVariable = function (name, fun) {
        StateMachineComponent.vars[name] = fun(StateMachineComponent.vars[name]);
        __touch(6217);
    };
    __touch(6192);
    StateMachineComponent.prototype.applyOnVariable = function (name, fun) {
        if (this.vars[name] !== undefined) {
            this.vars[name] = fun(this.vars[name]);
            __touch(6218);
        } else {
            StateMachineComponent.applyOnVariable(name, fun);
            __touch(6219);
        }
    };
    __touch(6193);
    StateMachineComponent.prototype.defineVariable = function (name, initialValue) {
        this.vars[name] = initialValue;
        __touch(6220);
    };
    __touch(6194);
    StateMachineComponent.prototype.removeVariable = function (name) {
        delete this.vars[name];
        __touch(6221);
    };
    __touch(6195);
    StateMachineComponent.applyOnVariable = function (name, fun) {
        if (this.vars[name]) {
            this.vars[name] = fun(this.vars[name]);
            __touch(6222);
        } else if (StateMachineComponent.vars[name]) {
            StateMachineComponent.applyOnVariable(name, fun);
            __touch(6223);
        }
    };
    __touch(6196);
    StateMachineComponent.prototype.addMachine = function (machine) {
        machine._fsm = this;
        __touch(6224);
        machine.parent = this;
        __touch(6225);
        this._machines.push(machine);
        __touch(6226);
    };
    __touch(6197);
    StateMachineComponent.prototype.removeMachine = function (machine) {
        machine.recursiveRemove();
        __touch(6227);
        ArrayUtil.remove(this._machines, machine);
        __touch(6228);
    };
    __touch(6198);
    StateMachineComponent.prototype.init = function () {
        for (var i = 0; i < this._machines.length; i++) {
            var machine = this._machines[i];
            __touch(6229);
            machine.setRefs(this);
            __touch(6230);
            machine.reset();
            __touch(6231);
            machine.ready();
            __touch(6232);
        }
    };
    __touch(6199);
    StateMachineComponent.prototype.doEnter = function () {
        for (var i = 0; i < this._machines.length; i++) {
            var machine = this._machines[i];
            __touch(6233);
            machine.enter();
            __touch(6234);
        }
    };
    __touch(6200);
    StateMachineComponent.prototype.kill = function () {
        for (var i = 0; i < this._machines.length; i++) {
            var machine = this._machines[i];
            __touch(6235);
            machine.kill();
            __touch(6236);
        }
    };
    __touch(6201);
    StateMachineComponent.prototype.cleanup = function () {
        for (var i = 0; i < this._machines.length; i++) {
            var machine = this._machines[i];
            __touch(6237);
            machine.cleanup();
            __touch(6238);
        }
    };
    __touch(6202);
    StateMachineComponent.prototype.update = function () {
        if (this.active) {
            for (var i = 0; i < this._machines.length; i++) {
                var machine = this._machines[i];
                __touch(6239);
                machine.update();
                __touch(6240);
            }
        }
    };
    __touch(6203);
    StateMachineComponent.prototype.pause = function () {
        this.active = false;
        __touch(6241);
        SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.pause');
        __touch(6242);
    };
    __touch(6204);
    StateMachineComponent.prototype.play = function () {
        this.active = true;
        __touch(6243);
        SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.play');
        __touch(6244);
    };
    __touch(6205);
    return StateMachineComponent;
    __touch(6206);
});
__touch(6185);