define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Quaternion',
    'goo/math/Matrix3x3',
    'goo/math/MathUtils'
], function (Action, Quaternion, Matrix3x3, MathUtils) {
    'use strict';
    __touch(7721);
    function TweenRotationAction() {
        Action.apply(this, arguments);
        __touch(7731);
    }
    __touch(7722);
    TweenRotationAction.prototype = Object.create(Action.prototype);
    __touch(7723);
    TweenRotationAction.prototype.constructor = TweenRotationAction;
    __touch(7724);
    TweenRotationAction.external = {
        key: 'Tween Rotation',
        name: 'Tween Rotate',
        type: 'animation',
        description: 'Transition to the set rotation, in angles.',
        canTransition: true,
        parameters: [
            {
                name: 'Rotation',
                key: 'to',
                type: 'rotation',
                description: 'Rotation',
                'default': [
                    0,
                    0,
                    0
                ]
            },
            {
                name: 'Relative',
                key: 'relative',
                type: 'boolean',
                description: 'If true add, otherwise set',
                'default': true
            },
            {
                name: 'Time (ms)',
                key: 'time',
                type: 'number',
                description: 'Time it takes for this movement to complete',
                'default': 1000
            },
            {
                name: 'Easing type',
                key: 'easing1',
                type: 'string',
                control: 'dropdown',
                description: 'Easing type',
                'default': 'Linear',
                options: [
                    'Linear',
                    'Quadratic',
                    'Exponential',
                    'Circular',
                    'Elastic',
                    'Back',
                    'Bounce'
                ]
            },
            {
                name: 'Direction',
                key: 'easing2',
                type: 'string',
                control: 'dropdown',
                description: 'Easing direction',
                'default': 'In',
                options: [
                    'In',
                    'Out',
                    'InOut'
                ]
            }
        ],
        transitions: [{
                key: 'complete',
                name: 'On Completion',
                description: 'State to transition to when the rotation completes'
            }]
    };
    __touch(7725);
    TweenRotationAction.prototype.configure = function (settings) {
        this.to = settings.to;
        __touch(7732);
        this.relative = settings.relative;
        __touch(7733);
        this.time = settings.time;
        __touch(7734);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7736);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7737);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7735);
    };
    __touch(7726);
    TweenRotationAction.prototype._setup = function () {
        this.tween = new window.TWEEN.Tween();
        __touch(7738);
    };
    __touch(7727);
    TweenRotationAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7739);
        }
    };
    __touch(7728);
    TweenRotationAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7740);
        var transformComponent = entity.transformComponent;
        __touch(7741);
        var rotation = transformComponent.transform.rotation;
        __touch(7742);
        var initialRotation = new Quaternion().fromRotationMatrix(rotation);
        __touch(7743);
        var finalRotation = new Quaternion().fromRotationMatrix(new Matrix3x3().fromAngles(this.to[0] * MathUtils.DEG_TO_RAD, this.to[1] * MathUtils.DEG_TO_RAD, this.to[2] * MathUtils.DEG_TO_RAD));
        __touch(7744);
        var workQuaternion = new Quaternion();
        __touch(7745);
        var time = entity._world.time * 1000;
        __touch(7746);
        if (this.relative) {
            Quaternion.mul(initialRotation, finalRotation, finalRotation);
            __touch(7748);
        }
        this.tween.from({ t: 0 }).to({ t: 1 }, +this.time).easing(this.easing).onUpdate(function () {
            Quaternion.slerp(initialRotation, finalRotation, this.t, workQuaternion);
            __touch(7749);
            rotation.copyQuaternion(workQuaternion);
            __touch(7750);
            transformComponent.setUpdated();
            __touch(7751);
        }).onComplete(function () {
            fsm.send(this.eventToEmit.channel);
            __touch(7752);
        }.bind(this)).start(time);
        __touch(7747);
    };
    __touch(7729);
    return TweenRotationAction;
    __touch(7730);
});
__touch(7720);