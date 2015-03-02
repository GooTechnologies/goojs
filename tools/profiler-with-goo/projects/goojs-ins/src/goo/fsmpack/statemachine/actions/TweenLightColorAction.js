define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7548);
    function TweenLightColorAction() {
        Action.apply(this, arguments);
        __touch(7558);
    }
    __touch(7549);
    TweenLightColorAction.prototype = Object.create(Action.prototype);
    __touch(7550);
    TweenLightColorAction.prototype.constructor = TweenLightColorAction;
    __touch(7551);
    TweenLightColorAction.external = {
        key: 'Tween Light Color',
        name: 'Tween Light',
        type: 'light',
        description: 'Tweens the color of the light',
        parameters: [
            {
                name: 'Color',
                key: 'to',
                type: 'vec3',
                control: 'color',
                description: 'Color of the light',
                'default': [
                    1,
                    1,
                    1
                ]
            },
            {
                name: 'Time (ms)',
                key: 'time',
                type: 'number',
                description: 'Time it takes for the transition to complete',
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
                description: 'State to transition to when the transition completes'
            }]
    };
    __touch(7552);
    TweenLightColorAction.prototype.configure = function (settings) {
        this.to = settings.to;
        __touch(7559);
        this.time = settings.time;
        __touch(7560);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7562);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7563);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7561);
    };
    __touch(7553);
    TweenLightColorAction.prototype._setup = function () {
        this.tween = new window.TWEEN.Tween();
        __touch(7564);
    };
    __touch(7554);
    TweenLightColorAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7565);
        }
    };
    __touch(7555);
    TweenLightColorAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7566);
        if (entity.lightComponent) {
            var lightComponent = entity.lightComponent;
            __touch(7567);
            var color = lightComponent.light.color;
            __touch(7568);
            var time = entity._world.time * 1000;
            __touch(7569);
            var fakeFrom = {
                x: color.x,
                y: color.y,
                z: color.z
            };
            __touch(7570);
            var fakeTo = {
                x: this.to[0],
                y: this.to[1],
                z: this.to[2]
            };
            __touch(7571);
            var old = {
                x: fakeFrom.x,
                y: fakeFrom.y,
                z: fakeFrom.z
            };
            __touch(7572);
            this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
                color.data[0] += this.x - old.x;
                __touch(7574);
                color.data[1] += this.y - old.y;
                __touch(7575);
                color.data[2] += this.z - old.z;
                __touch(7576);
                old.x = this.x;
                __touch(7577);
                old.y = this.y;
                __touch(7578);
                old.z = this.z;
                __touch(7579);
            }).onComplete(function () {
                fsm.send(this.eventToEmit.channel);
                __touch(7580);
            }.bind(this)).start(time);
            __touch(7573);
        }
    };
    __touch(7556);
    return TweenLightColorAction;
    __touch(7557);
});
__touch(7547);