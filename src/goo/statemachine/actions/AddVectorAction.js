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
	function AddVectorAction(settings) {
		this.type = 'AddVectorAction';

		settings = settings || {};

		this.entity = settings.entity || null;
		this.vector = settings.vector || [0, 0, 0];
		this.speed = settings.speed || 1;
		this.mode = settings.mode || 0;

		this.external = {
			entity: ['entity', 'Entity'],
			vector: ['vec3', 'Position'],
			speed: ['float', 'Speed'],
			mode: ['list', 'Mode', ['Position', 'Rotation', 'Scale']]
		};
	}

	AddVectorAction.prototype = {
		update: function(fsm, state, tpf) {
			if (this.entity !== null) {
				var x = this.vector[0] * this.speed * tpf;
				var y = this.vector[1] * this.speed * tpf;
				var z = this.vector[2] * this.speed * tpf;

				if (this.mode === 0) {
					this.entity.transformComponent.transform.translation.add_d(x, y, z);
				} else if (this.mode === 1) {
					this.entity.transformComponent.transform.setRotationXYZ(x, y, z);
				} else if (this.mode === 2) {
					this.entity.transformComponent.transform.scale.add_d(x, y, z);
				}
				this.entity.transformComponent.setUpdated();
			}
		}
	};

	Actions.register('AddVectorAction', AddVectorAction);
	return AddVectorAction;
});