import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	w: 'On Key W Pressed',
	a: 'On Key A Pressed',
	s: 'On Key S Pressed',
	d: 'On Key D Pressed'
};

var keys = {
	87: 'w',
	65: 'a',
	83: 's',
	68: 'd'
};

class WasdAction extends Action {
	targets: any;
	eventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	configure (settings) {
		this.targets = settings.transitions;
	};

	static external: External = (function () {
		var transitions = [];
		for (var keycode in keys) {
			var keyname = keys[keycode];
			transitions.push({
				key: keyname,
				name: 'On key ' + keyname.toUpperCase(),
				description: "On key '" + keyname + "' pressed."
			});
		}

		return {
			key: 'WASD Keys Listener',
			name: 'WASD Keys',
			type: 'controls',
			description: 'Transitions to other states when the WASD keys are pressed.',
			canTransition: true,
			parameters: [],
			transitions: [{
				key: 'w',
				name: 'On key W',
				description: "On key 'W' pressed."
			},{
				key: 'a',
				name: 'On key A',
				description: "On key 'W' pressed."
			},{
				key: 's',
				name: 'On key S',
				description: "On key 'W' pressed."
			},{
				key: 'd',
				name: 'On key W',
				description: "On key 'W' pressed."
			}]
		};
	})();

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		this.eventListener = function (event) {
			var keyname = keys[event.which];
			if (keyname) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target);
				}
			}
		}.bind(this);

		document.addEventListener('keydown', this.eventListener);
	};

	exit () {
		document.removeEventListener('keydown', this.eventListener);
	};
}

export = WasdAction;