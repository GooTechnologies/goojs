define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/entities/SystemBus'
], function (Action, SystemBus) {
    'use strict';
    __touch(6561);
    function EmitAction() {
        Action.apply(this, arguments);
        __touch(6568);
    }
    __touch(6562);
    EmitAction.prototype = Object.create(Action.prototype);
    __touch(6563);
    EmitAction.prototype.constructor = EmitAction;
    __touch(6564);
    EmitAction.external = {
        key: 'Emit message',
        name: 'Emit Message',
        type: 'transitions',
        description: 'Emits a message (a ping) to a channel on the bus. Messages can be listened to by the Listen action, or by scripts using the SystemBus.addListener(channel, callback) function.',
        parameters: [{
                name: 'Channel',
                key: 'channel',
                type: 'string',
                description: 'Channel to transmit a message (a ping) on',
                'default': ''
            }],
        transitions: []
    };
    __touch(6565);
    EmitAction.prototype._run = function () {
        SystemBus.emit(this.channel, this.data);
        __touch(6569);
    };
    __touch(6566);
    return EmitAction;
    __touch(6567);
});
__touch(6560);