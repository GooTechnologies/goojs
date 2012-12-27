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

	ParticleComponent.prototype.applyTimeline = function(particle) {
		var age = particle.age, lifeSpan = particle.lifeSpan;
		var prevCAge = 0, prevMAge = 0, prevSiAge = 0, prevSpAge = 0;
		var nextCAge = lifeSpan, nextMAge = lifeSpan, nextSiAge = lifeSpan, nextSpAge = lifeSpan;
		var trAge = 0, ratio = 0;
		var prevCEntry = null, prevMEntry = null, prevSiEntry = null, prevSpEntry = null;
		var nextCEntry = null, nextMEntry = null, nextSiEntry = null, nextSpEntry = null;
        for (var i = 0, max = this.timeline.length; i < max; i++) {
            var entry = this.timeline[i];
            trAge += entry.timeOffset * lifeSpan;
            // Color
            if (nextCEntry == null) {
                if (trAge > age) {
                    if (entry.color !== undefined) {
                        nextCAge = trAge;
                        nextCEntry = entry;
                    }
                } else {
                    if (entry.color !== undefined) {
                        prevCAge = trAge;
                        prevCEntry = entry;
                    }
                }
            }

            // mass
            if (nextMEntry == null) {
                if (trAge > age) {
                    if (entry.mass !== undefined) {
                        nextMAge = trAge;
                        nextMEntry = entry;
                    }
                } else {
                    if (entry.mass !== undefined) {
                        prevMAge = trAge;
                        prevMEntry = entry;
                    }
                }
            }

            // size
            if (nextSiEntry == null) {
                if (trAge > age) {
                    if (entry.size !== undefined) {
                        nextSiAge = trAge;
                        nextSiEntry = entry;
                    }
                } else {
                    if (entry.size !== undefined) {
                        prevSiAge = trAge;
                        prevSiEntry = entry;
                    }
                }
            }

            // spin
            if (nextSpEntry == null) {
                if (trAge > age) {
                    if (entry.spin !== undefined) {
                        nextSpAge = trAge;
                        nextSpEntry = entry;
                    }
                } else {
                    if (entry.spin !== undefined) {
                        prevSpAge = trAge;
                        prevSpEntry = entry;
                    }
                }
            }
        }

        // color
        {
            ratio = ((age - prevCAge) / (nextCAge - prevCAge));
            var start = prevCEntry != null ? prevCEntry.color : [1,1,1,1];
            var end = nextCEntry != null ? nextCEntry.color : start;
            if (!particle.color) particle.color = [1,1,1,1];
            particle.color.x = (1.0 - ratio) * start[0] + ratio * end[0];
            particle.color.y = (1.0 - ratio) * start[1] + ratio * end[1];
            particle.color.z = (1.0 - ratio) * start[2] + ratio * end[2];
            particle.color.w = (1.0 - ratio) * start[3] + ratio * end[3];
        }

        // mass
        {
        	ratio = (age - prevMAge) / (nextMAge - prevMAge);
        	var start = prevMEntry != null ? prevMEntry.mass : 1.0;
            var end = nextMEntry != null ? nextMEntry.mass : start;
            particle.mass = (1 - ratio) * start + ratio * end;
        }

        // Size
        {
        	ratio = (age - prevSiAge) / (nextSiAge - prevSiAge);
        	var start = prevSiEntry != null ? prevSiEntry.size : 1.0;
            var end = nextSiEntry != null ? nextSiEntry.size : start;
            particle.size = (1 - ratio) * start + ratio * end;
        }

        // Spin
        {
        	ratio = (age - prevSpAge) / (nextSpAge - prevSpAge);
            var start = prevSpEntry != null ? prevSpEntry.spin : 0.0;
            var end = nextSpEntry != null ? nextSpEntry.spin : start;
            particle.spin = (1 - ratio) * start + ratio * end;
        }
	};
	
	return ParticleComponent;
});