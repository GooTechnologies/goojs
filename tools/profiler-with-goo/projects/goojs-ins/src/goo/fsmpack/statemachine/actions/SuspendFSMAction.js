define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7420);
    function SuspendFSMAction() {
        Action.apply(this, arguments);
        __touch(7427);
    }
    __touch(7421);
    SuspendFSMAction.prototype = Object.create(Action.prototype);
    __touch(7422);
    SuspendFSMAction.prototype.constructor = SuspendFSMAction;
    __touch(7423);
    SuspendFSMAction.external = {
        name: 'Suspend FSM',
        description: 'Suspends the state machine of another entity',
        parameters: [{
                name: 'Entity',
                key: 'entity',
                type: 'entity',
                description: 'Entity to suspend its FSM',
                'default': null
            }],
        transitions: []
    };
    __touch(7424);
    SuspendFSMAction.prototype._run = function () {
        if (this.entity && this.entity.stateMachineComponent) {
            this.entity.stateMachineComponent.pause();
            __touch(7428);
        }
    };
    __touch(7425);
    return SuspendFSMAction;
    __touch(7426);
});
__touch(7419);