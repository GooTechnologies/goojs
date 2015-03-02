define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7325);
    function ShowAction() {
        Action.apply(this, arguments);
        __touch(7332);
    }
    __touch(7326);
    ShowAction.prototype = Object.create(Action.prototype);
    __touch(7327);
    ShowAction.prototype.constructor = ShowAction;
    __touch(7328);
    ShowAction.external = {
        name: 'Show',
        type: 'display',
        description: 'Makes an entity visible',
        parameters: [],
        transitions: []
    };
    __touch(7329);
    ShowAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7333);
        entity.show();
        __touch(7334);
    };
    __touch(7330);
    return ShowAction;
    __touch(7331);
});
__touch(7324);