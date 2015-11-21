var ParticleUtils = require('../particles/ParticleUtils');
var Vector = require('../math/Vector');
var Vector3 = require('../math/Vector3');
var Vector4 = require('../math/Vector4');
var MeshData = require('../renderer/MeshData');

	'use strict';

	var calcVec = new Vector3();

	/**
	 * Data object tracking a single particle in a particle component
	 */
	function Particle(particleComponent, index) {
		this.alive = false;
		this.position = new Vector3();
		this.velocity = new Vector3();
		this.lifeSpan = 0;
		this.parent = particleComponent;
		this.age = 0;
		this.index = index;
		this.color = new Vector4(1, 0, 0, 1);
		this.size = 0.0;
		this.spin = 0.0;
		this.mass = 1.0;
		this.emitter = null;
		this.uvIndex = 0;
		this.lastUVIndex = -1;
		this.bbX = new Vector3();
		this.bbY = new Vector3();
		this.lastColor = new Vector4();
	}

	/**
	 * Called by the particle system to 'respawn' this particle
	 * @private
	 * @param emitter
	 */
	Particle.prototype.respawnParticle = function (emitter) {
		this.emitter = emitter;
		this.lifeSpan = emitter.nextParticleLifeSpan();
		this.alive = true;
		this.age = 0;
	};

	var tmpArray = [];

	/**
	 * Called by the particle system each frame to update the position and other properties of the particle
	 * @private
	 * @param tpf
	 * @param particleEntity
	 */
	Particle.prototype.update = function (tpf, particleEntity) {
		if (!this.alive) {
			return;
		}

		this.age += tpf;

		if (this.age > this.lifeSpan) {
			this.kill();
			return;
		}

		this.position.addDirect(this.velocity.x * tpf, this.velocity.y * tpf, this.velocity.z * tpf);

		// set values from component timeline
		ParticleUtils.applyTimeline(this, this.emitter && this.emitter.timeline ? this.emitter.timeline : this.parent.timeline);

		// apply current color to mesh
		if (!this.lastColor.equals(this.color)) {
			var colorBuffer = this.parent.meshData.getAttributeBuffer(MeshData.COLOR);

			var offset = this.index * 16;

			colorBuffer[offset + 0 + 0] = this.color.r;
			colorBuffer[offset + 0 + 1] = this.color.g;
			colorBuffer[offset + 0 + 2] = this.color.b;
			colorBuffer[offset + 0 + 3] = this.color.a;

			colorBuffer[offset + 4 + 0] = this.color.r;
			colorBuffer[offset + 4 + 1] = this.color.g;
			colorBuffer[offset + 4 + 2] = this.color.b;
			colorBuffer[offset + 4 + 3] = this.color.a;

			colorBuffer[offset + 8 + 0] = this.color.r;
			colorBuffer[offset + 8 + 1] = this.color.g;
			colorBuffer[offset + 8 + 2] = this.color.b;
			colorBuffer[offset + 8 + 3] = this.color.a;

			colorBuffer[offset + 12 + 0] = this.color.r;
			colorBuffer[offset + 12 + 1] = this.color.g;
			colorBuffer[offset + 12 + 2] = this.color.b;
			colorBuffer[offset + 12 + 3] = this.color.a;

			this.lastColor.set(this.color);
		}

		// determine our particle plane
		if (this.emitter) {
			this.emitter.getParticleBillboardVectors(this, particleEntity);
		}
		if (this.spin === 0) {
			this.bbX.scale(this.size);
			this.bbY.scale(this.size);
		} else {
			var cA = Math.cos(this.spin) * this.size;
			var sA = Math.sin(this.spin) * this.size;
			var upX = this.bbY.x, upY = this.bbY.y, upZ = this.bbY.z;
			this.bbY.set(this.bbX);
			this.bbX.scale(cA).addDirect(upX * sA, upY * sA, upZ * sA);
			this.bbY.scale(-sA).addDirect(upX * cA, upY * cA, upZ * cA);
		}

		// apply billboard vectors to mesh verts
		var vertexBuffer = this.parent.meshData.getAttributeBuffer(MeshData.POSITION);

		var offset = this.index * 12;

		// bottom right point
		calcVec.set(this.position).sub(this.bbX).sub(this.bbY);
		vertexBuffer[offset + 0 + 0] = calcVec.x;
		vertexBuffer[offset + 0 + 1] = calcVec.y;
		vertexBuffer[offset + 0 + 2] = calcVec.z;

		// top right point
		calcVec.set(this.position).sub(this.bbX).add(this.bbY);
		vertexBuffer[offset + 3 + 0] = calcVec.x;
		vertexBuffer[offset + 3 + 1] = calcVec.y;
		vertexBuffer[offset + 3 + 2] = calcVec.z;

		// top left point
		calcVec.set(this.position).add(this.bbX).add(this.bbY);
		vertexBuffer[offset + 6 + 0] = calcVec.x;
		vertexBuffer[offset + 6 + 1] = calcVec.y;
		vertexBuffer[offset + 6 + 2] = calcVec.z;

		// bottom left corner
		calcVec.set(this.position).add(this.bbX).sub(this.bbY);
		vertexBuffer[offset + 9 + 0] = calcVec.x;
		vertexBuffer[offset + 9 + 1] = calcVec.y;
		vertexBuffer[offset + 9 + 2] = calcVec.z;

		if (this.lastUVIndex !== this.uvIndex) {
			var uvBuffer = this.parent.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
			var uIndex = (this.uvIndex % this.parent.uRange) / this.parent.uRange;
			var vIndex = 1.0 - (Math.floor(this.uvIndex / this.parent.vRange) / this.parent.vRange);
			var uDelta = 1.0 / this.parent.uRange;
			var vDelta = 1.0 / this.parent.vRange;

			//! AT: why go through this array?! there's only 2 values; what's the point?
			tmpArray[0] = uIndex + uDelta;
			tmpArray[1] = vIndex - vDelta;
			uvBuffer.set(tmpArray, this.index * 8 + 0);

			tmpArray[0] = uIndex + uDelta;
			tmpArray[1] = vIndex;
			uvBuffer.set(tmpArray, this.index * 8 + 2);

			tmpArray[0] = uIndex;
			tmpArray[1] = vIndex;
			uvBuffer.set(tmpArray, this.index * 8 + 4);

			tmpArray[0] = uIndex;
			tmpArray[1] = vIndex - vDelta;
			uvBuffer.set(tmpArray, this.index * 8 + 6);

			this.lastUVIndex = this.uvIndex;
		}
	};

	/**
	 * Called by update to mark this particle as dead/reusable
	 * @private
	 */
	Particle.prototype.kill = function () {
		this.alive = false;
		// collapse particle to a single point, effectively hiding it from view.
		var vertexBuffer = this.parent.meshData.getAttributeBuffer(MeshData.POSITION);
		var pointA = vertexBuffer.subarray(this.index * 12, this.index * 12 + 3);
		vertexBuffer.set(pointA, this.index * 12 + 3);
		vertexBuffer.set(pointA, this.index * 12 + 6);
		vertexBuffer.set(pointA, this.index * 12 + 9);
	};

	module.exports = Particle;