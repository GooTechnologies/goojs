var Action = require('./Action');

function SetLightPropertiesAction() {
	Action.apply(this, arguments);
}

SetLightPropertiesAction.prototype = Object.create(Action.prototype);
SetLightPropertiesAction.prototype.constructor = SetLightPropertiesAction;

SetLightPropertiesAction.external = {
	key: 'Set Light Properties',
	name: 'Set Light Properties',
	description: 'Sets various properties of a light.',
	parameters: [{
		name: 'Entity (optional)',
		key: 'entity',
		type: 'entity',
		description: 'Entity that has a light.'
	}, {
		name: 'Color',
		key: 'color',
		type: 'vec3',
		control: 'color',
		description: 'Light color.',
		'default': [1, 1, 1]
	}, {
		name: 'Intensity',
		key: 'intensity',
		type: 'float',
		description: 'Light intensity.',
		'default': 1
	}, {
		name: 'Specular Intensity',
		key: 'specularIntensity',
		type: 'float',
		description: 'Specular light intensity.',
		'default': 1
	}, {
		name: 'Range',
		key: 'range',
		type: 'float',
		description: 'Light range (for point/spot lights).',
		'default': 100
	}],
	transitions: []
};

SetLightPropertiesAction.prototype.enter = function () {
	var entity;
	if (this.entity) {
		entity = this.entity._world.entityManager.getEntityById(this.entity.entityRef);
	} else {
		entity = this.getEntity();
	}

	if (entity && entity.lightComponent && entity.lightComponent.light) {
		var light = entity.lightComponent.light;
		light.color.setArray(this.color);
		light.intensity = this.intensity;
		light.specularIntensity = this.specularIntensity;
		light.range = this.range;
	}
};

module.exports = SetLightPropertiesAction;