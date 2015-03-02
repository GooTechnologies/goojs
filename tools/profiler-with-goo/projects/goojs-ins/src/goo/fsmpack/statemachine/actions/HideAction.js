define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/entities/EntityUtils'
], function (Action, EntityUtils) {
    'use strict';
    __touch(6677);
    function HideAction() {
        Action.apply(this, arguments);
        __touch(6684);
    }
    __touch(6678);
    HideAction.prototype = Object.create(Action.prototype);
    __touch(6679);
    HideAction.prototype.constructor = HideAction;
    __touch(6680);
    HideAction.external = {
        name: 'Hide',
        type: 'display',
        description: 'Hides an entity and its children',
        parameters: [],
        transitions: []
    };
    __touch(6681);
    HideAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6685);
        entity.hide();
        __touch(6686);
    };
    __touch(6682);
    return HideAction;
    __touch(6683);
});
__touch(6676);