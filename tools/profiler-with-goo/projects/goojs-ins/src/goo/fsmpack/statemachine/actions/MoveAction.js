define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3'
], function (Action, Vector3) {
    'use strict';
    __touch(6884);
    function MoveAction() {
        Action.apply(this, arguments);
        __touch(6892);
    }
    __touch(6885);
    MoveAction.prototype = Object.create(Action.prototype);
    __touch(6886);
    MoveAction.prototype.constructor = MoveAction;
    __touch(6887);
    MoveAction.external = {
        name: 'Move',
        type: 'animation',
        description: 'Moves the entity',
        parameters: [
            {
                name: 'Translation',
                key: 'translation',
                type: 'position',
                description: 'Move',
                'default': [
                    0,
                    0,
                    0
                ]
            },
            {
                name: 'Oriented',
                key: 'oriented',
                type: 'boolean',
                description: 'If true translate with rotation',
                'default': true
            },
            {
                name: 'Relative',
                key: 'relative',
                type: 'boolean',
                description: 'If true add to current translation',
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
    __touch(6888);
    MoveAction.prototype._setup = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6893);
        var transform = entity.transformComponent.transform;
        __touch(6894);
        this.forward = new Vector3().seta(this.translation);
        __touch(6895);
        var orientation = transform.rotation;
        __touch(6896);
        orientation.applyPost(this.forward);
        __touch(6897);
    };
    __touch(6889);
    MoveAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6898);
        var transform = entity.transformComponent.transform;
        __touch(6899);
        var translation = transform.translation;
        __touch(6900);
        if (this.oriented) {
            if (this.relative) {
                var forward = new Vector3().seta(this.translation);
                __touch(6902);
                var orientation = transform.rotation;
                __touch(6903);
                orientation.applyPost(forward);
                __touch(6904);
                if (this.everyFrame) {
                    forward.scale(fsm.getTpf() * 10);
                    __touch(6905);
                    translation.add(forward);
                    __touch(6906);
                } else {
                    translation.add(forward);
                    __touch(6907);
                }
            } else {
                translation.set(this.forward);
                __touch(6908);
            }
        } else {
            if (this.relative) {
                if (this.everyFrame) {
                    var tpf = fsm.getTpf() * 10;
                    __touch(6909);
                    translation.data[0] += this.translation[0] * tpf;
                    __touch(6910);
                    translation.data[1] += this.translation[1] * tpf;
                    __touch(6911);
                    translation.data[2] += this.translation[2] * tpf;
                    __touch(6912);
                } else {
                    translation.add(this.translation);
                    __touch(6913);
                }
            } else {
                translation.set(this.translation);
                __touch(6914);
            }
        }
        entity.transformComponent.setUpdated();
        __touch(6901);
    };
    __touch(6890);
    return MoveAction;
    __touch(6891);
});
__touch(6883);