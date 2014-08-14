define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/proximity/ProximityComponent'
],
/** @lends */
function(
	Action,
	ProximityComponent
) {
	'use strict';

	function TagAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TagAction.prototype = Object.create(Action.prototype);
	TagAction.prototype.constructor = TagAction;

	TagAction.external = {
		name: 'Tag',
		type: 'collision',
		description: 'Sets a tag on the entity. Use tags to be able to capture collision events with the \'Collides\' action',
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'string',
			control: 'dropdown',
			description: 'Checks for collisions with other objects having this tag',
			'default': 'red',
			options: ['red', 'blue', 'green', 'yellow']
		}],
		transitions: []
	};

	TagAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.proximityComponent) {
			if (entity.proximityComponent.tag !== this.tag) {
				entity.clearComponent('ProximityComponent');
				entity.setComponent(new ProximityComponent(this.tag));
			}
		} else {
			entity.setComponent(new ProximityComponent(this.tag));
		}
	};

	TagAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.clearComponent('ProximityComponent');
	};

	return TagAction;
});