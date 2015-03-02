define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7041);
    function RemoveAction() {
        Action.apply(this, arguments);
        __touch(7048);
    }
    __touch(7042);
    RemoveAction.prototype = Object.create(Action.prototype);
    __touch(7043);
    RemoveAction.prototype.constructor = RemoveAction;
    __touch(7044);
    RemoveAction.external = {
        name: 'Remove',
        type: 'display',
        description: 'Removes the entity from the world',
        parameters: [{
                name: 'Recursive',
                key: 'recursive',
                type: 'boolean',
                description: 'Remove children too',
                'default': false
            }],
        transitions: []
    };
    __touch(7045);
    RemoveAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7049);
        entity.removeFromWorld(this.recursive);
        __touch(7050);
    };
    __touch(7046);
    return RemoveAction;
    __touch(7047);
});
__touch(7040);