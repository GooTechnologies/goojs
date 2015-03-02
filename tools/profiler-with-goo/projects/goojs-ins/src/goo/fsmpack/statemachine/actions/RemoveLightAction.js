define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7052);
    function RemoveLightAction() {
        Action.apply(this, arguments);
        __touch(7059);
    }
    __touch(7053);
    RemoveLightAction.prototype = Object.create(Action.prototype);
    __touch(7054);
    RemoveLightAction.prototype.constructor = RemoveLightAction;
    __touch(7055);
    RemoveLightAction.external = {
        name: 'Remove Light',
        type: 'light',
        description: 'Removes the light attached to the entity',
        parameters: [],
        transitions: []
    };
    __touch(7056);
    RemoveLightAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7060);
        if (entity.hasComponent('LightComponent')) {
            entity.clearComponent('LightComponent');
            __touch(7061);
        }
    };
    __touch(7057);
    return RemoveLightAction;
    __touch(7058);
});
__touch(7051);