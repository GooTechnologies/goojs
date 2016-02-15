define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function SetTimelineTimeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetTimelineTimeAction.prototype = Object.create(Action.prototype);
	SetTimelineTimeAction.prototype.constructor = SetTimelineTimeAction;

	SetTimelineTimeAction.external = {
		name: 'Set Timeline Time',
		type: 'timeline',
		description: 'Sets the current time of the timeline.',
		canTransition: true,
		parameters: [{
			name: 'Time',
			key: 'time',
			type: 'number',
			description: 'Timeline time to set',
			'default': 0
		}],
		transitions: []
	};

	SetTimelineTimeAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.setTime(this.time);
	};

	return SetTimelineTimeAction;
});