define([
	'goo/statemachine/actions/Action',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/TextureCreator',
	'goo/particles/ParticleLib',
	'goo/util/ParticleSystemUtils'
],
/** @lends */
function(
	Action,
	Material,
	ShaderLib,
	TextureCreator,
	ParticleLib,
	ParticleSystemUtils
) {
	"use strict";

	function FireAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	FireAction.material = null;

	FireAction.prototype = Object.create(Action.prototype);
	FireAction.prototype.constructor = FireAction;

	FireAction.external = {
		name: 'Fire',
		description: 'Makes the entity emit smoke',
		parameters: [],
		transitions: []
	};

	FireAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var gooRunner = entity._world.gooRunner;

		if (!SmokeAction.material) {
			SmokeAction.material = Material.createMaterial(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			SmokeAction.material.setTexture('DIFFUSE_MAP', texture);
			SmokeAction.material.blendState.blending = 'AlphaBlending';
			SmokeAction.material.cullState.enabled = false;
			SmokeAction.material.depthState.write = false;
			SmokeAction.material.renderQueue = 2001;
		}

		var particleSystemEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner,
			ParticleLib.getSmoke(),
			SmokeAction.material
		);
		particleSystemEntity.name = '_ParticleSystemSmoke';
		entity.transformComponent.attachChild(particleSystemEntity.transformComponent);

		particleSystemEntity.addToWorld();
	};

	return FireAction;
});