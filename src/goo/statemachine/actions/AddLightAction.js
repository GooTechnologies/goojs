define([
	'goo/statemachine/actions/Action',
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
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'color',
			description: 'Color of the light',
			'default': [1, 1, 1]
		}],
		transitions: []
	};

	AddLightAction.prototype._run = function(fsm) {
		var light = new PointLight();
		console.log('AddLightAction color', this.color);

		var tmp = this.color.split(',');
		light.color.setd(+tmp[0], +tmp[1], +tmp[2]);

		var entity = fsm.getOwnerEntity();
		entity.setComponent(new LightComponent(light));
	};

	return AddLightAction;
});