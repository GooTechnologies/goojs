define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function PauseTimelineAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseTimelineAction.prototype = Object.create(Action.prototype);
	PauseTimelineAction.prototype.constructor = PauseTimelineAction;

	PauseTimelineAction.external = {
		name: 'Pause Timeline',
		type: 'fx',
		description: 'Pauses the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	PauseTimelineAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.pause();
	};

	return PauseTimelineAction;
});