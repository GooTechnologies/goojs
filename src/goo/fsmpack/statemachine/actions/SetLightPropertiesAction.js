define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
	'use strict';

	function SetLightPropertiesAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetLightPropertiesAction.prototype = Object.create(Action.prototype);

	SetLightPropertiesAction.external = {
		name: 'Set Light Properties',
		description: 'Sets various properties of a light.',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has a light'
		}, {
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Light color',
			'default': [1, 1, 1]
		}, {
			name: 'Intensity',
			key: 'intensity',
			type: 'number',
			description: 'Light intensity',
			'default': 1
		}, {
			name: 'Specular Intensity',
			key: 'specularIntensity',
			type: 'number',
			description: 'Specular light intensity',
			'default': 1
		}, {
			name: 'Range',
			key: 'range',
			type: 'number',
			description: 'Light range (for point/spot lights)',
			'default': 1
		}],
		transitions: []
	};

	SetLightPropertiesAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity &&
			entity.lightComponent &&
			entity.lightComponent.light) {
			entity.lightComponent.light.color.setDirect(this.color[0], this.color[1], this.color[2]);
			entity.lightComponent.light.intensity = this.intensity;
			entity.lightComponent.light.specularIntensity = this.specularIntensity;
			entity.lightComponent.light.range = this.range;
		}
	};

	return SetLightPropertiesAction;
});