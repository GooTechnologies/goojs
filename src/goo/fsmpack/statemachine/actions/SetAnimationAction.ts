import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	complete: 'On animation complete'
};

class SetAnimationAction extends Action {
	animation: any;
	loops: number;
	_transitioned: boolean;
	_loopAtStart: any;
	_previousLoop: number;
	constructor(id: string, options: any){
		super(id, options);
		this._transitioned = false;
		this._loopAtStart = null;
		this._previousLoop = 0;
	}


	static external: External = {
		key: 'Set Animation',
		name: 'Set Animation',
		type: 'animation',
		description: 'Transitions to a selected animation.',
		parameters: [{
			name: 'Animation',
			key: 'animation',
			description: 'Which animation to transition to.',
			type: 'animation'
		},{
			name: 'Loops',
			key: 'loops',
			description: 'How many times to loop before transitioning.',
			type: 'int',
			min: 1,
			'default': 1
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the target animation completes. If the animation loops forever, the transition will be done when the next loop starts.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	enter () {
		this._transitioned = false;
		this._loopAtStart = null;
		this._previousLoop = 0;
	};

	update (fsm) {
		// If we already made the transition, bail
		if (this._transitioned) {
			return;
		}

		var entity = fsm.getOwnerEntity();
		var that = this;

		if (this.animation && entity.animationComponent) {
			var currentState;

			if (this._loopAtStart === null) { // First enter!
				// Set the animation
				entity.animationComponent.transitionTo(this.animation, true);

				// Get the current loop number and store it
				currentState = entity.animationComponent.getCurrentState();
				if (currentState) {
					this._loopAtStart = currentState.getCurrentLoop();
				}
			}
			currentState = entity.animationComponent.getCurrentState();

			var shouldTransition = false;

			// Transition if the loop number was reached.
			if (currentState) {
				// Current state found - animation is still running
				shouldTransition = shouldTransition || (currentState.getCurrentLoop() - this._loopAtStart === this.loops);
				this._previousLoop = currentState.getCurrentLoop();
			} else {
				// No current state found. The animation probably used all of its loops and changed to the "null" animation.
				// Therefore, we cannot know the current loop. Look at the previous one
				shouldTransition = shouldTransition || (this._previousLoop === this.loops - 1);
			}

			if (shouldTransition) {
				fsm.send(that.transitions.complete);
				this._transitioned = true;
			}

		}
	};

	exit () {
		this._transitioned = false;
		this._loopAtStart = null;
		this._previousLoop = 0;
	};
}

export = SetAnimationAction;