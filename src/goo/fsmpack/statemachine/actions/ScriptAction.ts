import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class ScriptAction extends Action {
	scriptName: string;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Script',
		name: 'Script Action',
		type: 'fx',
		description: 'Runs a script.',
		parameters: [{
			name: 'Script Name',
			key: 'scriptName',
			type: 'string',
			'default': ''
		}],
		transitions: []
	};

	ready (fsm) {
		var entities = fsm.getWorld().by.component('ScriptComponent').toArray();
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			for (var j = 0; j < entity.scriptComponent.scripts.length; j++) {
				var script = entity.scriptComponent.scripts[j];
				if (script.name === this.scriptName) {
					this.script = script;
					break;
				}
			}
			if (this.script) {
				break;
			}
		}

		this.args = {};
		this.ctx = {
			entity: fsm.getOwnerEntity(),
			world: fsm.getWorld(),
			fsm: fsm
		};

		if (this.script && this.script.setup) {
			this.script.setup(this.args, this.ctx);
		}
	};

	cleanup () {
		if (this.script && this.script.cleanup) {
			this.script.cleanup(this.args, this.ctx);
			this.script = null;
		}
	};

	enter () {
		if (this.script && this.script.enter) {
			this.script.enter(this.args, this.ctx);
		}
	};

	update () {
		if (this.script && this.script.update) {
			this.script.update(this.args, this.ctx);
		}
	};

	exit () {
		if (this.script && this.script.exit) {
			this.script.exit(this.args, this.ctx);
		}
	};

	onDestroy () {
	};
}

export = ScriptAction;