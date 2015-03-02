define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/TextureCreator',
    'goo/particles/ParticleLib',
    'goo/util/ParticleSystemUtils'
], function (Action, Material, ShaderLib, TextureCreator, ParticleLib, ParticleSystemUtils) {
    'use strict';
    __touch(7336);
    function SmokeAction() {
        Action.apply(this, arguments);
        __touch(7345);
        this.smokeEntity = null;
        __touch(7346);
    }
    __touch(7337);
    SmokeAction.material = null;
    __touch(7338);
    SmokeAction.prototype = Object.create(Action.prototype);
    __touch(7339);
    SmokeAction.prototype.constructor = SmokeAction;
    __touch(7340);
    SmokeAction.external = {
        key: 'Smoke',
        name: 'Smoke FX',
        type: 'fx',
        description: 'Makes the entity emit smoke. To cancel the smoke emitter use the "Remove Particles" action.',
        parameters: [{
                name: 'Color',
                key: 'color',
                type: 'vec3',
                control: 'color',
                description: 'Smoke color',
                'default': [
                    0,
                    0,
                    0
                ]
            }],
        transitions: []
    };
    __touch(7341);
    SmokeAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7347);
        if (this.smokeEntity && entity.transformComponent.children.indexOf(this.smokeEntity.transformComponent) !== -1) {
            return;
            __touch(7358);
        }
        var gooRunner = entity._world.gooRunner;
        __touch(7348);
        if (!SmokeAction.material) {
            SmokeAction.material = new Material(ShaderLib.particles);
            __touch(7359);
            var texture = ParticleSystemUtils.createFlareTexture();
            __touch(7360);
            texture.generateMipmaps = true;
            __touch(7361);
            SmokeAction.material.setTexture('DIFFUSE_MAP', texture);
            __touch(7362);
            SmokeAction.material.blendState.blending = 'AlphaBlending';
            __touch(7363);
            SmokeAction.material.cullState.enabled = false;
            __touch(7364);
            SmokeAction.material.depthState.write = false;
            __touch(7365);
            SmokeAction.material.renderQueue = 2001;
            __touch(7366);
        }
        var entityScale = entity.transformComponent.worldTransform.scale;
        __touch(7349);
        var scale = (entityScale.data[0] + entityScale.data[1] + entityScale.data[2]) / 3;
        __touch(7350);
        this.smokeEntity = ParticleSystemUtils.createParticleSystemEntity(gooRunner.world, ParticleLib.getSmoke({
            scale: scale,
            color: this.color
        }), SmokeAction.material);
        __touch(7351);
        this.smokeEntity.meshRendererComponent.isPickable = false;
        __touch(7352);
        this.smokeEntity.meshRendererComponent.castShadows = false;
        __touch(7353);
        this.smokeEntity.meshRendererComponent.receiveShadows = false;
        __touch(7354);
        this.smokeEntity.name = '_ParticleSystemSmoke';
        __touch(7355);
        entity.transformComponent.attachChild(this.smokeEntity.transformComponent);
        __touch(7356);
        this.smokeEntity.addToWorld();
        __touch(7357);
    };
    __touch(7342);
    SmokeAction.prototype.cleanup = function () {
        if (this.smokeEntity) {
            this.smokeEntity.removeFromWorld();
            __touch(7367);
            this.smokeEntity = null;
            __touch(7368);
        }
    };
    __touch(7343);
    return SmokeAction;
    __touch(7344);
});
__touch(7335);