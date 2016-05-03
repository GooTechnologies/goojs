var Action = require('./Action');

function SetTimelineTimeAction() {
	Action.apply(this, arguments);
}

SetTimelineTimeAction.prototype = Object.create(Action.prototype);
SetTimelineTimeAction.prototype.constructor = SetTimelineTimeAction;

SetTimelineTimeAction.external = {
	key: 'Set Timeline Time',
	name: 'Set Timeline Time',
	type: 'timeline',
	description: 'Sets the current time of the timeline.',
	canTransition: true,
	parameters: [{
		name: 'Time',
		key: 'time',
		type: 'float',
		description: 'Timeline time to set.',
		'default': 0
	}],
	transitions: []
};

SetTimelineTimeAction.prototype.enter = function () {
	var entity = this.getEntity();

	if (!entity.hasComponent('TimelineComponent')) { return; }

	entity.timelineComponent.setTime(this.time);
};

module.exports = SetTimelineTimeAction;