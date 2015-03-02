define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3'
], function (Action, Vector3) {
    'use strict';
    __touch(6812);
    function LookAtAction() {
        Action.apply(this, arguments);
        __touch(6819);
    }
    __touch(6813);
    LookAtAction.prototype = Object.create(Action.prototype);
    __touch(6814);
    LookAtAction.prototype.constructor = LookAtAction;
    __touch(6815);
    LookAtAction.external = {
        name: 'Look At',
        type: 'animation',
        description: 'Reorients an entity so that it\'s facing a specific point',
        parameters: [
            {
                name: 'Look at',
                key: 'lookAt',
                type: 'position',
                description: 'Position to look at',
                'default': [
                    0,
                    0,
                    0
                ]
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
    __touch(6816);
    LookAtAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6820);
        var transformComponent = entity.transformComponent;
        __touch(6821);
        transformComponent.transform.lookAt(new Vector3(this.lookAt), Vector3.UNIT_Y);
        __touch(6822);
        transformComponent.setUpdated();
        __touch(6823);
    };
    __touch(6817);
    return LookAtAction;
    __touch(6818);
});
__touch(6811);