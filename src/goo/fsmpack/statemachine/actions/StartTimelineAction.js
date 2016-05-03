var Action = require('./Action');

function StartTimelineAction() {
	Action.apply(this, arguments);
}

StartTimelineAction.prototype = Object.create(Action.prototype);
StartTimelineAction.prototype.constructor = StartTimelineAction;

StartTimelineAction.external = {
	key: 'Start Timeline',
	name: 'Start Timeline',
	type: 'timeline',
	description: 'Starts or resumes the timeline.',
	canTransition: true,
	parameters: [],
	transitions: []
};

StartTimelineAction.prototype.enter = function () {
	var entity = this.getEntity();

	if (!entity.hasComponent('TimelineComponent')) { return; }

	entity.timelineComponent.start();
};

module.exports = StartTimelineAction;