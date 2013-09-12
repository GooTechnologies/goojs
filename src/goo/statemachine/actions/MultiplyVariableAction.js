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
	function MultiplyVariableAction(settings) {
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
			min: 0,
			max: 10
		}];
	}

	MultiplyVariableAction.prototype = {
		onEnter: function(/*fsm*/) {

		},
		onUpdate: function(fsm) {
			if (this.entity !== null) {
				var tpf = fsm.getTpf();

				var dx = (typeof this.position[0] === 'number') ? this.position[0] : fsm.getVariable(this.position[0]);
				var dy = (typeof this.position[1] === 'number') ? this.position[1] : fsm.getVariable(this.position[1]);
				var dz = (typeof this.position[2] === 'number') ? this.position[2] : fsm.getVariable(this.position[2]);
			}
		},
		onExit: function(/*fsm*/) {

		}
	};

	Actions.register('MultiplyVariableAction', MultiplyVariableAction);

	return AddPositionAction;
});