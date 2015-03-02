define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/entities/SystemBus'
], function (Action, SystemBus) {
    'use strict';
    __touch(7508);
    function TransitionOnMessageAction() {
        Action.apply(this, arguments);
        __touch(7517);
        this.everyFrame = true;
        __touch(7518);
        this.updated = false;
        __touch(7519);
        this.eventListener = function () {
            this.updated = true;
            __touch(7521);
        }.bind(this);
        __touch(7520);
    }
    __touch(7509);
    TransitionOnMessageAction.prototype = Object.create(Action.prototype);
    __touch(7510);
    TransitionOnMessageAction.prototype.constructor = TransitionOnMessageAction;
    __touch(7511);
    TransitionOnMessageAction.external = {
        key: 'Transition on Message',
        name: 'Listen',
        type: 'transitions',
        description: 'Performs a transition on receiving a system bus message (a ping) on a specific channel',
        canTransition: true,
        parameters: [{
                name: 'Message channel',
                key: 'channel',
                type: 'string',
                description: 'Channel to listen to',
                'default': ''
            }],
        transitions: [{
                key: 'transition',
                name: 'To',
                description: 'State to transition to'
            }]
    };
    __touch(7512);
    TransitionOnMessageAction.prototype._setup = function () {
        SystemBus.addListener(this.channel, this.eventListener, false);
        __touch(7522);
    };
    __touch(7513);
    TransitionOnMessageAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(7523);
            fsm.send(this.transitions.transition);
            __touch(7524);
        }
    };
    __touch(7514);
    TransitionOnMessageAction.prototype.exit = function () {
        SystemBus.removeListener(this.channel, this.eventListener);
        __touch(7525);
    };
    __touch(7515);
    return TransitionOnMessageAction;
    __touch(7516);
});
__touch(7507);