import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Material = require('../../../renderer/Material');
var ShaderLib = require('../../../renderer/shaders/ShaderLib');
var ParticleLib = require('../../../particles/ParticleLib');
var ParticleSystemUtils = require('../../../util/ParticleSystemUtils');

class SmokeAction extends Action {
	color: Array<number>;
	smokeEntity: any;
	constructor(id: string, options: any){
		super(id, options);
		this.smokeEntity = null;
	}

	static material: any;

	static external: External = {
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

	enter (fsm) {
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

		var entityScale = entity.transformComponent.sync().worldTransform.scale;
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

	cleanup (/*fsm*/) {
		if (this.smokeEntity) {
			this.smokeEntity.removeFromWorld();
			this.smokeEntity = null;
		}
	};
}

export = SmokeAction;