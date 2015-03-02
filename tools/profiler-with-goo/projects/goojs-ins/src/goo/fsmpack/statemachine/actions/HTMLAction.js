define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6656);
    function HTMLAction() {
        Action.apply(this, arguments);
        __touch(6665);
        this.everyFrame = true;
        __touch(6666);
        this.updated = false;
        __touch(6667);
        this.eventListener = function () {
            this.updated = true;
            __touch(6669);
        }.bind(this);
        __touch(6668);
    }
    __touch(6657);
    HTMLAction.prototype = Object.create(Action.prototype);
    __touch(6658);
    HTMLAction.prototype.constructor = HTMLAction;
    __touch(6659);
    HTMLAction.external = {
        name: 'HTMLPick',
        type: 'controls',
        description: 'Listens for a picking event and performs a transition. Can only be used on HTML entities.',
        canTransition: true,
        parameters: [],
        transitions: [{
                key: 'pick',
                name: 'Pick',
                description: 'State to transition to when the HTML entity is picked'
            }]
    };
    __touch(6660);
    HTMLAction.prototype._setup = function (fsm) {
        var ownerEntity = fsm.getOwnerEntity();
        __touch(6670);
        if (ownerEntity.htmlComponent) {
            this.domElement = ownerEntity.htmlComponent.domElement;
            __touch(6671);
            this.domElement.addEventListener('click', this.eventListener);
            __touch(6672);
        }
    };
    __touch(6661);
    HTMLAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6673);
            fsm.send(this.transitions.pick);
            __touch(6674);
        }
    };
    __touch(6662);
    HTMLAction.prototype.exit = function () {
        if (this.domElement) {
            this.domElement.removeEventListener('click', this.eventListener);
            __touch(6675);
        }
    };
    __touch(6663);
    return HTMLAction;
    __touch(6664);
});
__touch(6655);