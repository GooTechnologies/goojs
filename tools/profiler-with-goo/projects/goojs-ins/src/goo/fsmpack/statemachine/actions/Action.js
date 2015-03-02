define(['goo/fsmpack/statemachine/FSMUtil'], function (FSMUtil) {
    'use strict';
    __touch(6295);
    function Action(id, settings) {
        this.id = id;
        __touch(6306);
        this.configure(settings || {});
        __touch(6307);
    }
    __touch(6296);
    Action.prototype._setup = function () {
    };
    __touch(6297);
    Action.prototype._run = function () {
    };
    __touch(6298);
    Action.prototype.configure = function (settings) {
        FSMUtil.setParameters.call(this, settings, this.constructor.external.parameters);
        __touch(6308);
        FSMUtil.setTransitions.call(this, settings, this.constructor.external.transitions);
        __touch(6309);
    };
    __touch(6299);
    Action.prototype.enter = function (fsm) {
        this._setup(fsm);
        __touch(6310);
        if (!this.everyFrame) {
            this._run(fsm);
            __touch(6311);
        }
    };
    __touch(6300);
    Action.prototype.update = function (fsm) {
        if (this.everyFrame) {
            this._run(fsm);
            __touch(6312);
        }
    };
    __touch(6301);
    Action.prototype.ready = function () {
    };
    __touch(6302);
    Action.prototype.cleanup = function () {
    };
    __touch(6303);
    Action.prototype.exit = function () {
    };
    __touch(6304);
    return Action;
    __touch(6305);
});
__touch(6294);