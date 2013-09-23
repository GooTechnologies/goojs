define([
	'goo/statemachine/actions/Action'
],
	/** @lends */
function(
	Action
) {
	"use strict";

	function GetPositionAction(settings) {
		Action.apply(this, arguments);
	}

	GetPositionAction.prototype = Object.create(Action.prototype);

	GetPositionAction.prototype.configure = function(settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.entity = settings.entity || null;
		this.variable = settings.variable || null;
	};

	GetPositionAction.external = {
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: []
	};

	GetPositionAction.prototype._run = function(fsm) {
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