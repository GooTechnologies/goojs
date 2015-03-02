define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7030);
    function RandomTransitionAction() {
        Action.apply(this, arguments);
        __touch(7037);
    }
    __touch(7031);
    RandomTransitionAction.prototype = Object.create(Action.prototype);
    __touch(7032);
    RandomTransitionAction.prototype.constructor = RandomTransitionAction;
    __touch(7033);
    RandomTransitionAction.external = {
        name: 'Random Transition',
        type: 'transitions',
        description: 'Performs a random transition',
        canTransition: true,
        parameters: [{
                name: 'Skewness',
                key: 'skewness',
                type: 'float',
                control: 'slider',
                min: 0,
                max: 1,
                description: 'Determines the chance that the first destination is picked over the second',
                'default': 1
            }],
        transitions: [
            {
                key: 'transition1',
                name: 'Destination 1',
                description: 'First choice'
            },
            {
                key: 'transition2',
                name: 'Destination 2',
                description: 'Second choice'
            }
        ]
    };
    __touch(7034);
    RandomTransitionAction.prototype._run = function (fsm) {
        if (Math.random() < +this.skewness) {
            fsm.send(this.transitions.transition1);
            __touch(7038);
        } else {
            fsm.send(this.transitions.transition2);
            __touch(7039);
        }
    };
    __touch(7035);
    return RandomTransitionAction;
    __touch(7036);
});
__touch(7029);