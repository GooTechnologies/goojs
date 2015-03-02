define([], function () {
    'use strict';
    __touch(6032);
    function Machine(name) {
        this.name = name;
        __touch(6050);
        this._fsm = null;
        __touch(6051);
        this.initialState = 'entry';
        __touch(6052);
        this.currentState = null;
        __touch(6053);
        this.parent = null;
        __touch(6054);
    }
    __touch(6033);
    Machine.prototype.setRefs = function (parentFSM) {
        this._fsm = parentFSM;
        __touch(6055);
        var keys = Object.keys(this._states);
        __touch(6056);
        for (var i = 0; i < keys.length; i++) {
            var state = this._states[keys[i]];
            __touch(6057);
            state.setRefs(parentFSM);
            __touch(6058);
        }
    };
    __touch(6034);
    Machine.prototype.update = function () {
        if (this.currentState) {
            var jump = this.currentState.update();
            __touch(6059);
            if (jump && this.contains(jump)) {
                this.currentState.kill();
                __touch(6061);
                this.setState(this._states[jump]);
                __touch(6062);
            }
            return jump;
            __touch(6060);
        }
    };
    __touch(6035);
    Machine.prototype.contains = function (uuid) {
        return !!this._states[uuid];
        __touch(6063);
    };
    __touch(6036);
    Machine.prototype.setState = function (state) {
        this.currentState = state;
        __touch(6064);
        this.currentState.reset();
        __touch(6065);
        this.currentState.enter();
        __touch(6066);
    };
    __touch(6037);
    Machine.prototype.reset = function () {
        this.currentState = this._states[this.initialState];
        __touch(6067);
        if (this.currentState) {
            this.currentState.reset();
            __touch(6068);
        }
    };
    __touch(6038);
    Machine.prototype.kill = function () {
        if (this.currentState) {
            this.currentState.kill();
            __touch(6069);
        }
    };
    __touch(6039);
    Machine.prototype.ready = function () {
        var keys = Object.keys(this._states);
        __touch(6070);
        for (var i = 0; i < keys.length; i++) {
            var state = this._states[keys[i]];
            __touch(6071);
            state.ready();
            __touch(6072);
        }
    };
    __touch(6040);
    Machine.prototype.cleanup = function () {
        var keys = Object.keys(this._states);
        __touch(6073);
        for (var i = 0; i < keys.length; i++) {
            var state = this._states[keys[i]];
            __touch(6074);
            state.cleanup();
            __touch(6075);
        }
    };
    __touch(6041);
    Machine.prototype.enter = function () {
        if (this.currentState) {
            this.currentState.enter();
            __touch(6076);
        }
    };
    __touch(6042);
    Machine.prototype.getCurrentState = function () {
        return this.currentState;
        __touch(6077);
    };
    __touch(6043);
    Machine.prototype.addState = function (state) {
        if (!this._states) {
            this._states = {};
            __touch(6081);
            this.initialState = state.uuid;
            __touch(6082);
        }
        state.parent = this;
        __touch(6078);
        state._fsm = this._fsm;
        __touch(6079);
        this._states[state.uuid] = state;
        __touch(6080);
    };
    __touch(6044);
    Machine.prototype.removeFromParent = function () {
        if (this.parent) {
            this.parent.removeMachine(this);
            __touch(6083);
        }
    };
    __touch(6045);
    Machine.prototype.recursiveRemove = function () {
        var keys = Object.keys(this._states);
        __touch(6084);
        for (var i = 0; i < keys.length; i++) {
            var state = this._states[keys[i]];
            __touch(6086);
            state.recursiveRemove();
            __touch(6087);
        }
        this._states = {};
        __touch(6085);
    };
    __touch(6046);
    Machine.prototype.removeState = function (id) {
        if (!this._states[id]) {
            return;
            __touch(6089);
        }
        if (this.initialState === id) {
            throw new Error('Cannot remove initial state');
            __touch(6090);
        }
        if (this.currentState === this._states[id]) {
            this.reset();
            __touch(6091);
        }
        delete this._states[id];
        __touch(6088);
    };
    __touch(6047);
    Machine.prototype.setInitialState = function (initialState) {
        this.initialState = initialState;
        __touch(6092);
    };
    __touch(6048);
    return Machine;
    __touch(6049);
});
__touch(6031);