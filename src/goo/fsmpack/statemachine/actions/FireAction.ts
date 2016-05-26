import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Material = require('../../../renderer/Material');
var ShaderLib = require('../../../renderer/shaders/ShaderLib');
var ParticleLib = require('../../../particles/ParticleLib');
var ParticleSystemUtils = require('../../../util/ParticleSystemUtils');

class FireAction extends Action {
	fireEntity: any;
	startColor: Array<number>;
	endColor: Array<number>;
	constructor(id: string, options: any){
		super(id, options);
		this.fireEntity = null;
	}

	static material: any;

	static external: External = {
		key: 'Fire',
		name: 'Fire FX',
		type: 'fx',
		description: 'Makes the entity emit fire. To "extinguish" the fire use the "Remove Particles" action.',
		parameters: [{
			name: 'Start Color',
			key: 'startColor',
			type: 'vec3',
			control: 'color',
			description: 'Flame color at source.',
			'default': [1, 1, 0]
		}, {
			name: 'End color',
			key: 'endColor',
			type: 'vec3',
			control: 'color',
			description: 'Color near the end of a flame\'s life.',
			'default': [1, 0, 0]
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (this.fireEntity && entity.transformComponent.children.indexOf(this.fireEntity.transformComponent) !== -1) {
			return;
		}

		var gooRunner = entity._world.gooRunner;

		if (!FireAction.material) {
			FireAction.material = new Material(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			FireAction.material.setTexture('DIFFUSE_MAP', texture);
			FireAction.material.blendState.blending = 'AdditiveBlending';
			FireAction.material.cullState.enabled = false;
			FireAction.material.depthState.write = false;
			FireAction.material.renderQueue = 2002;
		}

		var entityScale = entity.transformComponent.sync().worldTransform.scale;
		var scale = (entityScale.x + entityScale.y + entityScale.z) / 3;
		this.fireEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getFire({
				scale: scale,
				startColor: this.startColor,
				endColor: this.endColor
			}),
			FireAction.material
		);
		this.fireEntity.meshRendererComponent.isPickable = false;
		this.fireEntity.meshRendererComponent.castShadows = false;
		this.fireEntity.meshRendererComponent.receiveShadows = false;
		this.fireEntity.name = '_ParticleSystemFire';
		entity.transformComponent.attachChild(this.fireEntity.transformComponent);

		this.fireEntity.addToWorld();
	};

	cleanup (fsm) {
		if (this.fireEntity) {
			this.fireEntity.removeFromWorld();
			this.fireEntity = null;
		}
	};
}

export = FireAction;