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
		//light.color.setd(1, 0, 0);
		//console.log(this.color[0], this.color[1], this.color[2]); //phony stuff
		//this.color[0], this.color[1], this.color[2]);

		var entity = fsm.getOwnerEntity();
		entity.setComponent(new LightComponent(light));
	};

	return AddLightAction;
});