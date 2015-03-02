define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7498);
    function TransitionAction() {
        Action.apply(this, arguments);
        __touch(7505);
    }
    __touch(7499);
    TransitionAction.prototype = Object.create(Action.prototype);
    __touch(7500);
    TransitionAction.prototype.constructor = TransitionAction;
    __touch(7501);
    TransitionAction.external = {
        name: 'Transition',
        type: 'transitions',
        description: 'Transition to a selected state',
        canTransition: true,
        parameters: [],
        transitions: [{
                key: 'transition',
                name: 'To',
                description: 'State to transition to'
            }]
    };
    __touch(7502);
    TransitionAction.prototype._run = function (fsm) {
        fsm.send(this.transitions.transition);
        __touch(7506);
    };
    __touch(7503);
    return TransitionAction;
    __touch(7504);
});
__touch(7497);