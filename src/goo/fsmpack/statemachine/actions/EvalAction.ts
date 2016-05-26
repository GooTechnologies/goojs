import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class EvalAction extends Action {
	expression: string;
	expressionFunction: Function;
	constructor(id: string, options: any){
		super(id, options);
		this.expressionFunction = null;
	}

	static external: External = {
		key: 'Eval',
		name: 'Eval',
		type: 'misc',
		description: 'Evaluates a JS expression.',
		parameters: [{
			name: 'expression',
			key: 'expression',
			type: 'string',
			description: 'JavaScript expression to evaluate.',
			'default': ''
		}],
		transitions: []
	};

	enter () {
		this.expressionFunction = new Function('goo', this.expression);
	};

	update (fsm) {
		if (this.expressionFunction) {
			try {
				this.expressionFunction(fsm.getEvalProxy());
			} catch (e) {
				console.warn('Eval code error: ' + e.message);
			}
		}
	};
}

export = EvalAction;