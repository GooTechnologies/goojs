define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6864);
    function MouseUpAction() {
        Action.apply(this, arguments);
        __touch(6873);
        this.everyFrame = true;
        __touch(6874);
        this.updated = false;
        __touch(6875);
        this.eventListener = function (event) {
            this.button = event.button;
            __touch(6877);
            this.updated = true;
            __touch(6878);
        }.bind(this);
        __touch(6876);
    }
    __touch(6865);
    MouseUpAction.prototype = Object.create(Action.prototype);
    __touch(6866);
    MouseUpAction.prototype.constructor = MouseUpAction;
    __touch(6867);
    MouseUpAction.external = {
        name: 'Mouse Up',
        type: 'controls',
        description: 'Listens for a mouse button release and performs a transition',
        canTransition: true,
        parameters: [],
        transitions: [
            {
                key: 'mouseLeftUp',
                name: 'Left mouse up',
                description: 'State to transition to when the left mouse button is released'
            },
            {
                key: 'middleMouseUp',
                name: 'Middle mouse up',
                description: 'State to transition to when the middle mouse button is released'
            },
            {
                key: 'rightMouseUp',
                name: 'Right mouse up',
                description: 'State to transition to when the right mouse button is released'
            }
        ]
    };
    __touch(6868);
    MouseUpAction.prototype._setup = function () {
        document.addEventListener('mouseup', this.eventListener);
        __touch(6879);
    };
    __touch(6869);
    MouseUpAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6880);
            fsm.send([
                this.transitions.mouseLeftUp,
                this.transitions.middleMouseUp,
                this.transitions.rightMouseUp
            ][this.button]);
            __touch(6881);
        }
    };
    __touch(6870);
    MouseUpAction.prototype.exit = function () {
        document.removeEventListener('mouseup', this.eventListener);
        __touch(6882);
    };
    __touch(6871);
    return MouseUpAction;
    __touch(6872);
});
__touch(6863);