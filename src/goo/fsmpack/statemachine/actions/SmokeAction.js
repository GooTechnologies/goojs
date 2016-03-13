var Action = require('../../../fsmpack/statemachine/actions/Action');
var Material = require('../../../renderer/Material');
var ShaderLib = require('../../../renderer/shaders/ShaderLib');
var TextureCreator = require('../../../renderer/TextureCreator');
var ParticleLib = require('../../../particles/ParticleLib');
var ParticleSystemUtils = require('../../../util/ParticleSystemUtils');



	function SmokeAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.smokeEntity = null;
	}

	SmokeAction.material = null;

	SmokeAction.prototype = Object.create(Action.prototype);
	SmokeAction.prototype.constructor = SmokeAction;

	SmokeAction.external = {
		key: 'Smoke',
		name: 'Smoke FX',
		type: 'fx',
		description: 'Makes the entity emit smoke. To cancel the smoke emitter use the "Remove Particles" action.',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Smoke color.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	SmokeAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (this.smokeEntity && entity.transformComponent.children.indexOf(this.smokeEntity.transformComponent) !== -1) {
			return;
		}

		var gooRunner = entity._world.gooRunner;

		if (!SmokeAction.material) {
			SmokeAction.material = new Material(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			SmokeAction.material.setTexture('DIFFUSE_MAP', texture);
			SmokeAction.material.blendState.blending = 'TransparencyBlending';
			SmokeAction.material.cullState.enabled = false;
			SmokeAction.material.depthState.write = false;
			SmokeAction.material.renderQueue = 2001;
		}

		var entityScale = entity.transformComponent.worldTransform.scale;
		var scale = (entityScale.x + entityScale.y + entityScale.z) / 3;
		this.smokeEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getSmoke({
				scale: scale,
				color: this.color
			}),
			SmokeAction.material
		);
		this.smokeEntity.meshRendererComponent.isPickable = false;
		this.smokeEntity.meshRendererComponent.castShadows = false;
		this.smokeEntity.meshRendererComponent.receiveShadows = false;
		this.smokeEntity.name = '_ParticleSystemSmoke';
		entity.transformComponent.attachChild(this.smokeEntity.transformComponent);

		this.smokeEntity.addToWorld();
	};

	SmokeAction.prototype.cleanup = function (/*fsm*/) {
		if (this.smokeEntity) {
			this.smokeEntity.removeFromWorld();
			this.smokeEntity = null;
		}
	};

	module.exports = SmokeAction;