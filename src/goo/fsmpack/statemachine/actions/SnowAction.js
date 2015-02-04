define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/TextureCreator',
	'goo/particles/ParticleLib',
	'goo/util/ParticleSystemUtils'
], function (
	Action,
	Material,
	ShaderLib,
	TextureCreator,
	ParticleLib,
	ParticleSystemUtils
) {
	'use strict';

	function SnowAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SnowAction.material = null;

	SnowAction.prototype = Object.create(Action.prototype);
	SnowAction.prototype.constructor = SnowAction;

	SnowAction.external = {
		name: 'Snow',
		description: 'Makes the entity emit snow',
		parameters: [],
		transitions: []
	};

	SnowAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var gooRunner = entity._world.gooRunner;

		if (!SnowAction.material) {
			SnowAction.material = new Material(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			SnowAction.material.setTexture('DIFFUSE_MAP', texture);
			SnowAction.material.blendState.blending = 'AlphaBlending';
			SnowAction.material.cullState.enabled = false;
			SnowAction.material.depthState.write = false;
			SnowAction.material.renderQueue = 2001;
		}

		var particleSystemEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getSmoke(), // change to snow
			SnowAction.material
		);
		particleSystemEntity.name = '_ParticleSystemSnow';
		entity.transformComponent.attachChild(particleSystemEntity.transformComponent);

		particleSystemEntity.addToWorld();
	};

	return SnowAction;
});