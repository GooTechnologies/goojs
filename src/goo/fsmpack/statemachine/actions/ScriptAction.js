define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/TextureCreator',
	'goo/particles/ParticleLib',
	'goo/util/ParticleSystemUtils'
], function (
	Action,
	Material,
	ShaderLib,
	TextureCreator,
	ParticleLib,
	ParticleSystemUtils
) {
	'use strict';

	function ScriptAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ScriptAction.prototype = Object.create(Action.prototype);
	ScriptAction.prototype.constructor = ScriptAction;

	ScriptAction.external = {
		key: 'Script',
		name: 'Script Action',
		type: 'fx',
		description: 'Runs a script',
		parameters: [{
			name: 'Script Name',
			key: 'scriptName',
			type: 'string',
			'default': ''
		}],
		transitions: []
	};

	ScriptAction.prototype.ready = function (fsm) {
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

		if (this.script) {
			this.script.setup(this.args, this.ctx);
		}
	};

	ScriptAction.prototype.cleanup = function () {
		if (this.script) {
			this.script.cleanup(this.args, this.ctx);
			this.script = null;
		}
	};

	ScriptAction.prototype._setup = function () {
		if (this.script && this.script.enter) {
			this.script.enter(this.args, this.ctx);
		}
	};

	ScriptAction.prototype._run = function () {
		if (this.script) {
			this.script.update(this.args, this.ctx);
		}
	};

	ScriptAction.prototype.exit = function () {
		if (this.script && this.script.exit) {
			this.script.exit(this.args, this.ctx);
		}
	};

	ScriptAction.prototype.onDestroy = function () {
	};

	return ScriptAction;
});