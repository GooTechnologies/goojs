define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(7255);
    function SetRotationAction() {
        Action.apply(this, arguments);
        __touch(7262);
    }
    __touch(7256);
    SetRotationAction.prototype = Object.create(Action.prototype);
    __touch(7257);
    SetRotationAction.prototype.configure = function (settings) {
        this.everyFrame = !!settings.everyFrame;
        __touch(7263);
        this.entity = settings.entity || null;
        __touch(7264);
        this.amountX = settings.amountX || 0;
        __touch(7265);
        this.amountY = settings.amountY || 0;
        __touch(7266);
        this.amountZ = settings.amountZ || 0;
        __touch(7267);
    };
    __touch(7258);
    SetRotationAction.external = {
        parameters: [
            {
                name: 'Entity',
                key: 'entity',
                type: 'entity',
                description: 'Entity to move'
            },
            {
                name: 'Amount X',
                key: 'amountX',
                type: 'float',
                description: 'Amount to rotate on the X axis',
                'default': 0
            },
            {
                name: 'Amount Y',
                key: 'amountY',
                type: 'float',
                description: 'Amount to rotate on the Y axis',
                'default': 0
            },
            {
                name: 'Amount Z',
                key: 'amountZ',
                type: 'float',
                description: 'Amount to rotate on the Z axis',
                'default': 0
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
    __touch(7259);
    SetRotationAction.prototype._run = function (fsm) {
        if (this.entity !== null) {
            this.entity.transformComponent.transform.setRotationXYZ(FSMUtil.getValue(this.amountX, fsm), FSMUtil.getValue(this.amountY, fsm), FSMUtil.getValue(this.amountZ, fsm));
            __touch(7268);
            this.entity.transformComponent.setUpdated();
            __touch(7269);
        }
    };
    __touch(7260);
    return SetRotationAction;
    __touch(7261);
});
__touch(7254);