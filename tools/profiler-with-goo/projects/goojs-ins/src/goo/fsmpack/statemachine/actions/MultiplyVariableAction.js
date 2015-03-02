define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(6916);
    function MultiplyVariableAction() {
        Action.apply(this, arguments);
        __touch(6923);
    }
    __touch(6917);
    MultiplyVariableAction.prototype = Object.create(Action.prototype);
    __touch(6918);
    MultiplyVariableAction.prototype.configure = function (settings) {
        this.everyFrame = !!settings.everyFrame;
        __touch(6924);
        this.variable = settings.variable || null;
        __touch(6925);
        this.amount = settings.amount || 1;
        __touch(6926);
    };
    __touch(6919);
    MultiplyVariableAction.external = {
        parameters: [
            {
                name: 'Variable',
                key: 'variable',
                type: 'identifier'
            },
            {
                name: 'Amount',
                key: 'amount',
                type: 'float'
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
    __touch(6920);
    MultiplyVariableAction.prototype._run = function (fsm) {
        fsm.applyOnVariable(this.variable, function (v) {
            return v * FSMUtil.getValue(this.amount, fsm);
            __touch(6928);
        }.bind(this));
        __touch(6927);
    };
    __touch(6921);
    return MultiplyVariableAction;
    __touch(6922);
});
__touch(6915);