define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/FSMUtil'
],
/** @lends */
function(
	Action,
	FSMUtil
) {
	"use strict";

	function AddPositionAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.entity = settings.entity || null;
		this.position = settings.position || [0, 0, 0];
		this.speed = settings.speed || 1;
	}

	AddPositionAction.prototype = Object.create(Action.prototype);

	AddPositionAction.external = [
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

	AddPositionAction.prototype._run = function(fsm) {
		if (this.entity !== null) {
			var tpf = fsm.getTpf();

			var dx = FSMUtil.getValue(this.position[0], fsm);
			var dy = FSMUtil.getValue(this.position[1], fsm);
			var dz = FSMUtil.getValue(this.position[2], fsm);

			this.entity.transformComponent.transform.translation.add_d(
				dx * this.speed * tpf,
				dy * this.speed * tpf,
				dz * this.speed * tpf
			);

			this.entity.transformComponent.setUpdated();
		}
	};

	return AddPositionAction;
});