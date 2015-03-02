define([
    'goo/particles/ParticleUtils',
    'goo/math/Vector',
    'goo/math/Vector3',
    'goo/math/Vector4',
    'goo/renderer/MeshData'
], function (ParticleUtils, Vector, Vector3, Vector4, MeshData) {
    'use strict';
    __touch(14193);
    var calcVec = new Vector3();
    __touch(14194);
    function Particle(particleComponent, index) {
        this.alive = false;
        __touch(14201);
        this.position = new Vector3();
        __touch(14202);
        this.velocity = new Vector3();
        __touch(14203);
        this.lifeSpan = 0;
        __touch(14204);
        this.parent = particleComponent;
        __touch(14205);
        this.age = 0;
        __touch(14206);
        this.index = index;
        __touch(14207);
        this.color = new Vector4(1, 0, 0, 1);
        __touch(14208);
        this.size = 0;
        __touch(14209);
        this.spin = 0;
        __touch(14210);
        this.mass = 1;
        __touch(14211);
        this.emitter = null;
        __touch(14212);
        this.uvIndex = 0;
        __touch(14213);
        this.lastUVIndex = -1;
        __touch(14214);
        this.bbX = new Vector3();
        __touch(14215);
        this.bbY = new Vector3();
        __touch(14216);
        this.lastColor = new Vector4();
        __touch(14217);
    }
    __touch(14195);
    Particle.prototype.respawnParticle = function (emitter) {
        this.emitter = emitter;
        __touch(14218);
        this.lifeSpan = emitter.nextParticleLifeSpan();
        __touch(14219);
        this.alive = true;
        __touch(14220);
        this.age = 0;
        __touch(14221);
    };
    __touch(14196);
    var tmpArray = [];
    __touch(14197);
    Particle.prototype.update = function (tpf, particleEntity) {
        if (!this.alive) {
            return;
            __touch(14234);
        }
        this.age += tpf;
        __touch(14222);
        if (this.age > this.lifeSpan) {
            this.kill();
            __touch(14235);
            return;
            __touch(14236);
        }
        this.position.add_d(this.velocity.x * tpf, this.velocity.y * tpf, this.velocity.z * tpf);
        __touch(14223);
        ParticleUtils.applyTimeline(this, this.emitter && this.emitter.timeline ? this.emitter.timeline : this.parent.timeline);
        __touch(14224);
        if (!Vector.equals(this.lastColor, this.color)) {
            var colorBuffer = this.parent.meshData.getAttributeBuffer(MeshData.COLOR);
            __touch(14237);
            colorBuffer.set(this.color.data, this.index * 16 + 0);
            __touch(14238);
            colorBuffer.set(this.color.data, this.index * 16 + 4);
            __touch(14239);
            colorBuffer.set(this.color.data, this.index * 16 + 8);
            __touch(14240);
            colorBuffer.set(this.color.data, this.index * 16 + 12);
            __touch(14241);
            this.lastColor.setv(this.color);
            __touch(14242);
        }
        if (this.emitter) {
            this.emitter.getParticleBillboardVectors(this, particleEntity);
            __touch(14243);
        }
        if (this.spin === 0) {
            this.bbX.muld(this.size, this.size, this.size);
            __touch(14244);
            this.bbY.muld(this.size, this.size, this.size);
            __touch(14245);
        } else {
            var cA = Math.cos(this.spin) * this.size;
            __touch(14246);
            var sA = Math.sin(this.spin) * this.size;
            __touch(14247);
            var upX = this.bbY.x, upY = this.bbY.y, upZ = this.bbY.z;
            __touch(14248);
            this.bbY.setv(this.bbX);
            __touch(14249);
            this.bbX.muld(cA, cA, cA).add_d(upX * sA, upY * sA, upZ * sA);
            __touch(14250);
            this.bbY.muld(-sA, -sA, -sA).add_d(upX * cA, upY * cA, upZ * cA);
            __touch(14251);
        }
        var vertexBuffer = this.parent.meshData.getAttributeBuffer(MeshData.POSITION);
        __touch(14225);
        Vector3.subv(this.position, this.bbX, calcVec).subv(this.bbY);
        __touch(14226);
        vertexBuffer.set(calcVec.data, this.index * 12 + 0);
        __touch(14227);
        Vector3.subv(this.position, this.bbX, calcVec).addv(this.bbY);
        __touch(14228);
        vertexBuffer.set(calcVec.data, this.index * 12 + 3);
        __touch(14229);
        Vector3.addv(this.position, this.bbX, calcVec).addv(this.bbY);
        __touch(14230);
        vertexBuffer.set(calcVec.data, this.index * 12 + 6);
        __touch(14231);
        Vector3.addv(this.position, this.bbX, calcVec).subv(this.bbY);
        __touch(14232);
        vertexBuffer.set(calcVec.data, this.index * 12 + 9);
        __touch(14233);
        if (this.lastUVIndex !== this.uvIndex) {
            var uvBuffer = this.parent.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
            __touch(14252);
            var uIndex = this.uvIndex % this.parent.uRange / this.parent.uRange;
            __touch(14253);
            var vIndex = 1 - Math.floor(this.uvIndex / this.parent.vRange) / this.parent.vRange;
            __touch(14254);
            var uDelta = 1 / this.parent.uRange;
            __touch(14255);
            var vDelta = 1 / this.parent.vRange;
            __touch(14256);
            tmpArray[0] = uIndex + uDelta;
            __touch(14257);
            tmpArray[1] = vIndex - vDelta;
            __touch(14258);
            uvBuffer.set(tmpArray, this.index * 8 + 0);
            __touch(14259);
            tmpArray[0] = uIndex + uDelta;
            __touch(14260);
            tmpArray[1] = vIndex;
            __touch(14261);
            uvBuffer.set(tmpArray, this.index * 8 + 2);
            __touch(14262);
            tmpArray[0] = uIndex;
            __touch(14263);
            tmpArray[1] = vIndex;
            __touch(14264);
            uvBuffer.set(tmpArray, this.index * 8 + 4);
            __touch(14265);
            tmpArray[0] = uIndex;
            __touch(14266);
            tmpArray[1] = vIndex - vDelta;
            __touch(14267);
            uvBuffer.set(tmpArray, this.index * 8 + 6);
            __touch(14268);
            this.lastUVIndex = this.uvIndex;
            __touch(14269);
        }
    };
    __touch(14198);
    Particle.prototype.kill = function () {
        this.alive = false;
        __touch(14270);
        var vertexBuffer = this.parent.meshData.getAttributeBuffer(MeshData.POSITION);
        __touch(14271);
        var pointA = vertexBuffer.subarray(this.index * 12, this.index * 12 + 3);
        __touch(14272);
        vertexBuffer.set(pointA, this.index * 12 + 3);
        __touch(14273);
        vertexBuffer.set(pointA, this.index * 12 + 6);
        __touch(14274);
        vertexBuffer.set(pointA, this.index * 12 + 9);
        __touch(14275);
    };
    __touch(14199);
    return Particle;
    __touch(14200);
});
__touch(14192);