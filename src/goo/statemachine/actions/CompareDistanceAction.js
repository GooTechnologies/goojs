define([
	'goo/statemachine/actions/Action',
	'goo/math/Vector3'
],
/** @lends */
function(
	Action,
	Vector3
) {
	"use strict";

	function CompareDistanceAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CompareDistanceAction.prototype = Object.create(Action.prototype);
	CompareDistanceAction.prototype.constructor = CompareDistanceAction;

	CompareDistanceAction.external = {
		name: 'Compare Distance',
		description: 'Compares the distances transitions based on the result of that',
		canTransition: true,
		parameters: [{
			name: 'Entity1',
			key: 'entity1',
			type: 'entity',
			description: 'Entity to measure the distance to',
			'default': null
		}, {
			name: 'Value',
			key: 'value',
			type: 'number',
			description: 'Value to compare to',
			'default': 0
		}, {
			name: 'Entity2',
			key: 'observedEntity',
			type: 'entity',
			description: 'Second entity to compare distances',
			'default': null
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'float',
			'default': 0.001
		}, {
			name: 'Euclidean',
			key: 'euclidean',
			type: 'number',
			description: 'True if euclidean, false for manhattan',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: [{
			name: 'less',
			description: 'Event fired if left hand argument is smaller than right hand argument'
		}, {
			name: 'equal',
			description: 'Event fired if both sides are approximately equal'
		}, {
			name: 'greater',
			description: 'Event fired if left hand argument is greater than right hand argument'
		}]
	};

	CompareDistanceAction.prototype._run = function(fsm) {
		if (this.entity1) {
			var entity = fsm.getOwnerEntity();
			var diff;
			var translation0 = entity.transformComponent.worldTransform.translation;
			var translation1 = this.entity1.transfomComponent.worldTransform.translation;
			var tmpVec3 = Vector3.sub(translation0, translation1);
			var dist01 = this.euclidean ? tmpVec3.length() : (Math.abs(tmpVec3.x) + Math.abs(tmpVec3.y) + Math.abs(tmpVec3.z));
			if (this.entity2) {
				var translation2 = this.entity2.transformComponent.worldTransform.translation;
				Vector3.sub(translation0, translation2, tmpVec3);
				var dist02 = this.euclidean ? tmpVec3.length() : (Math.abs(tmpVec3.x) + Math.abs(tmpVec3.y) + Math.abs(tmpVec3.z));
				diff = dist01 - dist02;
			} else {
				diff = this.value - dist01;
			}

			if (Math.abs(diff) <= this.tolerance) {
				if (this.equalEvent.channel) { fsm.send(this.equalEvent); }
			} else if (diff > 0) {
				if (this.lessThanEvent.channel) { fsm.send(this.lessThanEvent); }
			} else {
				if (this.greaterThanEvent.channel) { fsm.send(this.greaterThanEvent); }
			}
		}
	};

	return CompareDistanceAction;
});