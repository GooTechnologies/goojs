define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7407);
    function SoundFadeOutAction() {
        Action.apply(this, arguments);
        __touch(7414);
    }
    __touch(7408);
    SoundFadeOutAction.prototype = Object.create(Action.prototype);
    __touch(7409);
    SoundFadeOutAction.prototype.constructor = SoundFadeOutAction;
    __touch(7410);
    SoundFadeOutAction.external = {
        name: 'Sound Fade Out',
        type: 'sound',
        description: 'Fades out a sound and stops it.',
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
    __touch(7411);
    SoundFadeOutAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7415);
        if (entity.hasComponent('SoundComponent')) {
            var sound = entity.soundComponent.getSoundById(this.sound);
            __touch(7416);
            if (sound) {
                sound.fadeOut(this.time / 1000).then(function () {
                    fsm.send(this.transitions.complete);
                    __touch(7418);
                }.bind(this));
                __touch(7417);
            }
        }
    };
    __touch(7412);
    return SoundFadeOutAction;
    __touch(7413);
});
__touch(7406);