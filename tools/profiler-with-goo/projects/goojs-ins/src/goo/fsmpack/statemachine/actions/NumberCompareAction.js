define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(6930);
    function NumberCompareAction() {
        Action.apply(this, arguments);
        __touch(6937);
    }
    __touch(6931);
    NumberCompareAction.prototype = Object.create(Action.prototype);
    __touch(6932);
    NumberCompareAction.prototype.configure = function (settings) {
        this.everyFrame = settings.everyFrame !== false;
        __touch(6938);
        this.leftHand = settings.leftHand || 0;
        __touch(6939);
        this.rightHand = settings.rightHand || 0;
        __touch(6940);
        this.tolerance = settings.tolerance || 0.0001;
        __touch(6941);
        this.lessThanEvent = { channel: settings.transitions.less };
        __touch(6942);
        this.equalEvent = { channel: settings.transitions.equal };
        __touch(6943);
        this.greaterThanEvent = { channel: settings.transitions.greater };
        __touch(6944);
    };
    __touch(6933);
    NumberCompareAction.external = {
        parameters: [
            {
                name: 'Left hand value',
                key: 'leftHand',
                type: 'float'
            },
            {
                name: 'Right hand value',
                key: 'rightHand',
                type: 'float'
            },
            {
                name: 'Tolerance',
                key: 'tolerance',
                type: 'float',
                'default': 0.001
            },
            {
                name: 'On every frame',
                key: 'everyFrame',
                type: 'boolean',
                description: 'Repeat this action every frame',
                'default': true
            }
        ],
        transitions: [
            {
                name: 'less',
                description: 'Event fired if left hand argument is smaller than right hand argument'
            },
            {
                name: 'equal',
                description: 'Event fired if both sides are approximately equal'
            },
            {
                name: 'greater',
                description: 'Event fired if left hand argument is greater than right hand argument'
            }
        ]
    };
    __touch(6934);
    NumberCompareAction.prototype._run = function (fsm) {
        var leftHand = FSMUtil.getValue(this.leftHand, fsm);
        __touch(6945);
        var rightHand = FSMUtil.getValue(this.rightHand, fsm);
        __touch(6946);
        var diff = rightHand - leftHand;
        __touch(6947);
        if (Math.abs(diff) <= this.tolerance) {
            if (this.equalEvent.channel) {
                fsm.send(this.equalEvent.channel);
                __touch(6948);
            }
        } else if (diff > 0) {
            if (this.lessThanEvent.channel) {
                fsm.send(this.lessThanEvent.channel);
                __touch(6949);
            }
        } else {
            if (this.greaterThanEvent.channel) {
                fsm.send(this.greaterThanEvent.channel);
                __touch(6950);
            }
        }
    };
    __touch(6935);
    return NumberCompareAction;
    __touch(6936);
});
__touch(6929);