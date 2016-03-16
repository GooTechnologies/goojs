import Action from '../../../fsmpack/statemachine/actions/Action';
import SystemBus from '../../../entities/SystemBus';



	function TriggerLeaveAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.entity = null;
	}

	TriggerLeaveAction.prototype = Object.create(Action.prototype);
	TriggerLeaveAction.prototype.constructor = TriggerLeaveAction;

	TriggerLeaveAction.external = {
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

	TriggerLeaveAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return transitionKey === 'leave' ? 'On Trigger Leave' : undefined;
	};

	TriggerLeaveAction.prototype.enter = function (fsm) {
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

	TriggerLeaveAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerExit', this.listener);
		this.entity = null;
	};

	export default TriggerLeaveAction;