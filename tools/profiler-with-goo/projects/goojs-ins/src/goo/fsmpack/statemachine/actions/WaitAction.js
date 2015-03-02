define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7856);
    function WaitAction() {
        Action.apply(this, arguments);
        __touch(7864);
        this.everyFrame = true;
        __touch(7865);
        this.currentTime = 0;
        __touch(7866);
        this.totalWait = 0;
        __touch(7867);
    }
    __touch(7857);
    WaitAction.prototype = Object.create(Action.prototype);
    __touch(7858);
    WaitAction.prototype.constructor = WaitAction;
    __touch(7859);
    WaitAction.external = {
        name: 'Wait',
        type: 'animation',
        description: 'Performs a transition after a specified amount of time. ' + 'A random time can be set, this will add between 0 and the set random time to the specified wait time.',
        canTransition: true,
        parameters: [
            {
                name: 'Time (ms)',
                key: 'waitTime',
                type: 'number',
                description: 'Base time in milliseconds before transition fires',
                'default': 5000
            },
            {
                name: 'Random (ms)',
                key: 'randomTime',
                type: 'number',
                description: 'A random number of milliseconds (between 0 and this value) will be added to the base wait time',
                'default': 0
            }
        ],
        transitions: [{
                key: 'timeUp',
                name: 'Time up',
                description: 'State to transition to when time up'
            }]
    };
    __touch(7860);
    WaitAction.prototype._setup = function () {
        this.currentTime = 0;
        __touch(7868);
        this.totalWait = parseFloat(this.waitTime) + Math.random() * parseFloat(this.randomTime);
        __touch(7869);
    };
    __touch(7861);
    WaitAction.prototype._run = function (fsm) {
        this.currentTime += fsm.getTpf() * 1000;
        __touch(7870);
        if (this.currentTime >= this.totalWait) {
            fsm.send(this.transitions.timeUp);
            __touch(7871);
        }
    };
    __touch(7862);
    return WaitAction;
    __touch(7863);
});
__touch(7855);