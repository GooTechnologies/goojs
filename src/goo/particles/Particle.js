define([
	'goo/particles/ParticleUtils',
	'goo/math/Vector',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/renderer/MeshData'
],
/** @lends */
function (
	ParticleUtils,
	Vector,
	Vector3,
	Vector4,
	MeshData
) {
	'use strict';

	var calcVec = new Vector3();

	/**
	 * @class Data object tracking a single particle in a particle component
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
		if (!Vector.equals(this.lastColor, this.color)) {
			var colorBuffer = this.parent.meshData.getAttributeBuffer(MeshData.COLOR);
			colorBuffer.set(this.color.data, this.index * 16 + 0);
			colorBuffer.set(this.color.data, this.index * 16 + 4);
			colorBuffer.set(this.color.data, this.index * 16 + 8);
			colorBuffer.set(this.color.data, this.index * 16 + 12);
			this.lastColor.setVector(this.color);
		}

		// determine our particle plane
		if (this.emitter) {
			this.emitter.getParticleBillboardVectors(this, particleEntity);
		}
		if (this.spin === 0) {
			this.bbX.mulDirect(this.size, this.size, this.size);
			this.bbY.mulDirect(this.size, this.size, this.size);
		} else {
			var cA = Math.cos(this.spin) * this.size;
			var sA = Math.sin(this.spin) * this.size;
			var upX = this.bbY.x, upY = this.bbY.y, upZ = this.bbY.z;
			this.bbY.setVector(this.bbX);
			this.bbX.mulDirect(cA, cA, cA).addDirect(upX * sA, upY * sA, upZ * sA);
			this.bbY.mulDirect(-sA, -sA, -sA).addDirect(upX * cA, upY * cA, upZ * cA);
		}

		// apply billboard vectors to mesh verts
		var vertexBuffer = this.parent.meshData.getAttributeBuffer(MeshData.POSITION);

		// bottom right point
		Vector3.subVector(this.position, this.bbX, calcVec).subVector(this.bbY);
		vertexBuffer.set(calcVec.data, this.index * 12 + 0);

		// top right point
		Vector3.subVector(this.position, this.bbX, calcVec).addVector(this.bbY);
		vertexBuffer.set(calcVec.data, this.index * 12 + 3);

		// top left point
		Vector3.addVector(this.position, this.bbX, calcVec).addVector(this.bbY);
		vertexBuffer.set(calcVec.data, this.index * 12 + 6);

		// bottom left corner
		Vector3.addVector(this.position, this.bbX, calcVec).subVector(this.bbY);
		vertexBuffer.set(calcVec.data, this.index * 12 + 9);

		if (this.lastUVIndex !== this.uvIndex) {
			var uvBuffer = this.parent.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
			var uIndex = (this.uvIndex % this.parent.uRange) / this.parent.uRange;
			var vIndex = 1.0 - (Math.floor(this.uvIndex / this.parent.vRange) / this.parent.vRange);
			var uDelta = 1.0 / this.parent.uRange;
			var vDelta = 1.0 / this.parent.vRange;

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

	return Particle;
});