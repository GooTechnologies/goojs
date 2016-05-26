var Action = require('./Action');

function SetTextureAction(/*id, settings*/) {
	Action.apply(this, arguments);
}

SetTextureAction.prototype = Object.create(Action.prototype);
SetTextureAction.prototype.constructor = SetTextureAction;

SetTextureAction.external = {
	key: 'Set Texture',
	name: 'Set Texture',
	type: 'texture',
	description: 'Sets the texture of a material.',
	parameters: [{
		name: 'Entity (optional)',
		key: 'entity',
		type: 'entity',
		description: 'Entity to apply texture on.'
	}, {
		name: 'Texture slot',
		key: 'type',
		type: 'string',
		control: 'dropdown',
		description: 'Texture slot.',
		'default': 'Diffuse',
		options: ['Diffuse', 'Normal', 'Emissive', 'Specular', 'Ambient', 'Reflection']
	}, {
		name: 'Texture',
		key: 'texture',
		type: 'texture',
		description: 'Texture to apply.'
	}],
	transitions: []
};

var MAPPING = {
	Diffuse: 'DIFFUSE_MAP',
	Normal: 'NORMAL_MAP',
	Emissive: 'EMISSIVE_MAP',
	Specular: 'SPECULAR_MAP',
	Ambient: 'AO_MAP',
	Reflection: 'LOCAL_ENVIRONMENT'
};

SetTextureAction.prototype.enter = function (fsm) {
	var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
	if (entity && entity.meshRendererComponent) {
		var material = entity.meshRendererComponent.materials[0];
		var typeName = MAPPING[this.type];
		material.setTexture(typeName, this.texture);
	}
};

module.exports = SetTextureAction;