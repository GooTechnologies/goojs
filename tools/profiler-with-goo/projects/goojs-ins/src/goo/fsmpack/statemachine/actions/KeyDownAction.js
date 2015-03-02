define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(6733);
    function KeyDownAction() {
        Action.apply(this, arguments);
        __touch(6743);
        this.everyFrame = true;
        __touch(6744);
        this.updated = false;
        __touch(6745);
        this.eventListener = function (event) {
            if (this.key) {
                if (event.which === +this.key) {
                    this.updated = true;
                    __touch(6747);
                }
            }
        }.bind(this);
        __touch(6746);
    }
    __touch(6734);
    KeyDownAction.prototype = Object.create(Action.prototype);
    __touch(6735);
    KeyDownAction.prototype.constructor = KeyDownAction;
    __touch(6736);
    KeyDownAction.external = {
        name: 'Key Down',
        type: 'controls',
        description: 'Listens for a key press and performs a transition',
        canTransition: true,
        parameters: [{
                name: 'Key',
                key: 'key',
                type: 'string',
                control: 'key',
                description: 'Key to listen for',
                'default': 'A'
            }],
        transitions: [{
                key: 'keydown',
                name: 'Key down',
                description: 'State to transition to when the key is pressed'
            }]
    };
    __touch(6737);
    KeyDownAction.prototype.configure = function (settings) {
        this.key = settings.key ? FSMUtil.getKey(settings.key) : null;
        __touch(6748);
        this.transitions = { keydown: settings.transitions.keydown };
        __touch(6749);
    };
    __touch(6738);
    KeyDownAction.prototype._setup = function () {
        document.addEventListener('keydown', this.eventListener);
        __touch(6750);
    };
    __touch(6739);
    KeyDownAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6751);
            fsm.send(this.transitions.keydown);
            __touch(6752);
        }
    };
    __touch(6740);
    KeyDownAction.prototype.exit = function () {
        document.removeEventListener('keydown', this.eventListener);
        __touch(6753);
    };
    __touch(6741);
    return KeyDownAction;
    __touch(6742);
});
__touch(6732);