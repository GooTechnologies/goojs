var Material = require('../renderer/Material');
var ShaderLib = require('../renderer/shaders/ShaderLib');
var ParticleLib = require('../particles/ParticleLib');
var Renderer = require('../renderer/Renderer');
import ParticleSystemUtils = require('../util/ParticleSystemUtils');
import Vector3 = require('../math/Vector3');

/**
 * Snow
 * @param {GooRunner} gooRunner
 */
class Snow {
	velocity: number;
	height: number;
	material: any;
	particleCloudEntity: any;
	onCameraChange: any;
	constructor(gooRunner) {
		this.velocity = 10;
		this.height = 25;

		// put this in some subroutine
		this.material = new Material(ShaderLib.particles);
		var texture = ParticleSystemUtils.createFlareTexture(64); //Snowflake
		texture.generateMipmaps = true;
		this.material.setTexture('DIFFUSE_MAP', texture);
		this.material.blendState.blending = 'AdditiveBlending';
		this.material.cullState.enabled = false;
		this.material.depthState.write = false;
		this.material.renderQueue = 2002;

		// actually needed
		var that = this;

		// and this too
		this.particleCloudEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getSnow({
				getEmissionPoint: function (vec3) {
					// either camera or some predefined area

					// camera
					vec3.copy(Renderer.mainCamera ? Renderer.mainCamera.translation : new Vector3());
					vec3.x += Math.random() * 1000 - 500;
					vec3.y += that.height; // put higher than camera
					vec3.z += Math.random() * 1000 - 500;
				},
				getEmissionVelocity: function (vec3) {
					vec3.x = (Math.random() - 0.5) * 2;
					vec3.y = -(Math.random() + 1) * that.velocity;
					vec3.z = (Math.random() - 0.5) * 2;
				}
			}),
			this.material
		);
		this.particleCloudEntity.name = '_ParticleSystemSnow';

		this.onCameraChange = function (newCam) {
			newCam.entity.attachChild(this.particleCloudEntity);
		}.bind(this);

		this.particleCloudEntity.transformComponent.transform.translation.copy(Renderer.mainCamera ? Renderer.mainCamera.translation : new Vector3());

		this.particleCloudEntity.addToWorld();
		//SystemBus.addListener('goo.setCurrentCamera', this.onCameraChange);
	}

	setEmissionVelocity(velocity) {
		if (velocity) {
			this.velocity = velocity;

			// change velocity of all particles in the particle system
			// hack, but necessary for this particular situation
			var particleComponent = this.particleCloudEntity.particleComponent;
			var particles = particleComponent.particles;

			for (var i = 0; i < particles.length; i++) {
				particles[i].velocity.y = -(Math.random() + 1) * this.velocity; //this.velocity;
			}
		}
	};

	setEmissionHeight(height) {
		if (height) {
			this.height = height;
		}
	};

	setReleaseRatePerSecond(releaseRatePerSecond) {
		if (releaseRatePerSecond) {
			var particleComponent = this.particleCloudEntity.particleComponent;
			var emitter = particleComponent.emitters[0];
			emitter.releaseRatePerSecond = releaseRatePerSecond;
		}
	};

	remove() {
		//SystemBus.removeListener('goo.setCurrentCamera', this.onCameraChange);
		this.particleCloudEntity.removeFromWorld();
	};
}

export = Snow;
