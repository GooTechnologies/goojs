define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(6755);
    function KeyPressedAction() {
        Action.apply(this, arguments);
        __touch(6765);
        this.everyFrame = true;
        __touch(6766);
        this.keyIsDown = false;
        __touch(6767);
        this.eventListenerDown = function (event) {
            if (event.which === +this.key) {
                this.keyIsDown = true;
                __touch(6770);
            }
        }.bind(this);
        __touch(6768);
        this.eventListenerUp = function (event) {
            if (event.which === +this.key) {
                document.removeEventListener('keydown', this.eventListenerUp);
                __touch(6771);
                this.keyIsDown = false;
                __touch(6772);
            }
        }.bind(this);
        __touch(6769);
    }
    __touch(6756);
    KeyPressedAction.prototype = Object.create(Action.prototype);
    __touch(6757);
    KeyPressedAction.prototype.constructor = KeyPressedAction;
    __touch(6758);
    KeyPressedAction.external = {
        name: 'Key Pressed',
        type: 'controls',
        description: 'Listens for a key press event and performs a transition. Works over transition boundaries.',
        canTransition: true,
        parameters: [{
                name: 'Key',
                key: 'key',
                type: 'string',
                control: 'key',
                description: 'Key to listen for'
            }],
        transitions: [{
                key: 'keydown',
                name: 'Key pressed',
                description: 'State to transition to when the key is pressed'
            }]
    };
    __touch(6759);
    KeyPressedAction.prototype.configure = function (settings) {
        this.key = settings.key ? FSMUtil.getKey(settings.key) : null;
        __touch(6773);
        this.transitions = { keydown: settings.transitions.keydown };
        __touch(6774);
    };
    __touch(6760);
    KeyPressedAction.prototype._setup = function () {
        document.addEventListener('keydown', this.eventListenerDown);
        __touch(6775);
        document.addEventListener('keyup', this.eventListenerUp);
        __touch(6776);
    };
    __touch(6761);
    KeyPressedAction.prototype._run = function (fsm) {
        if (this.keyIsDown) {
            fsm.send(this.transitions.keydown);
            __touch(6777);
        }
    };
    __touch(6762);
    KeyPressedAction.prototype.exit = function () {
        document.removeEventListener('keydown', this.eventListenerDown);
        __touch(6778);
    };
    __touch(6763);
    return KeyPressedAction;
    __touch(6764);
});
__touch(6754);