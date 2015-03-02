define(['goo/util/ArrayUtil'], function (ArrayUtil) {
    'use strict';
    __touch(6094);
    function State(uuid) {
        this.uuid = uuid;
        __touch(6115);
        this._fsm = null;
        __touch(6116);
        this.parent = null;
        __touch(6117);
        this._actions = [];
        __touch(6118);
        this._machines = [];
        __touch(6119);
        this._transitions = {};
        __touch(6120);
        this.vars = {};
        __touch(6121);
        this.transitionTarget = null;
        __touch(6122);
        this.proxy = {
            getTpf: function () {
                return this._fsm.entity._world.tpf;
                __touch(6124);
            }.bind(this),
            getWorld: function () {
                return this._fsm.entity._world;
                __touch(6125);
            }.bind(this),
            getTime: function () {
                return this._fsm.system.time;
                __touch(6126);
            }.bind(this),
            getState: function () {
                return this;
                __touch(6127);
            }.bind(this),
            getFsm: function () {
                return this._fsm;
                __touch(6128);
            }.bind(this),
            getOwnerEntity: function () {
                return this._fsm.entity;
                __touch(6129);
            }.bind(this),
            send: function (channels) {
                if (channels) {
                    if (typeof channels === 'string' && this._transitions[channels]) {
                        this.requestTransition(this._transitions[channels]);
                        __touch(6130);
                    }
                }
            }.bind(this),
            addListener: function (channelName, callback) {
                this._fsm._bus.addListener(channelName, callback);
                __touch(6131);
            }.bind(this),
            removeListener: function (channelName, callback) {
                this._fsm._bus.removeListener(channelName, callback);
                __touch(6132);
            }.bind(this),
            defineVariable: function (name, initialValue) {
                this.vars[name] = initialValue;
                __touch(6133);
            }.bind(this),
            removeVariable: function (name) {
                delete this.vars[name];
                __touch(6134);
            }.bind(this),
            getVariable: function (name) {
                if (this.vars[name] !== undefined) {
                    return this.vars[name];
                    __touch(6135);
                } else {
                    return this._fsm.getVariable(name);
                    __touch(6136);
                }
            }.bind(this),
            applyOnVariable: function (name, fun) {
                if (this.vars[name] !== undefined) {
                    this.vars[name] = fun(this.vars[name]);
                    __touch(6137);
                } else {
                    this._fsm.applyOnVariable(name, fun);
                    __touch(6138);
                }
            }.bind(this),
            getEvalProxy: function () {
                return this._fsm.system.evalProxy;
                __touch(6139);
            }.bind(this)
        };
        __touch(6123);
    }
    __touch(6095);
    State.prototype.setRefs = function (parentFSM) {
        this._fsm = parentFSM;
        __touch(6140);
        for (var i = 0; i < this._machines.length; i++) {
            var machine = this._machines[i];
            __touch(6141);
            machine.setRefs(parentFSM);
            __touch(6142);
        }
    };
    __touch(6096);
    State.prototype.isCurrentState = function () {
        return this === this.parent.getCurrentState();
        __touch(6143);
    };
    __touch(6097);
    State.prototype.requestTransition = function (target) {
        if (this.isCurrentState()) {
            this.transitionTarget = target;
            __touch(6144);
        }
    };
    __touch(6098);
    State.prototype.setTransition = function (eventName, target) {
        this._transitions[eventName] = target;
        __touch(6145);
    };
    __touch(6099);
    State.prototype.clearTransition = function (eventName) {
        delete this._transitions[eventName];
        __touch(6146);
    };
    __touch(6100);
    State.prototype.update = function () {
        for (var i = 0; i < this._actions.length; i++) {
            this._actions[i].update(this.proxy);
            __touch(6148);
            if (this.transitionTarget) {
                var tmp = this.transitionTarget;
                __touch(6149);
                this.transitionTarget = null;
                __touch(6150);
                return tmp;
                __touch(6151);
            }
        }
        var jump;
        __touch(6147);
        for (var i = 0; i < this._machines.length; i++) {
            var machine = this._machines[i];
            __touch(6152);
            jump = machine.update();
            __touch(6153);
            if (jump) {
                return jump;
                __touch(6154);
            }
        }
    };
    __touch(6101);
    State.prototype.reset = function () {
        for (var i = 0; i < this._machines.length; i++) {
            this._machines[i].reset();
            __touch(6155);
        }
    };
    __touch(6102);
    State.prototype.kill = function () {
        for (var i = 0; i < this._machines.length; i++) {
            this._machines[i].kill();
            __touch(6156);
        }
        for (var i = 0; i < this._actions.length; i++) {
            this._actions[i].exit(this.proxy);
            __touch(6157);
        }
    };
    __touch(6103);
    State.prototype.ready = function () {
        for (var i = 0; i < this._machines.length; i++) {
            this._machines[i].ready();
            __touch(6158);
        }
        for (var i = 0; i < this._actions.length; i++) {
            this._actions[i].ready(this.proxy);
            __touch(6159);
        }
    };
    __touch(6104);
    State.prototype.cleanup = function () {
        for (var i = 0; i < this._machines.length; i++) {
            this._machines[i].cleanup();
            __touch(6160);
        }
        for (var i = 0; i < this._actions.length; i++) {
            this._actions[i].cleanup(this.proxy);
            __touch(6161);
        }
    };
    __touch(6105);
    State.prototype.enter = function () {
        for (var i = 0; i < this._actions.length; i++) {
            this._actions[i].enter(this.proxy);
            __touch(6162);
        }
        for (var i = 0; i < this._machines.length; i++) {
            this._machines[i].enter();
            __touch(6163);
        }
    };
    __touch(6106);
    State.prototype.getAction = function (id) {
        if (!this._actions) {
            return undefined;
            __touch(6165);
        }
        for (var i = 0; i < this._actions.length; i++) {
            var action = this._actions[i];
            __touch(6166);
            if (id !== undefined && action.id === id) {
                return action;
                __touch(6167);
            }
        }
        return undefined;
        __touch(6164);
    };
    __touch(6107);
    State.prototype.addAction = function (action) {
        if (this._actions[action.id]) {
            return;
            __touch(6169);
        }
        if (action.onCreate) {
            action.onCreate(this.proxy);
            __touch(6170);
        }
        this._actions.push(action);
        __touch(6168);
    };
    __touch(6108);
    State.prototype.recursiveRemove = function () {
        this.removeAllActions();
        __touch(6171);
        for (var i = 0; i < this._machines.length; i++) {
            this._machines[i].recursiveRemove();
            __touch(6173);
        }
        this._machines = [];
        __touch(6172);
    };
    __touch(6109);
    State.prototype.removeAllActions = function () {
        for (var i = 0; i < this._actions.length; i++) {
            var action = this._actions[i];
            __touch(6175);
            if (action.onDestroy) {
                action.onDestroy(this.proxy);
                __touch(6176);
            }
        }
        this._actions = [];
        __touch(6174);
    };
    __touch(6110);
    State.prototype.removeAction = function (action) {
        if (action.onDestroy) {
            action.onDestroy(this.proxy);
            __touch(6178);
        }
        ArrayUtil.remove(this._actions, action);
        __touch(6177);
    };
    __touch(6111);
    State.prototype.addMachine = function (machine) {
        var index = this._machines.indexOf(machine);
        __touch(6179);
        if (index === -1) {
            machine._fsm = this._fsm;
            __touch(6180);
            machine.parent = this;
            __touch(6181);
            this._machines.push(machine);
            __touch(6182);
        }
    };
    __touch(6112);
    State.prototype.removeMachine = function (machine) {
        machine.recursiveRemove();
        __touch(6183);
        ArrayUtil.remove(this._machines, machine);
        __touch(6184);
    };
    __touch(6113);
    return State;
    __touch(6114);
});
__touch(6093);