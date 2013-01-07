// 1. A ParticleComponent is an entity component that creates and modifies MeshData to simulate particle effects.
//
// 2. ParticleComponents may have 1 or more emitters. Each emitter spawns particles, controlling spawn rate, lifetime, initial velocity vector and position of each particle.
//
// 3. Each Particle System also contains a timeline describing changes each particle should perform over its lifetime, including:
//		- Size of particle
//		- Color of particle
//		- Orientation of particle (rotation on screen plane)
//		- Texture coords used.
//		- Other user defined params.
//
// 4. External influences can exert on particles via a defined callback function system.
//
// 5. Particles billboard toward the screen using a provided Camera as reference.

define([ 'goo/entities/components/Component', 'goo/particles/Particle', 'goo/particles/ParticleEmitter', 'goo/renderer/MeshData', 'goo/math/Vector3', 'goo/math/Vector4' ], 
		function(Component, Particle, ParticleEmitter, MeshData, Vector3, Vector4) {
	"use strict";

	ParticleComponent.prototype = Object.create(Component.prototype);

	/**
	 * @name ParticleComponent
	 * @class
	 */
	function ParticleComponent(settings) {
		this.type = 'ParticleComponent';
		
		Component.call(this);
		
		settings = settings || {};
		
		this.emitters = [];
		if (settings.emitters) {
			for (var i = 0, max = settings.emitters.length; i < max; i++) {
				this.emitters.push(new ParticleEmitter(settings.emitters[i]));
			}
		}

		this.timeline = settings.timeline ? settings.timeline : [];
		
		this.influences = settings.influences ? settings.influences : [];
		
		var particleCount = settings.particleCount ? settings.particleCount : 100;
		this.recreateParticles(particleCount);
		
		this.enabled = true;
	}
	
	ParticleComponent.prototype.generateMeshData = function() {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR, MeshData.TEXCOORD0]);
		this.meshData = new MeshData(attributeMap, this.particleCount * 3);

		// setup texture coords
		var uvBuffer = this.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		for (var i = 0, max = this.particleCount; i < max; i++) {
			uvBuffer.set([2.0, 0.0], i * 6 + 0);
			uvBuffer.set([0.0, 2.0], i * 6 + 2);
			uvBuffer.set([0.0, 0.0], i * 6 + 4);
		}
	};

	ParticleComponent.prototype.recreateParticles = function(particleCount) {
		this.particleCount = particleCount;
		this.particles = [];
		for (var i = 0; i < this.particleCount; i++) {
			this.particles[i] = new Particle(this, i);
		}
		this.generateMeshData();
	};

	return ParticleComponent;
});