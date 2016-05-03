var Action = require('./Action');

function PauseTimelineAction() {
	Action.apply(this, arguments);
}

PauseTimelineAction.prototype = Object.create(Action.prototype);
PauseTimelineAction.prototype.constructor = PauseTimelineAction;

PauseTimelineAction.external = {
	key: 'Pause Timeline',
	name: 'Pause Timeline',
	type: 'timeline',
	description: 'Pauses the timeline.',
	canTransition: true,
	parameters: [],
	transitions: []
};

PauseTimelineAction.prototype.enter = function () {
	var entity = this.getEntity();

	if (!entity.hasComponent('TimelineComponent')) { return; }

	entity.timelineComponent.pause();
};

module.exports = PauseTimelineAction;