define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3'
], function (Action, Vector3) {
    'use strict';
    __touch(7582);
    function TweenLookAtAction() {
        Action.apply(this, arguments);
        __touch(7592);
    }
    __touch(7583);
    TweenLookAtAction.prototype = Object.create(Action.prototype);
    __touch(7584);
    TweenLookAtAction.prototype.constructor = TweenLookAtAction;
    __touch(7585);
    TweenLookAtAction.external = {
        name: 'Tween Look At',
        type: 'animation',
        description: 'Transition the entity\'s rotation to face the set position.',
        canTransition: true,
        parameters: [
            {
                name: 'Position',
                key: 'to',
                type: 'position',
                description: 'Look at point',
                'default': [
                    0,
                    0,
                    0
                ]
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
                name: 'On completion',
                description: 'State to transition to when the transition completes'
            }]
    };
    __touch(7586);
    TweenLookAtAction.prototype.configure = function (settings) {
        this.to = settings.to;
        __touch(7593);
        this.relative = settings.relative;
        __touch(7594);
        this.time = settings.time;
        __touch(7595);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7597);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7598);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7596);
    };
    __touch(7587);
    TweenLookAtAction.prototype._setup = function () {
        this.tween = new window.TWEEN.Tween();
        __touch(7599);
    };
    __touch(7588);
    TweenLookAtAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7600);
        }
    };
    __touch(7589);
    TweenLookAtAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7601);
        var transformComponent = entity.transformComponent;
        __touch(7602);
        var transform = transformComponent.transform;
        __touch(7603);
        var distance = Vector3.distance(new Vector3(this.to), transform.translation);
        __touch(7604);
        var time = entity._world.time * 1000;
        __touch(7605);
        var initialLookAt = new Vector3(0, 0, 1);
        __touch(7606);
        var orientation = transform.rotation;
        __touch(7607);
        orientation.applyPost(initialLookAt);
        __touch(7608);
        initialLookAt.scale(distance);
        __touch(7609);
        var fakeFrom = {
            x: initialLookAt.x,
            y: initialLookAt.y,
            z: initialLookAt.z
        };
        __touch(7610);
        var fakeTo = {
            x: this.to[0],
            y: this.to[1],
            z: this.to[2]
        };
        __touch(7611);
        var tmpVec3 = new Vector3();
        __touch(7612);
        this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
            tmpVec3.data[0] = this.x;
            __touch(7614);
            tmpVec3.data[1] = this.y;
            __touch(7615);
            tmpVec3.data[2] = this.z;
            __touch(7616);
            transform.lookAt(tmpVec3, Vector3.UNIT_Y);
            __touch(7617);
            transformComponent.setUpdated();
            __touch(7618);
        }).onComplete(function () {
            fsm.send(this.eventToEmit.channel);
            __touch(7619);
        }.bind(this)).start(time);
        __touch(7613);
    };
    __touch(7590);
    return TweenLookAtAction;
    __touch(7591);
});
__touch(7581);