define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6966);
    function PickAction() {
        Action.apply(this, arguments);
        __touch(6975);
        this.everyFrame = true;
        __touch(6976);
        this.updated = false;
        __touch(6977);
        this.eventListener = function (evt) {
            if (evt.entity === this.ownerEntity) {
                this.updated = true;
                __touch(6979);
            }
        }.bind(this);
        __touch(6978);
    }
    __touch(6967);
    PickAction.prototype = Object.create(Action.prototype);
    __touch(6968);
    PickAction.prototype.constructor = PickAction;
    __touch(6969);
    PickAction.external = {
        name: 'Pick',
        type: 'controls',
        description: 'Listens for a picking event on the entity and performs a transition',
        canTransition: true,
        parameters: [],
        transitions: [{
                key: 'pick',
                name: 'Pick',
                description: 'State to transition to when entity is picked'
            }]
    };
    __touch(6970);
    PickAction.prototype._setup = function (fsm) {
        this.ownerEntity = fsm.getOwnerEntity();
        __touch(6980);
        this.goo = this.ownerEntity._world.gooRunner;
        __touch(6981);
        this.goo.addEventListener('click', this.eventListener);
        __touch(6982);
        this.goo.addEventListener('touchstart', this.eventListener);
        __touch(6983);
    };
    __touch(6971);
    PickAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6984);
            fsm.send(this.transitions.pick);
            __touch(6985);
        }
    };
    __touch(6972);
    PickAction.prototype.exit = function () {
        if (this.goo) {
            this.goo.removeEventListener('click', this.eventListener);
            __touch(6986);
            this.goo.removeEventListener('touchstart', this.eventListener);
            __touch(6987);
        }
    };
    __touch(6973);
    return PickAction;
    __touch(6974);
});
__touch(6965);