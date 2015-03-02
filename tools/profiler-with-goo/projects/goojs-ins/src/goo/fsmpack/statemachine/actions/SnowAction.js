define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/TextureCreator',
    'goo/particles/ParticleLib',
    'goo/util/ParticleSystemUtils'
], function (Action, Material, ShaderLib, TextureCreator, ParticleLib, ParticleSystemUtils) {
    'use strict';
    __touch(7370);
    function SnowAction() {
        Action.apply(this, arguments);
        __touch(7378);
    }
    __touch(7371);
    SnowAction.material = null;
    __touch(7372);
    SnowAction.prototype = Object.create(Action.prototype);
    __touch(7373);
    SnowAction.prototype.constructor = SnowAction;
    __touch(7374);
    SnowAction.external = {
        name: 'Snow',
        description: 'Makes the entity emit snow',
        parameters: [],
        transitions: []
    };
    __touch(7375);
    SnowAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7379);
        var gooRunner = entity._world.gooRunner;
        __touch(7380);
        if (!SnowAction.material) {
            SnowAction.material = new Material(ShaderLib.particles);
            __touch(7385);
            var texture = ParticleSystemUtils.createFlareTexture();
            __touch(7386);
            texture.generateMipmaps = true;
            __touch(7387);
            SnowAction.material.setTexture('DIFFUSE_MAP', texture);
            __touch(7388);
            SnowAction.material.blendState.blending = 'AlphaBlending';
            __touch(7389);
            SnowAction.material.cullState.enabled = false;
            __touch(7390);
            SnowAction.material.depthState.write = false;
            __touch(7391);
            SnowAction.material.renderQueue = 2001;
            __touch(7392);
        }
        var particleSystemEntity = ParticleSystemUtils.createParticleSystemEntity(gooRunner.world, ParticleLib.getSmoke(), SnowAction.material);
        __touch(7381);
        particleSystemEntity.name = '_ParticleSystemSnow';
        __touch(7382);
        entity.transformComponent.attachChild(particleSystemEntity.transformComponent);
        __touch(7383);
        particleSystemEntity.addToWorld();
        __touch(7384);
    };
    __touch(7376);
    return SnowAction;
    __touch(7377);
});
__touch(7369);