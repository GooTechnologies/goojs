define([
	'goo/entities/SystemBus',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/TextureCreator',
	'goo/particles/ParticleLib',
	'goo/util/ParticleSystemUtils',
	'goo/renderer/Renderer'
],
	/** @lends */
function (
	SystemBus,
	Material,
	ShaderLib,
	TextureCreator,
	ParticleLib,
	ParticleSystemUtils,
	Renderer
	) {
	'use strict';

	function Snow(gooRunner) {
		// put this in some subroutine
		this.material = Material.createMaterial(ShaderLib.particles);
		var texture = ParticleSystemUtils.createSnowflakeTexture(64);
		texture.generateMipmaps = true;
		this.material.setTexture('DIFFUSE_MAP', texture);
		this.material.blendState.blending = 'AdditiveBlending';
		this.material.cullState.enabled = false;
		this.material.depthState.write = false;
		this.material.renderQueue = 2002;

		// and this too
		this.particleCloudEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner,
			ParticleLib.getSnow({
				getPosition: function(vec3) {
					vec3.copy(Renderer.mainCamera.translation);
					vec3.data[0] += Math.random() * 1000 - 500;
					vec3.data[1] += 15;
					vec3.data[2] += Math.random() * 1000 - 500;
				}
			}),
			this.material
		);
		this.particleCloudEntity.name = '_ParticleSystemSnow';

		this.onCameraChange = function(newCam) {
			newCam.entity.attachChild(this.particleCloudEntity);
		}.bind(this);

		this.particleCloudEntity.transformComponent.transform.translation.copy(Renderer.mainCamera.translation);

		this.particleCloudEntity.addToWorld();
		//SystemBus.addListener('goo.setCurrentCamera', this.onCameraChange);
	};

	Snow.prototype.remove = function() {
		//SystemBus.removeListener('goo.setCurrentCamera', this.onCameraChange);
		this.particleCloudEntity.removeFromWorld();
	};

	return Snow;
});
