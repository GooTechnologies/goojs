define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7195);
    function SetLightRangeAction() {
        Action.apply(this, arguments);
        __touch(7202);
    }
    __touch(7196);
    SetLightRangeAction.prototype = Object.create(Action.prototype);
    __touch(7197);
    SetLightRangeAction.prototype.configure = function (settings) {
        this.everyFrame = !!settings.everyFrame;
        __touch(7203);
        this.entity = settings.entity || null;
        __touch(7204);
        this.range = settings.range || 100;
        __touch(7205);
    };
    __touch(7198);
    SetLightRangeAction.external = {
        name: 'Set Light Range',
        description: 'Sets the range of a light',
        parameters: [
            {
                name: 'Entity',
                key: 'entity',
                type: 'entity',
                description: 'Light entity'
            },
            {
                name: 'Range',
                key: 'range',
                type: 'real',
                description: 'Light range',
                'default': 100,
                min: 0
            },
            {
                name: 'On every frame',
                key: 'everyFrame',
                type: 'boolean',
                description: 'Repeat this action every frame',
                'default': true
            }
        ],
        transitions: []
    };
    __touch(7199);
    SetLightRangeAction.prototype._run = function () {
        if (this.entity && this.entity.lightComponent && this.entity.lightComponent.light) {
            this.entity.lightComponent.light.range = this.range;
            __touch(7206);
        }
    };
    __touch(7200);
    return SetLightRangeAction;
    __touch(7201);
});
__touch(7194);