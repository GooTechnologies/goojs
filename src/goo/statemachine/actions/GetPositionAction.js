define([
	'goo/statemachine/actions/Action'
],
	/** @lends */
function(
	Action
) {
	"use strict";

	function GetPositionAction(settings) {
		settings = settings || {};
		this.everyFrame = true;

		this.entity = settings.entity || null;
		this.position = settings.position || [];
	}

	GetPositionAction.prototype = Object.create(Action.prototype);

	GetPositionAction.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name: 'Position',
			key: 'position',
			type: 'vec3'
		}];

	GetPositionAction.prototype._run = function(fsm) {
		//console.log('');
		var translation = this.entity.transformComponent.transform.translation;
		if (this.entity !== null) {
			if (this.position[0]) {  // !== undefined
				fsm.applyOnVariable(this.position[0], function() {
					return translation.data[0];
				});
			}
			if (this.position[1]) {
				fsm.applyOnVariable(this.position[1], function() {
					return translation.data[1];
				});
			}
			if (this.position[2]) {
				fsm.applyOnVariable(this.position[2], function() {
					return translation.data[2];
				});
			}
		}
	};

	return GetPositionAction;
});