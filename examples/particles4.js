require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/systems/ParticlesSystem',
	'goo/entities/components/ParticleComponent',
	'goo/particles/ParticleUtils',
	'goo/particles/ParticleEmitter',
	'goo/renderer/shaders/ShaderLib'
], function (
	MeshDataComponent,
	MeshRendererComponent,
	Material,
	GooRunner,
	TextureCreator,
	ScriptComponent,
	Camera,
	CameraComponent,
	Vector3,
	MathUtils,
	OrbitCamControlScript,
	ParticlesSystem,
	ParticleComponent,
	ParticleUtils,
	ParticleEmitter,
	ShaderLib
) {
	"use strict";

	var resourcePath = "../resources";

	function init () {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/particle_atlas.png');
		texture.wrapS = 'EdgeClamp';
		texture.wrapT = 'EdgeClamp';
		texture.generateMipmaps = true;

		var additiveMaterial = Material.createMaterial(ShaderLib.particles);
		additiveMaterial.textures.push(texture);
		additiveMaterial.blendState.blending = 'AdditiveBlending';
		additiveMaterial.cullState.enabled = false;
		additiveMaterial.depthState.write = false;

		var alphaMaterial = Material.createMaterial(ShaderLib.particles);
		alphaMaterial.textures.push(texture);
		alphaMaterial.blendState.blending = 'AlphaBlending';
		alphaMaterial.cullState.enabled = false;
		alphaMaterial.depthState.write = false;

		// Add ParticlesSystem to world.
		var particles = new ParticlesSystem();
		goo.world.setSystem(particles);

		// create our shared particles
		var additiveParticleComponent = createParticles(goo.world, additiveMaterial);
		var alphaParticleComponent = createParticles(goo.world, alphaMaterial);

		// add various emitters
		addFlame(additiveParticleComponent);
		addCH4Flame(additiveParticleComponent);
		addSmoke(alphaParticleComponent);
		addWhiteEnergy(additiveParticleComponent);
		addRipples(alphaParticleComponent);
		addGooText(additiveParticleComponent);
		addLetterRain(alphaParticleComponent);
		addSphere(alphaParticleComponent);
		addBox(alphaParticleComponent);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 30, 40);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 2, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(50, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	// Create simple quad
	function createParticles (world, material) {
		// Create entity
		var entity = world.createEntity();

		// Create particle component
		var particleComponent = new ParticleComponent({
			particleCount : 500,
			uRange : 4,
			vRange : 4
		});

		entity.setComponent(particleComponent);

		// Create meshdata component using particle data
		var meshDataComponent = new MeshDataComponent(particleComponent.meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		entity.addToWorld();

		return particleComponent;
	}

	function addFlame (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 30,
			minLifetime : 0.5,
			maxLifetime : 2.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				ParticleUtils.applyEntityTransformPoint(vec3.set(25, 0, 0), particleEntity);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 15 / 180, 5);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 2.0,
				color : [1, 1, 0, 1]
			}, {
				timeOffset : 0.25,
				color : [1, 0, 0, 1]
			}, {
				timeOffset : 0.25,
				color : [0, 0, 0, 1]
			}, {
				timeOffset : 0.5,
				size : 3.0,
				color : [0, 0, 0, 0]
			}]
		}));
	}

	function addCH4Flame (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 40,
			minLifetime : 0.5,
			maxLifetime : 2.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				ParticleUtils.applyEntityTransformPoint(vec3.set(20, 0, 0), particleEntity);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 5 / 180, 4);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 2.0,
				color : [0.2, 0.2, 1, 1]
			}, {
				timeOffset : 0.33,
				color : [0, 0, 1, 1]
			}, {
				timeOffset : 0.66,
				size : 0.66,
				color : [0, 0, 0, 0]
			}]
		}));
	}

	function addSmoke (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 25,
			minLifetime : 0.5,
			maxLifetime : 4.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				ParticleUtils.applyEntityTransformPoint(vec3.set(10, 0, 0), particleEntity);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 18 / 180, 8);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 3.0,
				color : [0, 0, 0, 1]
			}, {
				timeOffset : 1.0,
				size : 6.0,
				color : [0, 0, 0, 0]
			}]
		}));
	}

	function addWhiteEnergy (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 30,
			minLifetime : 0.5,
			maxLifetime : 4.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				var center = ParticleUtils.applyEntityTransformPoint(vec3.set(0, 0, 0), particleEntity);
				ParticleUtils.randomPointInCube(vec3, 5, 0, 5, center);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return vec3.set(0, 0, 0);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 2.0,
				color : [1, 1, 1, 0]
			}, {
				timeOffset : 0.2,
				color : [1, 1, 1, 1]
			}, {
				timeOffset : 0.8,
				size : 3.0,
				color : [1, 1, 1, 0]
			}]
		}));
	}

	function addRipples (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 10,
			minLifetime : 0.5,
			maxLifetime : 4.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				var center = ParticleUtils.applyEntityTransformPoint(vec3.set(-20, 0, 0), particleEntity);
				ParticleUtils.randomPointInCube(vec3, 5, 0, 5, center);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return vec3.set(0, 0, 0);
			},
			getParticleBillboardVectors : function (particle, particleEntity) {
				particle.bbX.set(-1, 0, 0);
				particle.bbY.set(0, 0, -1);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 1.0,
				color : [0.7, 0.8, 1, 1],
				uvIndex : 1
			}, {
				timeOffset : 1.0,
				size : 4.0,
				color : [1, 1, 1, 0]
			}]
		}));
	}

	function addGooText (particleComponent) {
		var image = [//
		'.XXXX....XXXX....XXXX...XX', //
		'X.......X....X..X....X..XX', //
		'X..XXX..X....X..X....X..XX', //
		'X....X..X....X..X....X....', //
		'.XXXX....XXXX....XXXX...XX'];
		var height = image.length;
		var width = image[0].length;

		var positions = [];
		for ( var yy = 0; yy < height; ++yy) {
			for ( var xx = 0; xx < width; ++xx) {
				if (image[yy].substring(xx, xx + 1) == 'X') {
					positions.push([(xx - width * 0.5) * 0.5, -(yy - height * 0.5) * 0.5]);
				}
			}
		}

		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : positions.length * 4,
			minLifetime : 0.5,
			maxLifetime : 4.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				var index = Math.floor(Math.random() * positions.length);
				index = Math.min(index, positions.length - 1);
				ParticleUtils.applyEntityTransformPoint(vec3.set(positions[index][0], 10 + positions[index][1], 0), particleEntity);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return vec3.set(Math.random() * .2 - .1, 0, Math.random() * .2 - .1);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 0.5,
				color : [1, 0, 0, 1]
			}, {
				timeOffset : 0.33,
				color : [0, 1, 0, 1]
			}, {
				timeOffset : 0.33,
				color : [0, 0, 1, 1]
			}, {
				timeOffset : 0.33,
				size : 1.0,
				color : [1, 1, 0, 0]
			}]
		}));
	}

	function addLetterRain (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 10,
			minLifetime : 2.0,
			maxLifetime : 2.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				var center = ParticleUtils.applyEntityTransformPoint(vec3.set(-20, 10, 0), particleEntity);
				ParticleUtils.randomPointInCube(vec3, 5, 0, 5, center);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return vec3.set(0, -5, 0);
			},
			timeline : [{
				timeOffset : 0.0,
				size : 0.25,
				spin : 0,
				uvIndex : 2,
				color : [1, 1, 1, 1]
			}, {
				timeOffset : 0.1,
				uvIndex : 3
			}, {
				timeOffset : 0.1,
				uvIndex : 4
			}, {
				timeOffset : 0.1,
				uvIndex : 5
			}, {
				timeOffset : 0.1,
				uvIndex : 6
			}, {
				timeOffset : 0.1,
				uvIndex : 7
			}, {
				timeOffset : 0.1,
				uvIndex : 8
			}, {
				timeOffset : 0.1,
				uvIndex : 9
			}, {
				timeOffset : 0.1,
				uvIndex : 10
			}, {
				timeOffset : 0.1,
				uvIndex : 11,
				color : [1, 1, 1, 1]
			}, {
				timeOffset : 0.1,
				size : 0.5,
				spin : 4 * Math.PI,
				color : [1, 1, 1, 0]
			}]
		}));
	}

	function addSphere (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 100,
			minLifetime : 2.0,
			maxLifetime : 2.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				var center = ParticleUtils.applyEntityTransformPoint(vec3.set(20, 5, -10), particleEntity);
				var spherical = new Vector3(), tangent = new Vector3();
				var azimuth = Math.random() * 2 * Math.PI;
				var polar = Math.random() * 2 * Math.PI;
				var tangentPolar = (polar + Math.PI / 2) % (2 * Math.PI);
				MathUtils.sphericalToCartesian(5, azimuth, polar, spherical);
				vec3.x = center.x + spherical.x;
				vec3.y = center.y + spherical.y;
				vec3.z = center.z + spherical.z;
				MathUtils.sphericalToCartesian(5, azimuth, tangentPolar, tangent);
				particle.emit_bbX = tangent.normalize();
				particle.emit_bbY = spherical.normalize().cross(tangent);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return vec3.set(0, 0, 0);
			},
			getParticleBillboardVectors : function (particle, particleEntity) {
				particle.bbX.set(particle.emit_bbX);
				particle.bbY.set(particle.emit_bbY);
			},
			timeline : [{
				timeOffset : 0.0,
				size : 0.25,
				color : [1, 1, 1, 1],
				uvIndex : 1
			}, {
				timeOffset : 1.0,
				size : 0.75,
				color : [1, 1, 0, 0]
			}]
		}));
	}

	function addBox (particleComponent) {
		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 100,
			minLifetime : 2.0,
			maxLifetime : 2.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				var center = ParticleUtils.applyEntityTransformPoint(vec3.set(-20, 5, -10), particleEntity);
				var side = Math.floor(Math.random() * 3);
				var dir = Math.floor(Math.random() * 2);
				var x = 2 * Math.random() - 1.0;
				var y = 2 * Math.random() - 1.0;
				var extent = 5;

				if (side == 0) {
					center.x += extent * (dir ? 1 : -1);
					center.y += y * extent;
					center.z += x * extent;
					particle.emit_bbX = [0, 0, 1];
					particle.emit_bbY = [0, 1, 0];
				} else if (side == 1) {
					center.y += extent * (dir ? 1 : -1);
					center.z += y * extent;
					center.x += x * extent;
					particle.emit_bbX = [1, 0, 0];
					particle.emit_bbY = [0, 0, 1];
				} else {
					center.z += extent * (dir ? 1 : -1);
					center.y += y * extent;
					center.x += x * extent;
					particle.emit_bbX = [1, 0, 0];
					particle.emit_bbY = [0, 1, 0];
				}
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return vec3.set(0, 0, 0);
			},
			getParticleBillboardVectors : function (particle, particleEntity) {
				particle.bbX.set(particle.emit_bbX);
				particle.bbY.set(particle.emit_bbY);
			},
			timeline : [{
				timeOffset : 0.0,
				size : 0.25,
				color : [1, 1, 1, 1],
				uvIndex : 1
			}, {
				timeOffset : 1.0,
				size : 0.75,
				color : [1, 0, 1, 0]
			}]
		}));
	}

	init();
});
