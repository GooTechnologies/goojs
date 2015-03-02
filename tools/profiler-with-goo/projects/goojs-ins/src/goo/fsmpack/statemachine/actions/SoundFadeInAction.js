define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7394);
    function SoundFadeInAction() {
        Action.apply(this, arguments);
        __touch(7401);
    }
    __touch(7395);
    SoundFadeInAction.prototype = Object.create(Action.prototype);
    __touch(7396);
    SoundFadeInAction.prototype.constructor = SoundFadeInAction;
    __touch(7397);
    SoundFadeInAction.external = {
        name: 'Sound Fade In',
        type: 'sound',
        description: 'Fades in a sound.',
        canTransition: true,
        parameters: [
            {
                name: 'Sound',
                key: 'sound',
                type: 'sound',
                description: 'Sound',
                'default': 0
            },
            {
                name: 'Time (ms)',
                key: 'time',
                type: 'number',
                description: 'Time it takes for the fading to complete',
                'default': 1000
            }
        ],
        transitions: [{
                key: 'complete',
                name: 'On Completion',
                description: 'State to transition to when the movement completes'
            }]
    };
    __touch(7398);
    SoundFadeInAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7402);
        if (entity.hasComponent('SoundComponent')) {
            var sound = entity.soundComponent.getSoundById(this.sound);
            __touch(7403);
            if (sound) {
                sound.fadeIn(this.time / 1000).then(function () {
                    fsm.send(this.transitions.complete);
                    __touch(7405);
                }.bind(this));
                __touch(7404);
            }
        }
    };
    __touch(7399);
    return SoundFadeInAction;
    __touch(7400);
});
__touch(7393);