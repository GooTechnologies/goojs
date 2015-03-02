define([
    'goo/entities/SystemBus',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/TextureCreator',
    'goo/particles/ParticleLib',
    'goo/util/ParticleSystemUtils',
    'goo/renderer/Renderer',
    'goo/math/Vector3'
], function (SystemBus, Material, ShaderLib, TextureCreator, ParticleLib, ParticleSystemUtils, Renderer, Vector3) {
    'use strict';
    __touch(22342);
    function Snow(gooRunner) {
        this.velocity = 10;
        __touch(22349);
        this.height = 25;
        __touch(22350);
        this.material = new Material(ShaderLib.particles);
        __touch(22351);
        var texture = ParticleSystemUtils.createFlareTexture(64);
        __touch(22352);
        texture.generateMipmaps = true;
        __touch(22353);
        this.material.setTexture('DIFFUSE_MAP', texture);
        __touch(22354);
        this.material.blendState.blending = 'AdditiveBlending';
        __touch(22355);
        this.material.cullState.enabled = false;
        __touch(22356);
        this.material.depthState.write = false;
        __touch(22357);
        this.material.renderQueue = 2002;
        __touch(22358);
        var that = this;
        __touch(22359);
        this.particleCloudEntity = ParticleSystemUtils.createParticleSystemEntity(gooRunner.world, ParticleLib.getSnow({
            getEmissionPoint: function (vec3) {
                vec3.copy(Renderer.mainCamera ? Renderer.mainCamera.translation : new Vector3());
                __touch(22365);
                vec3.data[0] += Math.random() * 1000 - 500;
                __touch(22366);
                vec3.data[1] += that.height;
                __touch(22367);
                vec3.data[2] += Math.random() * 1000 - 500;
                __touch(22368);
            },
            getEmissionVelocity: function (vec3) {
                vec3.data[0] = (Math.random() - 0.5) * 2;
                __touch(22369);
                vec3.data[1] = -(Math.random() + 1) * that.velocity;
                __touch(22370);
                vec3.data[2] = (Math.random() - 0.5) * 2;
                __touch(22371);
            }
        }), this.material);
        __touch(22360);
        this.particleCloudEntity.name = '_ParticleSystemSnow';
        __touch(22361);
        this.onCameraChange = function (newCam) {
            newCam.entity.attachChild(this.particleCloudEntity);
            __touch(22372);
        }.bind(this);
        __touch(22362);
        this.particleCloudEntity.transformComponent.transform.translation.copy(Renderer.mainCamera ? Renderer.mainCamera.translation : new Vector3());
        __touch(22363);
        this.particleCloudEntity.addToWorld();
        __touch(22364);
    }
    __touch(22343);
    Snow.prototype.setEmissionVelocity = function (velocity) {
        if (velocity) {
            this.velocity = velocity;
            __touch(22373);
            var particleComponent = this.particleCloudEntity.particleComponent;
            __touch(22374);
            var particles = particleComponent.particles;
            __touch(22375);
            for (var i = 0; i < particles.length; i++) {
                particles[i].velocity[1] = -(Math.random() + 1) * this.velocity;
                __touch(22376);
            }
        }
    };
    __touch(22344);
    Snow.prototype.setEmissionHeight = function (height) {
        if (height) {
            this.height = height;
            __touch(22377);
        }
    };
    __touch(22345);
    Snow.prototype.setReleaseRatePerSecond = function (releaseRatePerSecond) {
        if (releaseRatePerSecond) {
            var particleComponent = this.particleCloudEntity.particleComponent;
            __touch(22378);
            var emitter = particleComponent.emitters[0];
            __touch(22379);
            emitter.releaseRatePerSecond = releaseRatePerSecond;
            __touch(22380);
        }
    };
    __touch(22346);
    Snow.prototype.remove = function () {
        this.particleCloudEntity.removeFromWorld();
        __touch(22381);
    };
    __touch(22347);
    return Snow;
    __touch(22348);
});
__touch(22341);