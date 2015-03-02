define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(6368);
    function AddPositionAction() {
        Action.apply(this, arguments);
        __touch(6375);
    }
    __touch(6369);
    AddPositionAction.prototype = Object.create(Action.prototype);
    __touch(6370);
    AddPositionAction.prototype.configure = function (settings) {
        this.everyFrame = settings.everyFrame !== false;
        __touch(6376);
        this.entity = settings.entity || null;
        __touch(6377);
        this.amountX = settings.amountX || 0;
        __touch(6378);
        this.amountY = settings.amountY || 0;
        __touch(6379);
        this.amountZ = settings.amountZ || 0;
        __touch(6380);
        this.speed = settings.speed || 1;
        __touch(6381);
    };
    __touch(6371);
    AddPositionAction.external = {
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
                description: 'Amount to move on the X axis',
                'default': 0
            },
            {
                name: 'Amount Y',
                key: 'amountY',
                type: 'float',
                description: 'Amount to move on the Y axis',
                'default': 0
            },
            {
                name: 'Amount Z',
                key: 'amountZ',
                type: 'float',
                description: 'Amount to move on the Z axis',
                'default': 0
            },
            {
                name: 'Speed',
                key: 'speed',
                type: 'float',
                description: 'Speed to multiply',
                'default': 1
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
    __touch(6372);
    AddPositionAction.prototype._run = function (fsm) {
        if (this.entity !== null) {
            var tpf = fsm.getTpf();
            __touch(6382);
            var dx = FSMUtil.getValue(this.amountX, fsm);
            __touch(6383);
            var dy = FSMUtil.getValue(this.amountY, fsm);
            __touch(6384);
            var dz = FSMUtil.getValue(this.amountZ, fsm);
            __touch(6385);
            this.entity.transformComponent.transform.translation.add_d(dx * this.speed * tpf, dy * this.speed * tpf, dz * this.speed * tpf);
            __touch(6386);
            this.entity.transformComponent.setUpdated();
            __touch(6387);
        }
    };
    __touch(6373);
    return AddPositionAction;
    __touch(6374);
});
__touch(6367);