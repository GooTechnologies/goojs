import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var SystemBus = require('../../../entities/SystemBus');

class TriggerEnterAction extends Action {
	entity: any;
	listener: (triggerEnterEvent: any) => void;
	constructor(id: string, options: any){
		super(id, options);
		this.entity = null;
	}

	static external: External = {
		key: 'TriggerEnter',
		name: 'TriggerEnter',
		type: 'collision',
		description: 'Transitions when the trigger collider is entered. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'enter',
			description: 'State to transition to when enter occurs.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'enter' ? 'On Trigger Enter' : undefined;
	};

	enter (fsm) {
		this.entity = fsm.getOwnerEntity();
		var that = this;
		this.listener = function (triggerEnterEvent) {
			if (that.entity && triggerEnterEvent.entityA === that.entity || triggerEnterEvent.entityB === that.entity) {
				that.entity = null;
				// TODO: should this happen on postStep instead? Maybe the user will remove the entity here...
				fsm.send(that.transitions.enter);
			}
		};
		SystemBus.addListener('goo.physics.triggerEnter', this.listener);
	};

	exit (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerEnter', this.listener);
		this.entity = null;
	};
}

export = TriggerEnterAction;