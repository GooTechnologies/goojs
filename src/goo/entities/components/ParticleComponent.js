// 1. A ParticleComponent is an entity component that creates and modifies MeshData to simulate particle effects.
//
// 2. ParticleComponents may have 1 or more emitters. Each emitter spawns particles, controlling spawn rate, lifetime, initial velocity vector and
// position of each particle.
//
// 3. Each Particle System also contains a timeline describing changes each particle should perform over its lifetime, including:
// - Size of particle
// - Color of particle
// - Orientation of particle (rotation on screen plane)
// - Texture coords used.
// - Other user defined params.
//
// 4. External influences can exert on particles via a defined callback function system.
//
// 5. Particles billboard toward the screen using a provided Camera as reference.

define(['goo/entities/components/Component', 'goo/particles/Particle', 'goo/particles/ParticleEmitter', 'goo/renderer/MeshData', 'goo/math/Vector3',
		'goo/math/Vector4'],
/** @lends ParticleComponent */
function(Component, Particle, ParticleEmitter, MeshData, Vector3, Vector4) {
	"use strict";

	ParticleComponent.prototype = Object.create(Component.prototype);

	/**
	 * TODO...
	 * 
	 * @class
	 */
	function ParticleComponent(settings) {
		this.type = 'ParticleComponent';

		Component.call(this);

		settings = settings || {};

		this.emitters = [];
		if (settings.emitters) {
			for ( var i = 0, max = settings.emitters.length; i < max; i++) {
				this.emitters.push(new ParticleEmitter(settings.emitters[i]));
			}
		}

		this.timeline = settings.timeline ? settings.timeline : [];

		this.uRange = isNaN(settings.uRange) ? 1 : settings.uRange;
		this.vRange = isNaN(settings.vRange) ? 1 : settings.vRange;

		var particleCount = isNaN(settings.particleCount) ? 100 : settings.particleCount;
		this.recreateParticles(particleCount);

		this.enabled = true;
	}

	ParticleComponent.prototype.generateMeshData = function() {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR, MeshData.TEXCOORD0]);
		this.meshData = new MeshData(attributeMap, this.particleCount * 4, this.particleCount * 6);

		// setup texture coords
		var uvBuffer = this.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		var indexBuffer = this.meshData.getIndexBuffer();
		for ( var i = 0, max = this.particleCount; i < max; i++) {
			uvBuffer.set([1.0, 0.0], i * 8 + 0);
			uvBuffer.set([1.0, 1.0], i * 8 + 2);
			uvBuffer.set([0.0, 1.0], i * 8 + 4);
			uvBuffer.set([0.0, 0.0], i * 8 + 6);

			indexBuffer.set([i * 4 + 0, i * 4 + 3, i * 4 + 1, i * 4 + 1, i * 4 + 3, i * 4 + 2], i * 6);
		}
	};

	ParticleComponent.prototype.recreateParticles = function(particleCount) {
		this.particleCount = particleCount;
		this.particles = [];
		for ( var i = 0; i < this.particleCount; i++) {
			this.particles[i] = new Particle(this, i);
		}
		this.generateMeshData();
	};

	return ParticleComponent;
});