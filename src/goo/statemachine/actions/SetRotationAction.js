define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function SetRotationAction(settings) {
		settings = settings || {};

		this.entity = settings.entity || null;
		this.rotation = settings.rotation || [0, 0, 0];

		this.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name:'Rotation',
			key:'rotation',
			type:'vec3'
		}];
	}

	SetRotationAction.prototype = {
		onCreate: function(/*fsm*/) {
			if (this.entity !== null) {
				this.entity.transformComponent.transform.setRotationXYZ(this.rotation[0], this.rotation[1], this.rotation[2]);
				this.entity.transformComponent.setUpdated();
			}
		}
	};

	return SetRotationAction;
});