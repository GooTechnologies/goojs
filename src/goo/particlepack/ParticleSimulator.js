define([
	'goo/particlepack/Particle',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/MathUtils',
	'goo/renderer/MeshData',
	'goo/entities/EntityUtils',
	'goo/particlepack/ParticleBehaviors',
	'goo/particlepack/ParticleRenderer',
	'goo/particlepack/LineRenderer',
	'goo/particlepack/TrailRenderer'
],
/** @lends */
function (
	Particle,
	Vector3,
	Vector4,
	MathUtils,
	MeshData,
	EntityUtils,
	ParticleBehaviors,
	ParticleRenderer,
	LineRenderer,
	TrailRenderer
) {
	"use strict";

	function createSpawner(name) {
		if (!name) {
			return null;
		}

		if (typeof name === "function") {
			return name;
		}

		return ParticleBehaviors[name];
	}

	function createRenderer(name) {
		if (name === 'ParticleRenderer') {
			return new ParticleRenderer();
		} else if (name === 'LineRenderer') {
			return new LineRenderer();
		} else if (name === 'TrailRenderer') {
			return new TrailRenderer();
		} 
	}

	function ParticleSimulator(goo, settings) {
		this.goo = goo;

		this.meshPositions = [];
		var entity = goo.world.by.name(settings.follow.value).first();
		if (entity) {
			if (settings.followType.value === 'Mesh') {
				entity.traverse(function (child) {
					if (child.meshDataComponent) {
						this.entity = child;
						this.meshPositions = child.meshDataComponent.meshData.getAttributeBuffer(MeshData.POSITION);
						// settings.poolCount = Math.min(this.meshPositions.length, settings.poolCount);
						// console.log(settings.poolCount);
					}
				}.bind(this));
			} else if (settings.followType.value === 'Joint') {
				var pose = entity.animationComponent._skeletonPose;

				this.entity = entity;
				// EntityUtils.hide(this.entity);
				this.jointTransforms = [];
				for (var i = pose._globalTransforms.length - 1; i >= 0; i--) {
					var jointTransform = pose._globalTransforms[i];
					if (!jointTransform) { continue; }
					this.jointTransforms.push(jointTransform);
				}
				settings.poolCount = Math.min(this.jointTransforms.length, 100);
			}
		}

		this.particles = [];
		for (var i = 0; i < settings.poolCount; i++) {
			var particle = new Particle();
			this.particles[i] = particle;
		}

		this.aliveParticles = 0;

		this.settings = settings;
		this.setup = settings.setup;
		this.spawner = createSpawner(settings.spawner.value);

		this.behaviors = [];

		for (i = 0; i < settings.behaviors.length; i++) {
			var name = settings.behaviors[i];
			this.behaviors[i] = createSpawner(name);
		}

		this.renderers = [];
		settings.renderers = settings.renderers || {};

		for (var rendererName in settings.renderers) {
			var rendererObj = settings.renderers[rendererName];
			if (!rendererObj.enabled) {
				continue;
			}
			var instance = createRenderer(rendererName);
			instance.topSettings = settings;
			instance.globalSettings = rendererObj;
			this.renderers.push(instance);
			if (instance.init) {
				instance.init(goo, rendererObj.settings);
				instance.setVisible(rendererObj.enabled);
			}
		}

		if (this.setup) {
			this.setup(this);
		}

		this.alphaFunction = settings.alphaFunction || function (particle) {
			var step = 1;
			if (!settings.skipFade.value) {
				if (particle.lifeSpan < particle.lifeSpanTotal * 0.5) {
					step = MathUtils.smoothstep(0, particle.lifeSpanTotal * 0.25, particle.lifeSpan);
				} else {
					step = 1 - MathUtils.smoothstep(particle.lifeSpanTotal * 0.6, particle.lifeSpanTotal, particle.lifeSpan);
				}
			}
			particle.alpha = particle.color.data[3] * step;
		};

		this.visible = true;

		this.calcVec = new Vector3();
	}

	function updateWorldTransform(transformComponent) {
		transformComponent.updateWorldTransform();
		var entity = transformComponent.entity;
		if (entity && entity.meshDataComponent && entity.meshRendererComponent) {
			entity.meshRendererComponent.updateBounds(
				entity.meshDataComponent.modelBound,
				transformComponent.worldTransform
			);
		}

		for (var i = 0; i < transformComponent.children.length; i++) {
			updateWorldTransform(transformComponent.children[i]);
		}
	}

	ParticleSimulator.prototype.rebuild = function () {
		this.spawner = createSpawner(this.settings.spawner.value);
		for (var i = 0; i < this.renderers.length; i++) {
			if (this.renderers[i].rebuild) {
				this.renderers[i].rebuild();
			}
			this.renderers[i].setVisible(this.renderers[i].globalSettings.enabled);
		}
	};

	ParticleSimulator.prototype.remove = function () {
		for (var i = 0; i < this.renderers.length; i++) {
			if (this.renderers[i].remove) {
				this.renderers[i].remove();
			}
		}
	};

	ParticleSimulator.prototype.setVisible = function (visible) {
		for (var i = 0; i < this.renderers.length; i++) {
			if (this.renderers[i].setVisible) {
				this.renderers[i].setVisible(visible);
			}
		}
		this.visible = visible;
	};

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	ParticleSimulator.prototype.wakeParticle = function () {
		for (var i = 0, l = this.particles.length; i < l; i++) {
			var particle = this.particles[i];

			if (particle.dead) {
				particle.dead = false;
				this.aliveParticles++;

				particle.color.setArray(this.settings.color.value);
				particle.size = randomBetween(this.settings.size.value[0], this.settings.size.value[1]);
				particle.rotation = randomBetween(this.settings.rotation.value[0], this.settings.rotation.value[1]);
				particle.lifeSpanTotal = randomBetween(this.settings.lifespan.value[0], this.settings.lifespan.value[1]);
				particle.lifeSpan = 0;

				particle.growth = randomBetween(this.settings.growth.value[0], this.settings.growth.value[1]);
				particle.spin = randomBetween(this.settings.spin.value[0], this.settings.spin.value[1]);

				return particle;
			}
		}
	};

	ParticleSimulator.prototype.update = function (tpf) {
		if (!this.visible) {
			return;
		}

		if (this.spawner) {
			this.spawner(this);
		}

		var velocityMultiplier = tpf;
		var damp = 1 - tpf * (this.settings.damping.value || 0);
		var i, j, l;
		for (i = 0, l = this.particles.length; i < l; i++) {
			var particle = this.particles[i];

			if (particle.dead) {
				continue;
			}

			particle.lifeSpan += tpf;
			if (!this.settings.eternal.value) {
				if (particle.lifeSpan >= particle.lifeSpanTotal) {
					particle.dead = true;
					this.aliveParticles--;
					for (j = 0; j < this.renderers.length; j++) {
						this.renderers[j].died(i, particle);
					}
					continue;
				}
			}

			for (j = 0; j < this.behaviors.length; j++) {
				this.behaviors[j](tpf, particle, this.settings, this);
			}

			particle.size += particle.growth * tpf;
			particle.rotation += particle.spin * tpf;

			particle.velocity.scale(damp);
			if (particle.velocity.lengthSquared() < 0.0001) {
				particle.velocity.setDirect(0, 0, 0);
			}
			this.calcVec.setVector(particle.velocity).scale(velocityMultiplier);
			particle.position.addVector(this.calcVec);

			this.alphaFunction(particle);
		}

		for (i = 0; i < this.renderers.length; i++) {
			this.renderers[i].update(tpf, this.particles);
		}
	};

	return ParticleSimulator;
});