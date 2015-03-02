define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6952);
    function PauseAnimationAction() {
        Action.apply(this, arguments);
        __touch(6959);
    }
    __touch(6953);
    PauseAnimationAction.prototype = Object.create(Action.prototype);
    __touch(6954);
    PauseAnimationAction.prototype.constructor = PauseAnimationAction;
    __touch(6955);
    PauseAnimationAction.external = {
        name: 'Pause Animation',
        type: 'animation',
        description: 'Pauses skeleton animations',
        parameters: [{
                name: 'On all entities',
                key: 'onAll',
                type: 'boolean',
                description: 'Pause animation on all entities or just one',
                'default': false
            }],
        transitions: []
    };
    __touch(6956);
    PauseAnimationAction.prototype._run = function (fsm) {
        if (this.onAll) {
            var world = fsm.getWorld();
            __touch(6960);
            var animationSystem = world.getSystem('AnimationSystem');
            __touch(6961);
            animationSystem.pause();
            __touch(6962);
        } else {
            var entity = fsm.getOwnerEntity();
            __touch(6963);
            if (entity.animationComponent) {
                entity.animationComponent.pause();
                __touch(6964);
            }
        }
    };
    __touch(6957);
    return PauseAnimationAction;
    __touch(6958);
});
__touch(6951);