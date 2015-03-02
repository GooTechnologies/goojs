define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/proximity/ProximityComponent'
], function (Action, ProximityComponent) {
    'use strict';
    __touch(7446);
    function TagAction() {
        Action.apply(this, arguments);
        __touch(7454);
    }
    __touch(7447);
    TagAction.prototype = Object.create(Action.prototype);
    __touch(7448);
    TagAction.prototype.constructor = TagAction;
    __touch(7449);
    TagAction.external = {
        name: 'Tag',
        type: 'collision',
        description: 'Sets a tag on the entity. Use tags to be able to capture collision events with the \'Collides\' action',
        parameters: [{
                name: 'Tag',
                key: 'tag',
                type: 'string',
                control: 'dropdown',
                description: 'Checks for collisions with other objects having this tag',
                'default': 'red',
                options: [
                    'red',
                    'blue',
                    'green',
                    'yellow'
                ]
            }],
        transitions: []
    };
    __touch(7450);
    TagAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7455);
        if (entity.proximityComponent) {
            if (entity.proximityComponent.tag !== this.tag) {
                entity.clearComponent('ProximityComponent');
                __touch(7456);
                entity.setComponent(new ProximityComponent(this.tag));
                __touch(7457);
            }
        } else {
            entity.setComponent(new ProximityComponent(this.tag));
            __touch(7458);
        }
    };
    __touch(7451);
    TagAction.prototype.cleanup = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7459);
        entity.clearComponent('ProximityComponent');
        __touch(7460);
    };
    __touch(7452);
    return TagAction;
    __touch(7453);
});
__touch(7445);