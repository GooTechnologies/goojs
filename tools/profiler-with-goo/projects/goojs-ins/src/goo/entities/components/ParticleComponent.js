define([
    'goo/entities/components/Component',
    'goo/particles/Particle',
    'goo/particles/ParticleEmitter',
    'goo/renderer/MeshData'
], function (Component, Particle, ParticleEmitter, MeshData) {
    'use strict';
    __touch(4846);
    function ParticleComponent(settings) {
        this.type = 'ParticleComponent';
        __touch(4853);
        Component.call(this);
        __touch(4854);
        settings = settings || {};
        __touch(4855);
        this.emitters = [];
        __touch(4856);
        if (settings.emitters) {
            for (var i = 0, max = settings.emitters.length; i < max; i++) {
                this.emitters.push(new ParticleEmitter(settings.emitters[i]));
                __touch(4863);
            }
        }
        this.timeline = settings.timeline ? settings.timeline : [];
        __touch(4857);
        this.uRange = isNaN(settings.uRange) ? 1 : settings.uRange;
        __touch(4858);
        this.vRange = isNaN(settings.vRange) ? 1 : settings.vRange;
        __touch(4859);
        var particleCount = isNaN(settings.particleCount) ? 100 : settings.particleCount;
        __touch(4860);
        this.recreateParticles(particleCount);
        __touch(4861);
        this.enabled = true;
        __touch(4862);
    }
    __touch(4847);
    ParticleComponent.prototype = Object.create(Component.prototype);
    __touch(4848);
    ParticleComponent.prototype.constructor = ParticleComponent;
    __touch(4849);
    ParticleComponent.prototype.generateMeshData = function () {
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.COLOR,
            MeshData.TEXCOORD0
        ]);
        __touch(4864);
        this.meshData = new MeshData(attributeMap, this.particleCount * 4, this.particleCount * 6);
        __touch(4865);
        this.meshData.vertexData.setDataUsage('DynamicDraw');
        __touch(4866);
        var uvBuffer = this.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
        __touch(4867);
        var indexBuffer = this.meshData.getIndexBuffer();
        __touch(4868);
        for (var i = 0, max = this.particleCount; i < max; i++) {
            uvBuffer.set([
                1,
                0
            ], i * 8 + 0);
            __touch(4869);
            uvBuffer.set([
                1,
                1
            ], i * 8 + 2);
            __touch(4870);
            uvBuffer.set([
                0,
                1
            ], i * 8 + 4);
            __touch(4871);
            uvBuffer.set([
                0,
                0
            ], i * 8 + 6);
            __touch(4872);
            indexBuffer.set([
                i * 4 + 0,
                i * 4 + 3,
                i * 4 + 1,
                i * 4 + 1,
                i * 4 + 3,
                i * 4 + 2
            ], i * 6);
            __touch(4873);
        }
    };
    __touch(4850);
    ParticleComponent.prototype.recreateParticles = function (particleCount) {
        this.particleCount = particleCount;
        __touch(4874);
        this.particles = [];
        __touch(4875);
        for (var i = 0; i < this.particleCount; i++) {
            this.particles[i] = new Particle(this, i);
            __touch(4877);
        }
        this.generateMeshData();
        __touch(4876);
    };
    __touch(4851);
    return ParticleComponent;
    __touch(4852);
});
__touch(4845);