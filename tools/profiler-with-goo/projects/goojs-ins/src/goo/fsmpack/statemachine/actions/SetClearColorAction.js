define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7158);
    function SetClearColorAction() {
        Action.apply(this, arguments);
        __touch(7167);
        this._oldClearColor = [];
        __touch(7168);
    }
    __touch(7159);
    SetClearColorAction.prototype = Object.create(Action.prototype);
    __touch(7160);
    SetClearColorAction.prototype.constructor = SetClearColorAction;
    __touch(7161);
    SetClearColorAction.external = {
        key: 'Set Clear Color',
        name: 'Background Color',
        description: 'Sets the clear color',
        parameters: [{
                name: 'Color',
                key: 'color',
                type: 'vec3',
                control: 'color',
                description: 'Color',
                'default': [
                    1,
                    1,
                    1
                ]
            }],
        transitions: []
    };
    __touch(7162);
    SetClearColorAction.prototype.ready = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7169);
        var goo = entity._world.gooRunner;
        __touch(7170);
        this._oldClearColor[0] = goo.renderer._clearColor[0];
        __touch(7171);
        this._oldClearColor[1] = goo.renderer._clearColor[1];
        __touch(7172);
        this._oldClearColor[2] = goo.renderer._clearColor[2];
        __touch(7173);
        this._oldClearColor[3] = goo.renderer._clearColor[3];
        __touch(7174);
    };
    __touch(7163);
    SetClearColorAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7175);
        var goo = entity._world.gooRunner;
        __touch(7176);
        goo.renderer.setClearColor(this.color[0], this.color[1], this.color[2], 1);
        __touch(7177);
    };
    __touch(7164);
    SetClearColorAction.prototype.cleanup = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7178);
        var goo = entity._world.gooRunner;
        __touch(7179);
        goo.renderer.setClearColor(this._oldClearColor[0], this._oldClearColor[1], this._oldClearColor[2], this._oldClearColor[3]);
        __touch(7180);
    };
    __touch(7165);
    return SetClearColorAction;
    __touch(7166);
});
__touch(7157);