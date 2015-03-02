define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/MathUtils'
], function (Action, MathUtils) {
    'use strict';
    __touch(7099);
    function RotateAction() {
        Action.apply(this, arguments);
        __touch(7106);
    }
    __touch(7100);
    RotateAction.prototype = Object.create(Action.prototype);
    __touch(7101);
    RotateAction.prototype.constructor = RotateAction;
    __touch(7102);
    RotateAction.external = {
        name: 'Rotate',
        type: 'animation',
        description: 'Rotates the entity with the set angles (in degrees).',
        parameters: [
            {
                name: 'Rotation',
                key: 'rotation',
                type: 'rotation',
                description: 'Rotate',
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
                description: 'If true add to current rotation',
                'default': true
            },
            {
                name: 'On every frame',
                key: 'everyFrame',
                type: 'boolean',
                description: 'Repeat this action every frame',
                'default': true
            }
        ],
        transitions: []
    };
    __touch(7103);
    RotateAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7107);
        var transform = entity.transformComponent.transform;
        __touch(7108);
        if (this.relative) {
            if (this.everyFrame) {
                var tpf = fsm.getTpf();
                __touch(7110);
                transform.rotation.rotateX(this.rotation[0] * MathUtils.DEG_TO_RAD * tpf);
                __touch(7111);
                transform.rotation.rotateY(this.rotation[1] * MathUtils.DEG_TO_RAD * tpf);
                __touch(7112);
                transform.rotation.rotateZ(this.rotation[2] * MathUtils.DEG_TO_RAD * tpf);
                __touch(7113);
            } else {
                transform.rotation.rotateX(this.rotation[0] * MathUtils.DEG_TO_RAD);
                __touch(7114);
                transform.rotation.rotateY(this.rotation[1] * MathUtils.DEG_TO_RAD);
                __touch(7115);
                transform.rotation.rotateZ(this.rotation[2] * MathUtils.DEG_TO_RAD);
                __touch(7116);
            }
        } else {
            if (this.everyFrame) {
                var tpf = fsm.getTpf();
                __touch(7117);
                transform.setRotationXYZ(this.rotation[0] * MathUtils.DEG_TO_RAD * tpf, this.rotation[1] * MathUtils.DEG_TO_RAD * tpf, this.rotation[2] * MathUtils.DEG_TO_RAD * tpf);
                __touch(7118);
            } else {
                transform.setRotationXYZ(this.rotation[0] * MathUtils.DEG_TO_RAD, this.rotation[1] * MathUtils.DEG_TO_RAD, this.rotation[2] * MathUtils.DEG_TO_RAD);
                __touch(7119);
            }
        }
        entity.transformComponent.setUpdated();
        __touch(7109);
    };
    __touch(7104);
    return RotateAction;
    __touch(7105);
});
__touch(7098);