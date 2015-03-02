define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(6389);
    function AddVariableAction() {
        Action.apply(this, arguments);
        __touch(6396);
    }
    __touch(6390);
    AddVariableAction.prototype = Object.create(Action.prototype);
    __touch(6391);
    AddVariableAction.prototype.configure = function (settings) {
        this.everyFrame = !!settings.everyFrame;
        __touch(6397);
        this.variable = settings.variable || null;
        __touch(6398);
        this.amount = settings.amount || 1;
        __touch(6399);
    };
    __touch(6392);
    AddVariableAction.external = {
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
    __touch(6393);
    AddVariableAction.prototype._run = function (fsm) {
        fsm.applyOnVariable(this.variable, function (v) {
            return v + FSMUtil.getValue(this.amount, fsm);
            __touch(6401);
        }.bind(this));
        __touch(6400);
    };
    __touch(6394);
    return AddVariableAction;
    __touch(6395);
});
__touch(6388);