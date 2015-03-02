define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/particles/ParticleLib',
    'goo/util/ParticleSystemUtils'
], function (Action, Material, ShaderLib, ParticleLib, ParticleSystemUtils) {
    'use strict';
    __touch(6586);
    function FireAction() {
        Action.apply(this, arguments);
        __touch(6595);
        this.fireEntity = null;
        __touch(6596);
    }
    __touch(6587);
    FireAction.material = null;
    __touch(6588);
    FireAction.prototype = Object.create(Action.prototype);
    __touch(6589);
    FireAction.prototype.constructor = FireAction;
    __touch(6590);
    FireAction.external = {
        key: 'Fire',
        name: 'Fire FX',
        type: 'fx',
        description: 'Makes the entity emit fire. To "extinguish" the fire use the "Remove Particles" action.',
        parameters: [
            {
                name: 'Start Color',
                key: 'startColor',
                type: 'vec3',
                control: 'color',
                description: 'Flame color at source',
                'default': [
                    1,
                    1,
                    0
                ]
            },
            {
                name: 'End color',
                key: 'endColor',
                type: 'vec3',
                control: 'color',
                description: 'Color near the end of a flame\'s life',
                'default': [
                    1,
                    0,
                    0
                ]
            }
        ],
        transitions: []
    };
    __touch(6591);
    FireAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6597);
        if (this.fireEntity && entity.transformComponent.children.indexOf(this.fireEntity.transformComponent) !== -1) {
            return;
            __touch(6608);
        }
        var gooRunner = entity._world.gooRunner;
        __touch(6598);
        if (!FireAction.material) {
            FireAction.material = new Material(ShaderLib.particles);
            __touch(6609);
            var texture = ParticleSystemUtils.createFlareTexture();
            __touch(6610);
            texture.generateMipmaps = true;
            __touch(6611);
            FireAction.material.setTexture('DIFFUSE_MAP', texture);
            __touch(6612);
            FireAction.material.blendState.blending = 'AdditiveBlending';
            __touch(6613);
            FireAction.material.cullState.enabled = false;
            __touch(6614);
            FireAction.material.depthState.write = false;
            __touch(6615);
            FireAction.material.renderQueue = 2002;
            __touch(6616);
        }
        var entityScale = entity.transformComponent.worldTransform.scale;
        __touch(6599);
        var scale = (entityScale.data[0] + entityScale.data[1] + entityScale.data[2]) / 3;
        __touch(6600);
        this.fireEntity = ParticleSystemUtils.createParticleSystemEntity(gooRunner.world, ParticleLib.getFire({
            scale: scale,
            startColor: this.startColor,
            endColor: this.endColor
        }), FireAction.material);
        __touch(6601);
        this.fireEntity.meshRendererComponent.isPickable = false;
        __touch(6602);
        this.fireEntity.meshRendererComponent.castShadows = false;
        __touch(6603);
        this.fireEntity.meshRendererComponent.receiveShadows = false;
        __touch(6604);
        this.fireEntity.name = '_ParticleSystemFire';
        __touch(6605);
        entity.transformComponent.attachChild(this.fireEntity.transformComponent);
        __touch(6606);
        this.fireEntity.addToWorld();
        __touch(6607);
    };
    __touch(6592);
    FireAction.prototype.cleanup = function () {
        if (this.fireEntity) {
            this.fireEntity.removeFromWorld();
            __touch(6617);
            this.fireEntity = null;
            __touch(6618);
        }
    };
    __touch(6593);
    return FireAction;
    __touch(6594);
});
__touch(6585);