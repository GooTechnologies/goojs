define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(7271);
    function SetVariableAction() {
        Action.apply(this, arguments);
        __touch(7278);
    }
    __touch(7272);
    SetVariableAction.prototype = Object.create(Action.prototype);
    __touch(7273);
    SetVariableAction.prototype.configure = function (settings) {
        this.everyFrame = settings.everyFrame !== false;
        __touch(7279);
        this.variable = settings.variable || null;
        __touch(7280);
        this.amount = settings.amount || 0;
        __touch(7281);
    };
    __touch(7274);
    SetVariableAction.external = {
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
    __touch(7275);
    SetVariableAction.prototype._run = function (fsm) {
        if (this.variable) {
            fsm.applyOnVariable(this.variable, function () {
                return FSMUtil.getValue(this.amount, fsm);
                __touch(7283);
            }.bind(this));
            __touch(7282);
        }
    };
    __touch(7276);
    return SetVariableAction;
    __touch(7277);
});
__touch(7270);