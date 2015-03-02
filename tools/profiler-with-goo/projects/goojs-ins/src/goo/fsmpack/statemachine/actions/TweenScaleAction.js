define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3'
], function (Action, Vector3) {
    'use strict';
    __touch(7754);
    function TweenScaleAction() {
        Action.apply(this, arguments);
        __touch(7764);
    }
    __touch(7755);
    TweenScaleAction.prototype = Object.create(Action.prototype);
    __touch(7756);
    TweenScaleAction.prototype.constructor = TweenScaleAction;
    __touch(7757);
    TweenScaleAction.external = {
        name: 'Tween Scale',
        type: 'animation',
        description: 'Transition to the set scale.',
        canTransition: true,
        parameters: [
            {
                name: 'Scale',
                key: 'to',
                type: 'position',
                description: 'Scale',
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
                description: 'State to transition to when the scaling completes'
            }]
    };
    __touch(7758);
    TweenScaleAction.prototype.configure = function (settings) {
        this.to = settings.to;
        __touch(7765);
        this.relative = settings.relative;
        __touch(7766);
        this.time = settings.time;
        __touch(7767);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7769);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7770);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7768);
    };
    __touch(7759);
    TweenScaleAction.prototype._setup = function () {
        this.tween = new window.TWEEN.Tween();
        __touch(7771);
    };
    __touch(7760);
    TweenScaleAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7772);
        }
    };
    __touch(7761);
    TweenScaleAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7773);
        var transformComponent = entity.transformComponent;
        __touch(7774);
        var scale = transformComponent.transform.scale;
        __touch(7775);
        var initialScale = new Vector3().copy(scale);
        __touch(7776);
        var fakeFrom = {
            x: initialScale.x,
            y: initialScale.y,
            z: initialScale.z
        };
        __touch(7777);
        var fakeTo;
        __touch(7778);
        var time = entity._world.time * 1000;
        __touch(7779);
        if (this.relative) {
            var to = Vector3.add(initialScale, this.to);
            __touch(7780);
            fakeTo = {
                x: to.x,
                y: to.y,
                z: to.z
            };
            __touch(7781);
            this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
                scale.setd(this.x, this.y, this.z);
                __touch(7783);
                transformComponent.setUpdated();
                __touch(7784);
            }).onComplete(function () {
                fsm.send(this.eventToEmit.channel);
                __touch(7785);
            }.bind(this)).start(time);
            __touch(7782);
        } else {
            fakeTo = {
                x: this.to[0],
                y: this.to[1],
                z: this.to[2]
            };
            __touch(7786);
            this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
                scale.setd(this.x, this.y, this.z);
                __touch(7788);
                transformComponent.setUpdated();
                __touch(7789);
            }).onComplete(function () {
                fsm.send(this.eventToEmit.channel);
                __touch(7790);
            }.bind(this)).start(time);
            __touch(7787);
        }
    };
    __touch(7762);
    return TweenScaleAction;
    __touch(7763);
});
__touch(7753);