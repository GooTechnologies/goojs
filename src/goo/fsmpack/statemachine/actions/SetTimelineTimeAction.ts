import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class SetTimelineTimeAction extends Action {
	time: number;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
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

	enter (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.setTime(this.time);
	};
}

export = SetTimelineTimeAction;