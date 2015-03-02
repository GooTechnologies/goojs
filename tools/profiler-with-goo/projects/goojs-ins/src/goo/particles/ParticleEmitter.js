define([
    'goo/particles/ParticleUtils',
    'goo/renderer/Renderer'
], function (ParticleUtils, Renderer) {
    'use strict';
    __touch(14277);
    function ParticleEmitter(settings) {
        settings = settings || {};
        __touch(14282);
        this.totalParticlesToSpawn = !isNaN(settings.totalParticlesToSpawn) ? settings.totalParticlesToSpawn : -1;
        __touch(14283);
        this.maxLifetime = !isNaN(settings.maxLifetime) ? settings.maxLifetime : 3;
        __touch(14284);
        this.minLifetime = !isNaN(settings.minLifetime) ? settings.minLifetime : 2;
        __touch(14285);
        this.timeline = settings.timeline ? settings.timeline : undefined;
        __touch(14286);
        this.influences = settings.influences ? settings.influences : [];
        __touch(14287);
        this.getEmissionPoint = settings.getEmissionPoint ? settings.getEmissionPoint : function (particle, particleEntity) {
            var vec3 = particle.position;
            __touch(14294);
            vec3.setd(0, 0, 0);
            __touch(14295);
            return ParticleUtils.applyEntityTransformPoint(vec3, particleEntity);
            __touch(14296);
        };
        __touch(14288);
        this.getEmissionVelocity = settings.getEmissionVelocity ? settings.getEmissionVelocity : function (particle, particleEntity) {
            var vec3 = particle.velocity;
            __touch(14297);
            vec3.setd(0, 1, 0);
            __touch(14298);
            return ParticleUtils.applyEntityTransformVector(vec3, particleEntity);
            __touch(14299);
        };
        __touch(14289);
        this.getParticleBillboardVectors = settings.getParticleBillboardVectors ? settings.getParticleBillboardVectors : ParticleEmitter.CAMERA_BILLBOARD_FUNC;
        __touch(14290);
        this.releaseRatePerSecond = !isNaN(settings.releaseRatePerSecond) ? settings.releaseRatePerSecond : 10;
        __touch(14291);
        this.particlesWaitingToRelease = 0;
        __touch(14292);
        this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
        __touch(14293);
    }
    __touch(14278);
    ParticleEmitter.CAMERA_BILLBOARD_FUNC = function (particle) {
        var camera = Renderer.mainCamera;
        __touch(14300);
        if (camera) {
            particle.bbX.setv(camera._left);
            __touch(14301);
            particle.bbY.setv(camera._up);
            __touch(14302);
        }
    };
    __touch(14279);
    ParticleEmitter.prototype.nextParticleLifeSpan = function () {
        return this.minLifetime + (this.maxLifetime - this.minLifetime) * Math.random();
        __touch(14303);
    };
    __touch(14280);
    return ParticleEmitter;
    __touch(14281);
});
__touch(14276);