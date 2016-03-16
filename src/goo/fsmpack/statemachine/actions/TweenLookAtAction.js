import Action from '../../../fsmpack/statemachine/actions/Action';
import Vector3 from '../../../math/Vector3';
import Quaternion from '../../../math/Quaternion';
import TWEEN from '../../../util/TWEEN';


	function TweenLookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.quatFrom = new Quaternion();
		this.quatTo = new Quaternion();
		this.quatFinal = new Quaternion();
		this.completed = false;
	}

	TweenLookAtAction.prototype = Object.create(Action.prototype);
	TweenLookAtAction.prototype.constructor = TweenLookAtAction;

	TweenLookAtAction.external = {
		key: 'Tween Look At',
		name: 'Tween Look At',
		type: 'animation',
		description: 'Transition the entity\'s rotation to face the set position.',
		canTransition: true,
		parameters: [{
			name: 'Position',
			key: 'to',
			type: 'position',
			description: 'Look at point.',
			'default': [0, 0, 0]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the transition completes.'
		}]
	};

	TweenLookAtAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween LookAt Complete' : undefined;
	};

	TweenLookAtAction.prototype.ready = function () {
		if (this.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[this.easing1][this.easing2];
		}
	};

	TweenLookAtAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		this.startTime = fsm.getTime();

		this.quatFrom.fromRotationMatrix(transform.rotation);

		var dir = Vector3.fromArray(this.to).sub(transform.translation);
		this.rot = transform.rotation.clone();
		this.rot.lookAt(dir, Vector3.UNIT_Y);
		this.quatTo.fromRotationMatrix(this.rot);

		this.completed = false;
	};

	TweenLookAtAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = this.easing(t);
		Quaternion.slerp(this.quatFrom, this.quatTo, fT, this.quatFinal);

		this.quatFinal.toRotationMatrix(transform.rotation);
		entity.transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	export default TweenLookAtAction;