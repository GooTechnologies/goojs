define([
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function AddPositionAction(settings) {
		this.type = 'AddPositionAction';
		
		settings = settings || {};

		this.entity = settings.entity || null;
		this.position = settings.position || [0, 0, 0];
		this.speed = settings.speed || 1;

		this.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name: 'Position',
			key: 'position',
			type: 'vec3'
		},
		{
			name: 'Speed',
			key: 'speed',
			type: 'float',
			control: 'slider',
			max: 10,
			min: 0
		}];
	}

	AddPositionAction.prototype = {
		update: function(fsm, state, tpf) {
			if (this.entity !== null) {
				this.entity.transformComponent.transform.translation.add_d(this.position[0] * this.speed * tpf, this.position[1] * this.speed * tpf, this.position[2] * this.speed * tpf);
				this.entity.transformComponent.setUpdated();
			}
		}
	};

	Actions.register('AddPositionAction', AddPositionAction);
	return AddPositionAction;
});