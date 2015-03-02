define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6845);
    function MouseMoveAction() {
        Action.apply(this, arguments);
        __touch(6854);
        this.everyFrame = true;
        __touch(6855);
        this.updated = false;
        __touch(6856);
        this.eventListener = function () {
            this.updated = true;
            __touch(6858);
        }.bind(this);
        __touch(6857);
    }
    __touch(6846);
    MouseMoveAction.prototype = Object.create(Action.prototype);
    __touch(6847);
    MouseMoveAction.prototype.constructor = MouseMoveAction;
    __touch(6848);
    MouseMoveAction.external = {
        name: 'Mouse Move',
        type: 'controls',
        description: 'Listens for mouse movement and performs a transition',
        canTransition: true,
        parameters: [],
        transitions: [{
                key: 'mousemove',
                name: 'Mouse move',
                description: 'State to transition to on mouse movement'
            }]
    };
    __touch(6849);
    MouseMoveAction.prototype._setup = function () {
        document.addEventListener('mousemove', this.eventListener);
        __touch(6859);
    };
    __touch(6850);
    MouseMoveAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6860);
            fsm.send(this.transitions.mousemove);
            __touch(6861);
        }
    };
    __touch(6851);
    MouseMoveAction.prototype.exit = function () {
        document.removeEventListener('mousemove', this.eventListener);
        __touch(6862);
    };
    __touch(6852);
    return MouseMoveAction;
    __touch(6853);
});
__touch(6844);