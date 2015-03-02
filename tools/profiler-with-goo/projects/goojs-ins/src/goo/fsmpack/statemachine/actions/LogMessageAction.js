define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6802);
    function LogMessageAction() {
        Action.apply(this, arguments);
        __touch(6809);
    }
    __touch(6803);
    LogMessageAction.prototype = Object.create(Action.prototype);
    __touch(6804);
    LogMessageAction.prototype.constructor = LogMessageAction;
    __touch(6805);
    LogMessageAction.external = {
        name: 'Log Message',
        description: 'Prints a message in the debug console of your browser',
        parameters: [
            {
                name: 'Message',
                key: 'message',
                type: 'string',
                description: 'Message to print',
                'default': 'hello'
            },
            {
                name: 'On every frame',
                key: 'everyFrame',
                type: 'boolean',
                description: 'Repeat this action every frame',
                'default': false
            }
        ],
        transitions: []
    };
    __touch(6806);
    LogMessageAction.prototype._run = function () {
        console.log(this.message);
        __touch(6810);
    };
    __touch(6807);
    return LogMessageAction;
    __touch(6808);
});
__touch(6801);