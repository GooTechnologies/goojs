define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight'
],
/** @lends */
function(
	Action,
	LightComponent,
	PointLight
) {
	"use strict";

	function AddLightAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddLightAction.prototype = Object.create(Action.prototype);
	AddLightAction.prototype.constructor = AddLightAction;

	AddLightAction.external = {
		name: 'Add Light',
		description: 'Adds a point light to the entity',
		type: 'light',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'color',
			description: 'Color of the light',
			'default': [1, 1, 1]
		}, {
			name: 'Range',
			key: 'range',
			type: 'int',
			control: 'slider',
			min: 0,
			max: 5000,
			description: 'Range of the light',
			'default': 200
		}],
		transitions: []
	};

	AddLightAction.prototype._run = function (fsm) {
		var light = new PointLight();
		light.range = +this.range;
		light.color.setd(this.color[0], this.color[1], this.color[2]);

		var entity = fsm.getOwnerEntity();
		entity.setComponent(new LightComponent(light));
	};

	AddLightAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('LightComponent')) {
			entity.clearComponent('LightComponent');
		}
	};

	return AddLightAction;
});