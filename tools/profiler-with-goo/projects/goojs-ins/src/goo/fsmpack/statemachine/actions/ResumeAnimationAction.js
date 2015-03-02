define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7075);
    function ResumeAnimationAction() {
        Action.apply(this, arguments);
        __touch(7082);
    }
    __touch(7076);
    ResumeAnimationAction.prototype = Object.create(Action.prototype);
    __touch(7077);
    ResumeAnimationAction.prototype.constructor = ResumeAnimationAction;
    __touch(7078);
    ResumeAnimationAction.external = {
        name: 'Resume Animation',
        type: 'animation',
        description: 'Continues playing a skeleton animation',
        parameters: [{
                name: 'On all entities',
                key: 'onAll',
                type: 'boolean',
                description: 'Resume animation on all entities or just one',
                'default': false
            }],
        transitions: []
    };
    __touch(7079);
    ResumeAnimationAction.prototype._run = function (fsm) {
        if (this.onAll) {
            var world = fsm.getWorld();
            __touch(7083);
            var animationSystem = world.getSystem('AnimationSystem');
            __touch(7084);
            animationSystem.resume();
            __touch(7085);
        } else {
            var entity = fsm.getOwnerEntity();
            __touch(7086);
            if (entity.animationComponent) {
                entity.animationComponent.resume();
                __touch(7087);
            }
        }
    };
    __touch(7080);
    return ResumeAnimationAction;
    __touch(7081);
});
__touch(7074);