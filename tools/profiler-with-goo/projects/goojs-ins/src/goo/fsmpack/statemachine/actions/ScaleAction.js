define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7121);
    function ScaleAction() {
        Action.apply(this, arguments);
        __touch(7128);
    }
    __touch(7122);
    ScaleAction.prototype = Object.create(Action.prototype);
    __touch(7123);
    ScaleAction.prototype.constructor = ScaleAction;
    __touch(7124);
    ScaleAction.external = {
        name: 'Scale',
        type: 'animation',
        description: 'Scales the entity',
        parameters: [
            {
                name: 'Scale',
                key: 'scale',
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
                description: 'If true, add/multiply the current scaling',
                'default': true
            },
            {
                name: 'Multiply',
                key: 'multiply',
                type: 'boolean',
                description: 'If true multiply, otherwise add',
                'default': false
            },
            {
                name: 'On every frame',
                key: 'everyFrame',
                type: 'boolean',
                description: 'Repeat this action every frame',
                'default': false
            }
        ],
        transitions: []
    };
    __touch(7125);
    ScaleAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7129);
        var transform = entity.transformComponent.transform;
        __touch(7130);
        if (this.relative) {
            if (this.multiply) {
                if (this.everyFrame) {
                    var tpf = fsm.getTpf() * 10;
                    __touch(7132);
                    transform.scale.data[0] *= this.scale[0] * tpf;
                    __touch(7133);
                    transform.scale.data[1] *= this.scale[1] * tpf;
                    __touch(7134);
                    transform.scale.data[2] *= this.scale[2] * tpf;
                    __touch(7135);
                } else {
                    transform.scale.mul(this.scale);
                    __touch(7136);
                }
            } else {
                if (this.everyFrame) {
                    var tpf = fsm.getTpf() * 10;
                    __touch(7137);
                    transform.scale.data[0] += this.scale[0] * tpf;
                    __touch(7138);
                    transform.scale.data[1] += this.scale[1] * tpf;
                    __touch(7139);
                    transform.scale.data[2] += this.scale[2] * tpf;
                    __touch(7140);
                } else {
                    transform.scale.add(this.scale);
                    __touch(7141);
                }
            }
        } else {
            transform.scale.set(this.scale);
            __touch(7142);
        }
        entity.transformComponent.setUpdated();
        __touch(7131);
    };
    __touch(7126);
    return ScaleAction;
    __touch(7127);
});
__touch(7120);