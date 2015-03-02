define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(6780);
    function KeyUpAction() {
        Action.apply(this, arguments);
        __touch(6790);
        this.everyFrame = true;
        __touch(6791);
        this.updated = false;
        __touch(6792);
        this.eventListener = function (event) {
            if (!this.key || event.which === +this.key) {
                this.updated = true;
                __touch(6794);
            }
        }.bind(this);
        __touch(6793);
    }
    __touch(6781);
    KeyUpAction.prototype = Object.create(Action.prototype);
    __touch(6782);
    KeyUpAction.prototype.constructor = KeyUpAction;
    __touch(6783);
    KeyUpAction.external = {
        name: 'Key Up',
        type: 'controls',
        description: 'Listens for a key release and performs a transition',
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
                key: 'keyup',
                name: 'Key up',
                description: 'State to transition to when the key is released'
            }]
    };
    __touch(6784);
    KeyUpAction.prototype.configure = function (settings) {
        this.key = settings.key ? FSMUtil.getKey(settings.key) : null;
        __touch(6795);
        this.transitions = { keyup: settings.transitions.keyup };
        __touch(6796);
    };
    __touch(6785);
    KeyUpAction.prototype._setup = function () {
        document.addEventListener('keyup', this.eventListener);
        __touch(6797);
    };
    __touch(6786);
    KeyUpAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6798);
            fsm.send(this.transitions.keyup);
            __touch(6799);
        }
    };
    __touch(6787);
    KeyUpAction.prototype.exit = function () {
        document.removeEventListener('keyup', this.eventListener);
        __touch(6800);
    };
    __touch(6788);
    return KeyUpAction;
    __touch(6789);
});
__touch(6779);