define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(5491);
    function ParticlesSystem() {
        System.call(this, 'ParticlesSystem', [
            'TransformComponent',
            'MeshRendererComponent',
            'MeshDataComponent',
            'ParticleComponent'
        ]);
        __touch(5497);
        this.passive = false;
        __touch(5498);
    }
    __touch(5492);
    ParticlesSystem.prototype = Object.create(System.prototype);
    __touch(5493);
    ParticlesSystem.prototype.process = function (entities, tpf) {
        if (tpf > 1) {
            return;
            __touch(5499);
        }
        for (var i = 0, max = entities.length; i < max; i++) {
            var entity = entities[i];
            __touch(5500);
            var particleComponent = entity.particleComponent;
            __touch(5501);
            if (particleComponent.enabled) {
                this.updateParticles(entity, particleComponent, tpf);
                __touch(5502);
            }
        }
    };
    __touch(5494);
    ParticlesSystem.prototype.updateParticles = function (particleEntity, particleComponent, tpf) {
        var particleIndex = 0;
        __touch(5503);
        var emitterIndex = -1;
        __touch(5504);
        var emitter;
        __touch(5505);
        var needsUpdate = false;
        __touch(5506);
        var stillAlive = false;
        __touch(5507);
        while (particleIndex < particleComponent.particleCount) {
            while (emitter === undefined) {
                emitterIndex++;
                __touch(5512);
                if (particleComponent.emitters.length > emitterIndex) {
                    emitter = particleComponent.emitters[emitterIndex];
                    __touch(5513);
                    if (emitter.influences.length) {
                        for (var j = 0, max = emitter.influences.length; j < max; j++) {
                            emitter.influences[j].prepare(particleEntity, emitter);
                            __touch(5514);
                        }
                    }
                    if (!emitter.enabled) {
                        emitter = undefined;
                        __touch(5515);
                        continue;
                        __touch(5516);
                    }
                    if (emitter.totalParticlesToSpawn !== 0) {
                        emitter.particlesWaitingToRelease += emitter.releaseRatePerSecond * tpf;
                        __touch(5517);
                        emitter.particlesWaitingToRelease = Math.max(emitter.particlesWaitingToRelease, 0);
                        __touch(5518);
                        stillAlive = true;
                        __touch(5519);
                    }
                    if (emitter.particlesWaitingToRelease < 1) {
                        emitter = undefined;
                        __touch(5520);
                        continue;
                        __touch(5521);
                    }
                } else {
                    emitter = null;
                    __touch(5522);
                }
            }
            __touch(5509);
            var particle = particleComponent.particles[particleIndex];
            __touch(5510);
            if (particle.alive && particle.emitter && particle.emitter.influences.length) {
                for (var j = 0, max = particle.emitter.influences.length; j < max; j++) {
                    if (particle.emitter.influences[j].enabled) {
                        particle.emitter.influences[j].apply(tpf, particle, particleIndex);
                        __touch(5523);
                    }
                }
            }
            if (particle.alive) {
                particle.update(tpf, particleEntity);
                __touch(5524);
                needsUpdate = true;
                __touch(5525);
                stillAlive = true;
                __touch(5526);
            }
            if (!particle.alive && emitter) {
                emitter.particlesWaitingToRelease--;
                __touch(5527);
                if (emitter.totalParticlesToSpawn >= 1) {
                    emitter.totalParticlesToSpawn--;
                    __touch(5531);
                }
                particle.respawnParticle(emitter);
                __touch(5528);
                emitter.getEmissionPoint(particle, particleEntity);
                __touch(5529);
                emitter.getEmissionVelocity(particle, particleEntity);
                __touch(5530);
                if (emitter.particlesWaitingToRelease < 1 || emitter.totalParticlesToSpawn === 0) {
                    emitter = undefined;
                    __touch(5532);
                }
            }
            particleIndex++;
            __touch(5511);
        }
        __touch(5508);
        if (needsUpdate) {
            particleComponent.meshData.vertexData._dataNeedsRefresh = true;
            __touch(5533);
            particleEntity.meshDataComponent.autoCompute = true;
            __touch(5534);
        }
        if (!stillAlive) {
            particleComponent.enabled = false;
            __touch(5535);
        }
    };
    __touch(5495);
    return ParticlesSystem;
    __touch(5496);
});
__touch(5490);