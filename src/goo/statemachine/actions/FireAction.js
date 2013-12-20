define([
	'goo/statemachine/actions/Action',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/particles/ParticleLib',
	'goo/util/ParticleSystemUtils',
	'goo/entities/EntityUtils'
],
/** @lends */
function(
	Action,
	Material,
	ShaderLib,
	ParticleLib,
	ParticleSystemUtils,
	EntityUtils
) {
	'use strict';

	function FireAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	FireAction.material = null;

	FireAction.prototype = Object.create(Action.prototype);
	FireAction.prototype.constructor = FireAction;

	FireAction.external = {
		name: 'Fire',
		description: 'Makes the entity emit fire. To "extinguish" the fire use the "Remove Particles" action',
		parameters: [{
			name: 'Start Color',
			key: 'startColor',
			type: 'color',
			description: 'Flame color at source',
			'default': [1, 1, 0]
		}, {
			name: 'End color',
			key: 'endColor',
			type: 'color',
			description: 'Color near the end of a flame\'s life',
			'default': [1, 0, 0]
		}],
		transitions: []
	};

	FireAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var gooRunner = entity._world.gooRunner;

		if (!FireAction.material) {
			FireAction.material = Material.createMaterial(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			FireAction.material.setTexture('DIFFUSE_MAP', texture);
			FireAction.material.blendState.blending = 'AdditiveBlending';
			FireAction.material.cullState.enabled = false;
			FireAction.material.depthState.write = false;
			FireAction.material.renderQueue = 2002;
		}

		var entityScale = entity.transformComponent.worldTransform.scale;
		var scale = (entityScale.data[0] + entityScale.data[1] + entityScale.data[2]) / 3;
		var particleSystemEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner,
			ParticleLib.getFire({
				scale: scale,
				startColor: this.startColor,
				endColor: this.endColor
			}),
			FireAction.material
		);
		particleSystemEntity.name = '_ParticleSystemFire';
		entity.transformComponent.attachChild(particleSystemEntity.transformComponent);

		particleSystemEntity.addToWorld();
	};

	FireAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var children = EntityUtils.getChildren(entity);
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
				child.removeFromWorld();
			}
		}
	};

	return FireAction;
});