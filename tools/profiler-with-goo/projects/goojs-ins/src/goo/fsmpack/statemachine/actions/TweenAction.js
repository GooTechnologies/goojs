define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/statemachine/FSMUtil'
], function (Action, FSMUtil) {
    'use strict';
    __touch(7527);
    function TweenAction() {
        Action.apply(this, arguments);
        __touch(7535);
    }
    __touch(7528);
    TweenAction.prototype = Object.create(Action.prototype);
    __touch(7529);
    TweenAction.prototype.constructor = TweenAction;
    __touch(7530);
    TweenAction.external = {
        name: 'Tween',
        description: 'Tween anything',
        canTransition: true,
        parameters: [
            {
                name: 'To',
                key: 'to',
                type: 'number',
                description: 'Value to tween to',
                'default': 0
            },
            {
                name: 'Object',
                key: 'objectName',
                type: 'string',
                description: 'Object',
                'default': ''
            },
            {
                name: 'Property',
                key: 'propertyName',
                type: 'string',
                description: 'Property',
                'default': ''
            },
            {
                name: 'Time (ms)',
                key: 'time',
                type: 'number',
                description: 'Time it takes for this tween to complete',
                'default': 1000
            },
            {
                name: 'Easing type',
                key: 'easing1',
                type: 'string',
                control: 'dropdown',
                description: 'Easing type',
                'default': 'Linear',
                options: [
                    'Linear',
                    'Quadratic',
                    'Exponential',
                    'Circular',
                    'Elastic',
                    'Back',
                    'Bounce'
                ]
            },
            {
                name: 'Direction',
                key: 'easing2',
                type: 'string',
                control: 'dropdown',
                description: 'Easing direction',
                'default': 'In',
                options: [
                    'In',
                    'Out',
                    'InOut'
                ]
            }
        ],
        transitions: [{
                key: 'complete',
                name: 'On Completion',
                description: 'State to transition to when the tween completes'
            }]
    };
    __touch(7531);
    TweenAction.prototype.configure = function (settings) {
        this.to = settings.to;
        __touch(7536);
        this.objectName = settings.objectName;
        __touch(7537);
        this.propertyName = settings.propertyName;
        __touch(7538);
        this.time = settings.time;
        __touch(7539);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7541);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7542);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7540);
    };
    __touch(7532);
    TweenAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7543);
        var object = eval('entity.' + this.objectName);
        __touch(7544);
        var from = object[this.propertyName];
        __touch(7545);
        FSMUtil.createComposableTween(entity, this.propertyName, from, this.to, this.time);
        __touch(7546);
    };
    __touch(7533);
    return TweenAction;
    __touch(7534);
});
__touch(7526);