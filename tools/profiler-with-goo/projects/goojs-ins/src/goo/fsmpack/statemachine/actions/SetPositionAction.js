define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(7208);
    function SetPositionAction() {
        Action.apply(this, arguments);
        __touch(7215);
    }
    __touch(7209);
    SetPositionAction.prototype = Object.create(Action.prototype);
    __touch(7210);
    SetPositionAction.prototype.configure = function (settings) {
        this.everyFrame = !!settings.everyFrame;
        __touch(7216);
        this.entity = settings.entity || null;
        __touch(7217);
        this.amountX = settings.amountX || 0;
        __touch(7218);
        this.amountY = settings.amountY || 0;
        __touch(7219);
        this.amountZ = settings.amountZ || 0;
        __touch(7220);
    };
    __touch(7211);
    SetPositionAction.external = {
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
                description: 'Position on the X axis',
                'default': 0
            },
            {
                name: 'Amount Y',
                key: 'amountY',
                type: 'float',
                description: 'Position on the Y axis',
                'default': 0
            },
            {
                name: 'Amount Z',
                key: 'amountZ',
                type: 'float',
                description: 'Position on the Z axis',
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
    __touch(7212);
    SetPositionAction.prototype._run = function (fsm) {
        if (this.entity !== null) {
            this.entity.transformComponent.transform.translation.setd(FSMUtil.getValue(this.amountX, fsm), FSMUtil.getValue(this.amountY, fsm), FSMUtil.getValue(this.amountZ, fsm));
            __touch(7221);
            this.entity.transformComponent.setUpdated();
            __touch(7222);
        }
    };
    __touch(7213);
    return SetPositionAction;
    __touch(7214);
});
__touch(7207);