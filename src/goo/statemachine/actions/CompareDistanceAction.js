define([
	'goo/statemachine/actions/Action',
	'goo/math/Vector3',
	'goo/renderer/Renderer'
],
/** @lends */
function(
	Action,
	Vector3,
	Renderer
) {
	"use strict";

	function CompareDistanceAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CompareDistanceAction.prototype = Object.create(Action.prototype);
	CompareDistanceAction.prototype.constructor = CompareDistanceAction;

	CompareDistanceAction.external = {
		name: 'Compare Distance',
		description: 'Performs a transition based on the distance to the main camera or to a location',
		canTransition: true,
		parameters: [{
			name: 'Current camera',
			key: 'camera',
			type: 'boolean',
			description: 'Measure the diatnce from the current camera or from an arbitrary point',
			'default': true
		}, {
			name: 'Position',
			key: 'position',
			type: 'position',
			description: 'Position to measure the distance to; Will be ignored if previous option is selected',
			'default': [0, 0, 0]
		}, {
			name: 'Value',
			key: 'value',
			type: 'number',
			description: 'Value to compare to',
			'default': 0
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'number',
			'default': 0.1
		}, {
			name: 'Type',
			key: 'distanceType',
			type: 'dropdown',
			description: 'The type of distance',
			'default': 'Euclidean',
			options: ['Euclidean', 'Manhattan']
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'less',
			name: 'Less',
			description: 'Event fired if left hand argument is smaller than right hand argument'
		}, {
			key: 'equal',
			name: 'Equal',
			description: 'Event fired if both sides are approximately equal'
		}, {
			key: 'greater',
			name: 'Greater',
			description: 'Event fired if left hand argument is greater than right hand argument'
		}]
	};

	CompareDistanceAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var translation = entity.transformComponent.worldTransform.translation;
		var delta;

		if (this.camera) {
			delta = Vector3.sub(translation, Renderer.mainCamera.translation);
		} else {
			delta = Vector3.sub(translation, new Vector3(this.position));
		}

		var distance;
		if (this.type === 'Euclidean') {
			distance = delta.length();
		} else {
			distance = Math.abs(delta.x) + Math.abs(delta.y) + Math.abs(delta.z);
		}
		var diff = this.value - distance;

		if (Math.abs(diff) <= this.tolerance) {
			fsm.send(this.transitions.equal);
		} else if (diff > 0) {
			fsm.send(this.transitions.less);
		} else {
			fsm.send(this.transitions.greater);
		}
	};

	return CompareDistanceAction;
});