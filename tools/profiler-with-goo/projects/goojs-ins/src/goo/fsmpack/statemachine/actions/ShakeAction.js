define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3'
], function (Action, Vector3) {
    'use strict';
    __touch(7285);
    function ShakeAction() {
        Action.apply(this, arguments);
        __touch(7295);
    }
    __touch(7286);
    ShakeAction.prototype = Object.create(Action.prototype);
    __touch(7287);
    ShakeAction.prototype.constructor = ShakeAction;
    __touch(7288);
    ShakeAction.external = {
        name: 'Shake',
        type: 'animation',
        description: 'Shakes the entity. Optionally performs a transition.',
        canTransition: true,
        parameters: [
            {
                name: 'Start level',
                key: 'startLevel',
                type: 'float',
                description: 'Shake amount at start',
                'default': 0
            },
            {
                name: 'End level',
                key: 'endLevel',
                type: 'float',
                description: 'Shake amount at the end',
                'default': 10
            },
            {
                name: 'Time (ms)',
                key: 'time',
                type: 'float',
                description: 'Shake time amount',
                'default': 1000
            },
            {
                name: 'Speed',
                key: 'speed',
                type: 'string',
                control: 'dropdown',
                description: 'Speed of shaking',
                'default': 'Fast',
                options: [
                    'Fast',
                    'Medium',
                    'Slow'
                ]
            }
        ],
        transitions: [{
                key: 'complete',
                name: 'On Completion',
                description: 'State to transition to when the shake completes'
            }]
    };
    __touch(7289);
    ShakeAction.prototype.configure = function (settings) {
        this.startLevel = settings.startLevel;
        __touch(7296);
        this.endLevel = settings.endLevel;
        __touch(7297);
        this.time = settings.time;
        __touch(7298);
        this.speed = {
            'Fast': 1,
            'Medium': 2,
            'Slow': 4
        }[settings.speed];
        __touch(7299);
        this.easing = window.TWEEN.Easing.Quadratic.InOut;
        __touch(7300);
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7301);
    };
    __touch(7290);
    ShakeAction.prototype._setup = function () {
        this.tween = new window.TWEEN.Tween();
        __touch(7302);
    };
    __touch(7291);
    ShakeAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7303);
        }
    };
    __touch(7292);
    ShakeAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7304);
        var transformComponent = entity.transformComponent;
        __touch(7305);
        var translation = transformComponent.transform.translation;
        __touch(7306);
        var time = entity._world.time * 1000;
        __touch(7307);
        var oldVal = new Vector3();
        __touch(7308);
        var target = new Vector3();
        __touch(7309);
        var vel = new Vector3();
        __touch(7310);
        var that = this;
        __touch(7311);
        var iter = 0;
        __touch(7312);
        this.tween.from({ level: +this.startLevel }).to({ level: +this.endLevel }, +this.time).easing(this.easing).onUpdate(function () {
            iter++;
            __touch(7314);
            if (iter > that.speed) {
                iter = 0;
                __touch(7319);
                target.setd(-oldVal.data[0] + (Math.random() - 0.5) * this.level * 2, -oldVal.data[1] + (Math.random() - 0.5) * this.level * 2, -oldVal.data[2] + (Math.random() - 0.5) * this.level * 2);
                __touch(7320);
            }
            vel.setd(vel.data[0] * 0.98 + target.data[0] * 0.1, vel.data[1] * 0.98 + target.data[1] * 0.1, vel.data[2] * 0.98 + target.data[2] * 0.1);
            __touch(7315);
            translation.add(vel).sub(oldVal);
            __touch(7316);
            oldVal.copy(vel);
            __touch(7317);
            transformComponent.setUpdated();
            __touch(7318);
        }).onComplete(function () {
            translation.sub(oldVal);
            __touch(7321);
            transformComponent.setUpdated();
            __touch(7322);
            fsm.send(this.eventToEmit.channel);
            __touch(7323);
        }.bind(this)).start(time);
        __touch(7313);
    };
    __touch(7293);
    return ShakeAction;
    __touch(7294);
});
__touch(7284);