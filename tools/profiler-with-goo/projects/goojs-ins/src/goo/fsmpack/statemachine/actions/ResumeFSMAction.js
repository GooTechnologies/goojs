define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7089);
    function ResumeFSMAction() {
        Action.apply(this, arguments);
        __touch(7096);
    }
    __touch(7090);
    ResumeFSMAction.prototype = Object.create(Action.prototype);
    __touch(7091);
    ResumeFSMAction.prototype.constructor = ResumeFSMAction;
    __touch(7092);
    ResumeFSMAction.external = {
        name: 'Resume FSM',
        description: 'Continue running a suspended state machine',
        parameters: [{
                name: 'Entity',
                key: 'entity',
                type: 'entity',
                description: 'Entity to resume its FSM',
                'default': null
            }],
        transitions: []
    };
    __touch(7093);
    ResumeFSMAction.prototype._run = function () {
        if (this.entity && this.entity.stateMachineComponent) {
            this.entity.stateMachineComponent.resume();
            __touch(7097);
        }
    };
    __touch(7094);
    return ResumeFSMAction;
    __touch(7095);
});
__touch(7088);