import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var SystemBus = require('../../../entities/SystemBus');

class TriggerLeaveAction extends Action {
	entity: any;
	listener: (any) => void;
	constructor(id: string, options: any){
		super(id, options);
		this.entity = null;
	}

	static external: External = {
		key: 'TriggerLeave',
		name: 'TriggerLeave',
		type: 'collision',
		description: 'Transitions when a collider is leaving the entity trigger collider. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'leave',
			description: 'State to transition to when leave occurs.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'leave' ? 'On Trigger Leave' : undefined;
	};

	enter (fsm) {
		this.entity = fsm.getOwnerEntity();
		var that = this;
		this.listener = function (endContactEvent) {
			if (that.entity && endContactEvent.entityA === that.entity || endContactEvent.entityB === that.entity) {
				that.entity = null;
				// TODO: should this happen on postStep instead? Maybe the user will remove the entity here...
				fsm.send(that.transitions.leave);
			}
		};
		SystemBus.addListener('goo.physics.triggerExit', this.listener);
	};

	exit (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerExit', this.listener);
		this.entity = null;
	};
}

export = TriggerLeaveAction;