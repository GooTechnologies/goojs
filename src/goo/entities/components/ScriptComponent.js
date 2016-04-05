var Component = require('../../entities/components/Component');
var SystemBus = require('../../entities/SystemBus');
var ObjectUtils = require('../../util/ObjectUtils');

function getGooClasses(){
	return (typeof window !== 'undefined' && window.goo) || {};
}

/**
 * Contains scripts to be executed each frame when set on an active entity.
 * @param {(Object|Array<Object>)} [scripts] A script-object or an array of script-objects to attach to the
 * entity.
 * The script-object needs to define the function <code>run({@link Entity} entity, number tpf)</code>,
 * which runs on every frame update.
 *
 * The script object can also define the function <code>setup({@link Entity} entity)</code>, called upon script creation.
 * @extends Component
 */
function ScriptComponent(scripts) {
	Component.apply(this, arguments);

	this.type = 'ScriptComponent';

	if (scripts instanceof Array) {
		this.scripts = scripts;
	} else if (scripts) {
		this.scripts = [scripts];
	} else {
		/**
		* Array of scripts tied to this script component. Scripts can be added to the component
		* using the constructor or by manually adding to the array.
		* @type {Array}
		* @example
		* // Add a script to script component
		* var scriptComponent = new ScriptComponent();
		* var controlScript = new WasdControlScript();
		* scriptComponent.scripts.push(controlScript);
		*/
		this.scripts = [];
	}

	// @ifdef DEBUG
	Object.seal(this);
	// @endif
}

ScriptComponent.type = 'ScriptComponent';

ScriptComponent.prototype = Object.create(Component.prototype);
ScriptComponent.prototype.constructor = ScriptComponent;

/**
 * Runs the .setup method on each script; called when the ScriptComponent is
 * attached to the entity or when the entity is added to the world.
 *
 * @private
 * @param entity
 */
ScriptComponent.prototype.setup = function (entity) {
	var systemContext = entity._world.getSystem('ScriptSystem').context;
	var componentContext = Object.create(systemContext);
	ObjectUtils.extend(componentContext, {
		entity: entity,
		entityData: {}
	});
	for (var i = 0; i < this.scripts.length; i++) {
		var script = this.scripts[i];
		if (!script.context) {
			script.context = Object.create(componentContext);

			if (script.parameters && script.parameters.enabled !== undefined) {
				script.enabled = script.parameters.enabled;
			} else {
				script.enabled = true;
			}

			if (script.setup && script.enabled) {
				try {
					script.setup(script.parameters, script.context, getGooClasses());
				} catch (e) {
					this._handleError(script, e, 'setup');
				}
			}
		}
	}
};

/**
 * Called when script component is attached to entity.
 * @private
 * @type {setup}
 */
//ScriptComponent.prototype.attached = ScriptComponent.prototype.setup;

/**
 * Runs the update function on every script attached to this entity.
 * @private
 * @param entity {Entity}
 */
ScriptComponent.prototype.run = function (entity) {
	for (var i = 0; i < this.scripts.length; i++) {
		var script = this.scripts[i];
		if (script && script.run && (script.enabled === undefined || script.enabled)) {
			try {
				script.run(entity, entity._world.tpf, script.context, script.parameters);
			} catch (e) {
				this._handleError(script, e, 'run');
			}
		} else if (script.update && (script.enabled === undefined || script.enabled)) {
			try {
				script.update(script.parameters, script.context, getGooClasses());
			} catch (e) {
				this._handleError(script, e, 'update');
			}
		}
	}
};

/**
 * Runs the lateUpdate function on every script attached to this entity.
 * @private
 */
ScriptComponent.prototype.lateRun = function () {
	for (var i = 0; i < this.scripts.length; i++) {
		var script = this.scripts[i];
		if (script.lateUpdate && (script.enabled === undefined || script.enabled)) {
			try {
				script.lateUpdate(script.parameters, script.context, getGooClasses());
			} catch (e) {
				this._handleError(script, e, 'lateUpdate');
			}
		}
	}
};

/**
 * Reverts any changes done by setup; called when the entity loses its ScriptComponent or is removed from the world.
 * @private
 */
ScriptComponent.prototype.cleanup = function () {
	for (var i = 0; i < this.scripts.length; i++) {
		var script = this.scripts[i];
		if (script.context) {
			if (script.cleanup &&
				(script.parameters && script.parameters.enabled !== undefined ?
					script.parameters.enabled :
					script.enabled)
			) {
				try {
					script.cleanup(script.parameters, script.context, getGooClasses());
				} catch (e) {
					this._handleError(script, e, 'cleanup');
				}
			}
			script.enabled = false;
			script.context = null;
		}
	}
};

/**
 * Enables all the scripts that are in the component.
 */
ScriptComponent.prototype.startScripts = function () {
	this.scripts.forEach(function (script) {
		if (script.parameters && script.parameters.enabled === false) {
			script.enabled = false;
		} else {
			script.enabled = true;
		}
	});
};

/**
 * Disables all the scripts that are in the component.
 */
ScriptComponent.prototype.stopScripts = function () {
	this.scripts.forEach(function (script) {
		script.enabled = false;
	});
};

/**
 * Formats the error and sends it to the systembus
 * @private
 */
ScriptComponent.prototype._handleError = function (script, error, phase) {
	script.enabled = false;
	var err = {
		id: script.id,
		errors: [{
			message: error.message || error,
			phase: phase
		}]
	};
	// TODO Test if this works across browsers
	/**/
	if (error instanceof Error) {
		var lineNumbers = error.stack.split('\n')[1].match(/(\d+):\d+\)$/);
		if (lineNumbers) {
			err.line = parseInt(lineNumbers[1], 10) - 1;
		}
	}
	/**/
	console.error(err.errors[0].message, err);
	SystemBus.emit('goo.scriptError', err);
};

/**
 * Called when script component is detached from entity.
 * @private
 * @type {setup}
 */
//ScriptComponent.prototype.detached = ScriptComponent.prototype.cleanup;

/**
 * Attempts to add a script to an entity. The object can be a { run: Function } object or a Function. The entity is supposed to get a ScriptComponent with a script created out of the passed object
 * @private
 * @param obj {Function | { run: Function }}
 * @param entity {Entity}
 * @returns {boolean}
 */
ScriptComponent.applyOnEntity = function (obj, entity) {
	if (obj instanceof Function || (obj && obj.run instanceof Function) || (obj && obj.update instanceof Function)) {
		var scriptComponent;
		if (!entity.scriptComponent) {
			scriptComponent = new ScriptComponent();
			entity.setComponent(scriptComponent);
		} else {
			scriptComponent = entity.scriptComponent;
		}
		scriptComponent.scripts.push(obj.run instanceof Function || obj.update instanceof Function ? obj : { run: obj });

		return true;
	}
};

module.exports = ScriptComponent;