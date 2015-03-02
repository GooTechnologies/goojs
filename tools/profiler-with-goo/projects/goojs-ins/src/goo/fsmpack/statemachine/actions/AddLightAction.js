define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/entities/components/LightComponent',
    'goo/renderer/light/PointLight',
    'goo/renderer/light/DirectionalLight',
    'goo/renderer/light/SpotLight'
], function (Action, LightComponent, PointLight, DirectionalLight, SpotLight) {
    'use strict';
    __touch(6342);
    function AddLightAction() {
        Action.apply(this, arguments);
        __touch(6350);
    }
    __touch(6343);
    AddLightAction.prototype = Object.create(Action.prototype);
    __touch(6344);
    AddLightAction.prototype.constructor = AddLightAction;
    __touch(6345);
    AddLightAction.external = {
        name: 'Add Light',
        description: 'Adds a point light to the entity',
        type: 'light',
        parameters: [
            {
                name: 'Color',
                key: 'color',
                type: 'vec3',
                control: 'color',
                description: 'Color of the light',
                'default': [
                    1,
                    1,
                    1
                ]
            },
            {
                name: 'Light type',
                key: 'type',
                type: 'string',
                control: 'dropdown',
                description: 'Light type',
                'default': 'Point',
                options: [
                    'Point',
                    'Directional',
                    'Spot'
                ]
            },
            {
                name: 'Range',
                key: 'range',
                type: 'float',
                control: 'slider',
                min: 0,
                max: 1000,
                description: 'Range of the light',
                'default': 200
            },
            {
                name: 'Cone Angle',
                key: 'angle',
                type: 'float',
                control: 'slider',
                min: 1,
                max: 170,
                description: 'Cone angle (applies only to spot lights)',
                'default': 30
            },
            {
                name: 'Penumbra',
                key: 'penumbra',
                type: 'float',
                control: 'slider',
                min: 0,
                max: 170,
                description: 'Penumbra (applies only to spot lights)',
                'default': 30
            }
        ],
        transitions: []
    };
    __touch(6346);
    AddLightAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6351);
        if (entity.lightComponent) {
            this._untouched = true;
            __touch(6355);
            return;
            __touch(6356);
        }
        var light;
        __touch(6352);
        if (this.type === 'Directional') {
            light = new DirectionalLight();
            __touch(6357);
        } else if (this.type === 'Spot') {
            light = new SpotLight();
            __touch(6358);
            light.range = +this.range;
            __touch(6359);
            light.angle = +this.angle;
            __touch(6360);
            light.penumbra = +this.penumbra;
            __touch(6361);
        } else {
            light = new PointLight();
            __touch(6362);
            light.range = +this.range;
            __touch(6363);
        }
        light.color.setd(this.color[0], this.color[1], this.color[2]);
        __touch(6353);
        entity.setComponent(new LightComponent(light));
        __touch(6354);
    };
    __touch(6347);
    AddLightAction.prototype.cleanup = function (fsm) {
        if (this._untouched) {
            return;
            __touch(6366);
        }
        var entity = fsm.getOwnerEntity();
        __touch(6364);
        entity.clearComponent('LightComponent');
        __touch(6365);
    };
    __touch(6348);
    return AddLightAction;
    __touch(6349);
});
__touch(6341);