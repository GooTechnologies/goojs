define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function FollowEntityAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.sourceEntity = settings.sourceEntity || null;
		this.targetEntity = settings.targetEntity || null;
		this.offset = settings.offset || [0, 0, 0];
	}

	FollowEntityAction.prototype = Object.create(Action.prototype);

	FollowEntityAction.external = [
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

	FollowEntityAction.prototype._run = function(/*fsm*/) {
		if (this.sourceEntity !== null && this.targetEntity !== null) {
			var targetTranslation = this.targetEntity.transformComponent.transform.translation;
			targetTranslation.setv(this.sourceEntity.transformComponent.transform.translation);
			targetTranslation.add_d(this.offset[0], this.offset[1], this.offset[2]);
			this.targetEntity.transformComponent.setUpdated();
		}
	};

	return FollowEntityAction;
});