define([
	'goo/statemachine/actions/Action',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/TextureCreator',
	'goo/particles/ParticleLib',
	'goo/util/ParticleSystemUtils',
	'goo/entities/EntityUtils'
],
/** @lends */
function(
	Action,
	Material,
	ShaderLib,
	TextureCreator,
	ParticleLib,
	ParticleSystemUtils,
	EntityUtils
) {
	"use strict";

	function SmokeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SmokeAction.material = null;

	SmokeAction.prototype = Object.create(Action.prototype);
	SmokeAction.prototype.constructor = SmokeAction;

	SmokeAction.external = {
		name: 'Smoke',
		description: 'Makes the entity emit smoke. To cancel the smoke emitter use the "Remove Particles" action',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'color',
			description: 'Smoke color',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	SmokeAction.prototype._run = function(fsm) {
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

		var entityScale = entity.transformComponent.worldTransform.scale;
		var scale = (entityScale.data[0] + entityScale.data[1] + entityScale.data[2]) / 3;
		var particleSystemEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner,
			ParticleLib.getSmoke({
				scale: scale,
				color: this.color
			}),
			SmokeAction.material
		);
		particleSystemEntity.name = '_ParticleSystemSmoke';
		entity.transformComponent.attachChild(particleSystemEntity.transformComponent);

		particleSystemEntity.addToWorld();
	};

	SmokeAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var children = EntityUtils.getChildren(entity);
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
				child.removeFromWorld();
			}
		}
	};

	return SmokeAction;
});