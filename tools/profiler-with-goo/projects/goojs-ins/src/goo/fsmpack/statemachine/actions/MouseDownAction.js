define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6825);
    function MouseDownAction() {
        Action.apply(this, arguments);
        __touch(6834);
        this.everyFrame = true;
        __touch(6835);
        this.updated = false;
        __touch(6836);
        this.eventListener = function (event) {
            this.button = event.button;
            __touch(6838);
            this.updated = true;
            __touch(6839);
        }.bind(this);
        __touch(6837);
    }
    __touch(6826);
    MouseDownAction.prototype = Object.create(Action.prototype);
    __touch(6827);
    MouseDownAction.prototype.constructor = MouseDownAction;
    __touch(6828);
    MouseDownAction.external = {
        name: 'Mouse Down',
        type: 'controls',
        description: 'Listens for a mouse button press and performs a transition',
        canTransition: true,
        parameters: [],
        transitions: [
            {
                key: 'mouseLeftDown',
                name: 'Left mouse down',
                description: 'State to transition to when the left mouse button is pressed'
            },
            {
                key: 'middleMouseDown',
                name: 'Middle mouse down',
                description: 'State to transition to when the middle mouse button is pressed'
            },
            {
                key: 'rightMouseDown',
                name: 'Right mouse down',
                description: 'State to transition to when the right mouse button is pressed'
            }
        ]
    };
    __touch(6829);
    MouseDownAction.prototype._setup = function () {
        document.addEventListener('mousedown', this.eventListener);
        __touch(6840);
    };
    __touch(6830);
    MouseDownAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6841);
            fsm.send([
                this.transitions.mouseLeftDown,
                this.transitions.middleMouseDown,
                this.transitions.rightMouseDown
            ][this.button]);
            __touch(6842);
        }
    };
    __touch(6831);
    MouseDownAction.prototype.exit = function () {
        document.removeEventListener('mousedown', this.eventListener);
        __touch(6843);
    };
    __touch(6832);
    return MouseDownAction;
    __touch(6833);
});
__touch(6824);