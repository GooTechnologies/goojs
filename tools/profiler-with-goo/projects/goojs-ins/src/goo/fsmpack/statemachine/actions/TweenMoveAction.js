define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3'
], function (Action, Vector3) {
    'use strict';
    __touch(7621);
    function TweenMoveAction() {
        Action.apply(this, arguments);
        __touch(7631);
    }
    __touch(7622);
    TweenMoveAction.prototype = Object.create(Action.prototype);
    __touch(7623);
    TweenMoveAction.prototype.constructor = TweenMoveAction;
    __touch(7624);
    TweenMoveAction.external = {
        name: 'Tween Move',
        type: 'animation',
        description: 'Transition to the set location.',
        canTransition: true,
        parameters: [
            {
                name: 'Translation',
                key: 'to',
                type: 'position',
                description: 'Move',
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
                description: 'State to transition to when the movement completes'
            }]
    };
    __touch(7625);
    TweenMoveAction.prototype.configure = function (settings) {
        this.to = settings.to;
        __touch(7632);
        this.relative = settings.relative;
        __touch(7633);
        this.time = settings.time;
        __touch(7634);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7636);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7637);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7635);
    };
    __touch(7626);
    TweenMoveAction.prototype._setup = function () {
        this.tween = new window.TWEEN.Tween();
        __touch(7638);
    };
    __touch(7627);
    TweenMoveAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7639);
        }
    };
    __touch(7628);
    TweenMoveAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7640);
        var transformComponent = entity.transformComponent;
        __touch(7641);
        var translation = transformComponent.transform.translation;
        __touch(7642);
        var initialTranslation = new Vector3().copy(translation);
        __touch(7643);
        var time = entity._world.time * 1000;
        __touch(7644);
        var fakeFrom = {
            x: initialTranslation.x,
            y: initialTranslation.y,
            z: initialTranslation.z
        };
        __touch(7645);
        var fakeTo;
        __touch(7646);
        var old = {
            x: fakeFrom.x,
            y: fakeFrom.y,
            z: fakeFrom.z
        };
        __touch(7647);
        if (this.relative) {
            var to = Vector3.add(initialTranslation, this.to);
            __touch(7648);
            fakeTo = {
                x: to.x,
                y: to.y,
                z: to.z
            };
            __touch(7649);
            if (this.time === '0') {
                translation.data[0] += fakeTo.x - old.x;
                __touch(7650);
                translation.data[1] += fakeTo.y - old.y;
                __touch(7651);
                translation.data[2] += fakeTo.z - old.z;
                __touch(7652);
                transformComponent.setUpdated();
                __touch(7653);
                fsm.send(this.eventToEmit.channel);
                __touch(7654);
            } else {
                this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
                    translation.data[0] += this.x - old.x;
                    __touch(7656);
                    translation.data[1] += this.y - old.y;
                    __touch(7657);
                    translation.data[2] += this.z - old.z;
                    __touch(7658);
                    old.x = this.x;
                    __touch(7659);
                    old.y = this.y;
                    __touch(7660);
                    old.z = this.z;
                    __touch(7661);
                    transformComponent.setUpdated();
                    __touch(7662);
                }).onComplete(function () {
                    fsm.send(this.eventToEmit.channel);
                    __touch(7663);
                }.bind(this)).start(time);
                __touch(7655);
            }
        } else {
            fakeTo = {
                x: this.to[0],
                y: this.to[1],
                z: this.to[2]
            };
            __touch(7664);
            if (this.time === '0') {
                translation.data[0] += fakeTo.x - old.x;
                __touch(7665);
                translation.data[1] += fakeTo.y - old.y;
                __touch(7666);
                translation.data[2] += fakeTo.z - old.z;
                __touch(7667);
                transformComponent.setUpdated();
                __touch(7668);
                fsm.send(this.eventToEmit.channel);
                __touch(7669);
            } else {
                this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
                    translation.data[0] += this.x - old.x;
                    __touch(7671);
                    translation.data[1] += this.y - old.y;
                    __touch(7672);
                    translation.data[2] += this.z - old.z;
                    __touch(7673);
                    old.x = this.x;
                    __touch(7674);
                    old.y = this.y;
                    __touch(7675);
                    old.z = this.z;
                    __touch(7676);
                    transformComponent.setUpdated();
                    __touch(7677);
                }).onComplete(function () {
                    fsm.send(this.eventToEmit.channel);
                    __touch(7678);
                }.bind(this)).start(time);
                __touch(7670);
            }
        }
    };
    __touch(7629);
    return TweenMoveAction;
    __touch(7630);
});
__touch(7620);