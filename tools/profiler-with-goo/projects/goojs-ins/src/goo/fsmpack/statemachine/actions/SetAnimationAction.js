define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7144);
    function SetAnimationAction() {
        Action.apply(this, arguments);
        __touch(7151);
        this.everyFrame = false;
        __touch(7152);
    }
    __touch(7145);
    SetAnimationAction.prototype = Object.create(Action.prototype);
    __touch(7146);
    SetAnimationAction.prototype.constructor = SetAnimationAction;
    __touch(7147);
    SetAnimationAction.external = {
        name: 'Set Animation',
        type: 'animation',
        description: 'Transitions to a selected animation',
        parameters: [{
                name: 'Animation',
                key: 'animation',
                type: 'animation'
            }],
        transitions: [{
                key: 'complete',
                name: 'On completion',
                description: 'State to transition to when the target animation completes'
            }]
    };
    __touch(7148);
    SetAnimationAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7153);
        var that = this;
        __touch(7154);
        if (typeof this.animation === 'string' && entity.animationComponent) {
            entity.animationComponent.transitionTo(this.animation, true, function () {
                fsm.send(that.transitions.complete);
                __touch(7156);
            });
            __touch(7155);
        }
    };
    __touch(7149);
    return SetAnimationAction;
    __touch(7150);
});
__touch(7143);