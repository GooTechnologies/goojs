import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var GameUtils = require('./../../../util/GameUtils');

class ToggleFullscreenAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Toggle Fullscreen',
		name: 'Toggle Fullscreen',
		type: 'display',
		description: 'Toggles fullscreen on/off. Note that in most browsers this must be initiated by a user gesture. For example, click or touch.',
		parameters: [],
		transitions: []
	};

	enter (/*fsm*/) {
		GameUtils.toggleFullScreen();
	};
}

export = ToggleFullscreenAction;