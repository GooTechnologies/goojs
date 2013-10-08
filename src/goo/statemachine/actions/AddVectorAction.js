define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function AddVectorAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.entity = settings.entity || null;
		this.vector = settings.vector || [0, 0, 0];
		this.speed = settings.speed || 1;
		this.mode = settings.mode || 0;
	}

	AddVectorAction.prototype = Object.create(Action.prototype);

	AddVectorAction.external = {
		entity: ['entity', 'Entity'],
		vector: ['vec3', 'Position'],
		speed: ['float', 'Speed'],
		mode: ['list', 'Mode', ['Position', 'Rotation', 'Scale']]
	};

	AddVectorAction.prototype._run = function(fsm) {
		if (this.entity !== null) {
			var x = this.vector[0] * this.speed * fsm.getTpf();
			var y = this.vector[1] * this.speed * fsm.getTpf();
			var z = this.vector[2] * this.speed * fsm.getTpf();

			if (this.mode === 0) {
				this.entity.transform.translation.add_d(x, y, z);
			} else if (this.mode === 1) {
				this.entity.transform.setRotationXYZ(x, y, z);
			} else if (this.mode === 2) {
				this.entity.transform.scale.add_d(x, y, z);
			}
			this.entity.transformComponent.setUpdated();
		}
	};

	return AddVectorAction;
});