define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6620);
    function GetPositionAction() {
        Action.apply(this, arguments);
        __touch(6627);
    }
    __touch(6621);
    GetPositionAction.prototype = Object.create(Action.prototype);
    __touch(6622);
    GetPositionAction.prototype.configure = function (settings) {
        this.everyFrame = settings.everyFrame !== false;
        __touch(6628);
        this.entity = settings.entity || null;
        __touch(6629);
        this.variableX = settings.variableX || null;
        __touch(6630);
        this.variableY = settings.variableY || null;
        __touch(6631);
        this.variableZ = settings.variableZ || null;
        __touch(6632);
    };
    __touch(6623);
    GetPositionAction.external = {
        parameters: [
            {
                name: 'VariableX',
                key: 'variableX',
                type: 'identifier'
            },
            {
                name: 'VariableY',
                key: 'variableY',
                type: 'identifier'
            },
            {
                name: 'VariableZ',
                key: 'variableZ',
                type: 'identifier'
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
    __touch(6624);
    GetPositionAction.prototype._run = function (fsm) {
        var translation = this.entity.transformComponent.transform.translation;
        __touch(6633);
        if (this.entity !== null) {
            if (this.variableX) {
                fsm.applyOnVariable(this.variableX, function () {
                    return translation.data[0];
                    __touch(6635);
                });
                __touch(6634);
            }
            if (this.variableY) {
                fsm.applyOnVariable(this.variableY, function () {
                    return translation.data[1];
                    __touch(6637);
                });
                __touch(6636);
            }
            if (this.variableZ) {
                fsm.applyOnVariable(this.variableZ, function () {
                    return translation.data[2];
                    __touch(6639);
                });
                __touch(6638);
            }
        }
    };
    __touch(6625);
    return GetPositionAction;
    __touch(6626);
});
__touch(6619);