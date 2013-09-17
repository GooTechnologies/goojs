define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function FollowEntityAction(settings) {
		settings = settings || {};

		this.sourceEntity = settings.sourceEntity || null;
		this.targetEntity = settings.targetEntity || null;
		this.offset = settings.offset || [0, 0, 0];

		this.external = [
		{
			name: 'Source Entity',
			key: 'sourceEntity',
			type: 'entity'
		},
		{
			name: 'Target Entity',
			key: 'targetEntity',
			type: 'entity'
		},
		{
			name:'Offset',
			key:'offset',
			type:'vec3'
		}];
	}

	FollowEntityAction.prototype.onUpdate = function(/*fsm*/) {
		if (this.sourceEntity !== null && this.targetEntity !== null) {
			var targetTranslation = this.targetEntity.transformComponent.transform.translation;
			targetTranslation.setv(this.sourceEntity.transformComponent.transform.translation);
			targetTranslation.add_d(this.offset[0], this.offset[1], this.offset[2]);
			this.targetEntity.transformComponent.setUpdated();
		}
	};

	return FollowEntityAction;
});