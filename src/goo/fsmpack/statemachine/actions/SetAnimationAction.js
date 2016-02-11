define(['goo/fsmpack/statemachine/actions/Action'], function (
	Action
	) {
	'use strict';

	function SetAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.everyFrame = true;
		this._transitioned = false;
		this._loopAtStart = 0;
	}

	SetAnimationAction.prototype = Object.create(Action.prototype);
	SetAnimationAction.prototype.constructor = SetAnimationAction;

	SetAnimationAction.external = {
		name: 'Set Animation',
		type: 'animation',
		description: 'Transitions to a selected animation',
		parameters: [{
			name: 'Animation',
			key: 'animation',
			type: 'animation'
		}],
		transitions: [{
			key: 'complete',
			name: 'On completion',
			description: 'State to transition to when the target animation completes. If the animation loops forever, the transition will be done when the next loop starts.'
		}]
	};

	SetAnimationAction.prototype._run = function (fsm) {
		// If we already made the transition, bail
		if(this._transitioned) {
			return;
		}

		var entity = fsm.getOwnerEntity();
		var that = this;

		if (this.animation && entity.animationComponent) {
			var currentState;
			if(this._loopAtStart === null){
				// Set the animation
				entity.animationComponent.transitionTo(this.animation, true);

				// Get the current loop number
				currentState = entity.animationComponent.getCurrentState();
				if(currentState){
					this._loopAtStart = currentState.getCurrentLoop();
				}
			}

			// Transition if the loop number changed
			currentState = entity.animationComponent.getCurrentState();
			if(!currentState || currentState.getCurrentLoop() !== this._loopAtStart){
				fsm.send(that.transitions.complete);
				this._transitioned = true;
			}
		}
	};

	return SetAnimationAction;
});