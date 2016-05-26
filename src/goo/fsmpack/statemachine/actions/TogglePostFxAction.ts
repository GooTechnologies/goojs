import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class TogglePostFxAction extends Action {
	enabled: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Toggle Post FX',
		name: 'Toggle Post FX',
		type: 'fx',
		description: 'Enabled/disables post fx globally.',
		parameters: [{
			name: 'Set Post FX state',
			key: 'enabled',
			type: 'boolean',
			description: 'Set Post FX on/off.',
			'default': true
		}],
		transitions: []
	};

	enter (fsm) {
		var renderSystem = fsm.getWorld().gooRunner.renderSystem;
		if (renderSystem) {
			renderSystem.enableComposers(this.enabled);
		}
	};
}

export = TogglePostFxAction;