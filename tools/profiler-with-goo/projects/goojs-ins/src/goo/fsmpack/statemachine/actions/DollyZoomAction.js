define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3'
], function (Action, Vector3) {
    'use strict';
    __touch(6514);
    function DollyZoomAction() {
        Action.apply(this, arguments);
        __touch(6524);
    }
    __touch(6515);
    DollyZoomAction.prototype = Object.create(Action.prototype);
    __touch(6516);
    DollyZoomAction.prototype.constructor = DollyZoomAction;
    __touch(6517);
    DollyZoomAction.external = {
        name: 'Dolly Zoom',
        type: 'camera',
        description: 'Performs dolly zoom',
        parameters: [
            {
                name: 'Forward',
                key: 'forward',
                type: 'number',
                description: 'Number of units to move towards the focus point. Enter negative values to move away.',
                'default': 100
            },
            {
                name: 'Focus point',
                key: 'lookAt',
                type: 'position',
                description: 'Point to focus on while transitioning',
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
                description: 'Time',
                'default': 10000
            },
            {
                name: 'Easing type',
                key: 'easing1',
                type: 'string',
                control: 'dropdown',
                description: 'Easing',
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
    __touch(6518);
    DollyZoomAction.prototype.configure = function (settings) {
        this.forward = settings.forward;
        __touch(6525);
        this.lookAt = settings.lookAt;
        __touch(6526);
        this.time = settings.time;
        __touch(6527);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(6529);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(6530);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(6528);
    };
    __touch(6519);
    DollyZoomAction.prototype._setup = function (fsm) {
        this.tween = new window.TWEEN.Tween();
        __touch(6531);
        var entity = fsm.getOwnerEntity();
        __touch(6532);
        if (entity.cameraComponent && entity.cameraComponent.camera) {
            var camera = entity.cameraComponent.camera;
            __touch(6533);
            this.initialDistance = new Vector3(this.lookAt).distance(camera.translation);
            __touch(6534);
            this.eyeTargetScale = Math.tan(camera.fov * (Math.PI / 180) / 2) * this.initialDistance;
            __touch(6535);
        } else {
            this.eyeTargetScale = null;
            __touch(6536);
        }
    };
    __touch(6520);
    DollyZoomAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(6537);
        }
    };
    __touch(6521);
    DollyZoomAction.prototype._run = function (fsm) {
        if (this.eyeTargetScale) {
            var entity = fsm.getOwnerEntity();
            __touch(6538);
            var transformComponent = entity.transformComponent;
            __touch(6539);
            var translation = transformComponent.transform.translation;
            __touch(6540);
            var initialTranslation = new Vector3().copy(translation);
            __touch(6541);
            var camera = entity.cameraComponent.camera;
            __touch(6542);
            var time = entity._world.time * 1000;
            __touch(6543);
            var to = new Vector3(this.lookAt).sub(initialTranslation).normalize().scale(this.forward).add(initialTranslation);
            __touch(6544);
            var fakeFrom = {
                x: initialTranslation.x,
                y: initialTranslation.y,
                z: initialTranslation.z,
                d: this.initialDistance
            };
            __touch(6545);
            var fakeTo = {
                x: to.x,
                y: to.y,
                z: to.z,
                d: +this.initialDistance - +this.forward
            };
            __touch(6546);
            var old = {
                x: fakeFrom.x,
                y: fakeFrom.y,
                z: fakeFrom.z
            };
            __touch(6547);
            var that = this;
            __touch(6548);
            this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
                translation.data[0] += this.x - old.x;
                __touch(6550);
                translation.data[1] += this.y - old.y;
                __touch(6551);
                translation.data[2] += this.z - old.z;
                __touch(6552);
                old.x = this.x;
                __touch(6553);
                old.y = this.y;
                __touch(6554);
                old.z = this.z;
                __touch(6555);
                transformComponent.setUpdated();
                __touch(6556);
                var fov = 180 / Math.PI * 2 * Math.atan(that.eyeTargetScale / this.d);
                __touch(6557);
                camera.setFrustumPerspective(fov);
                __touch(6558);
            }).onComplete(function () {
                fsm.send(this.eventToEmit.channel);
                __touch(6559);
            }.bind(this)).start(time);
            __touch(6549);
        }
    };
    __touch(6522);
    return DollyZoomAction;
    __touch(6523);
});
__touch(6513);