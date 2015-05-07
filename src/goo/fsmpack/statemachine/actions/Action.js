define([
	'goo/fsmpack/statemachine/FSMUtil'
], function (
	FSMUtil
) {
	'use strict';

	/**
	 * @param {string} id
	 * @param {object} settings
	 * @private
	 */
	function Action(id, settings) {
		this.id = id;
		this.configure(settings || {});
	}

	/* this gets executed on enter - override this if needed */
	Action.prototype._setup = function (/*fsm*/) {};

	/* this gets executed on enter or on update depending on `everyFrame` - override this */
	//! schteppe: why have separate methods for the subclasses to override? They could just override the "update" method themselves. The current solution feels unnatural and less OO-like to me.
	Action.prototype._run = function (/*fsm*/) {};

	/* this should be called by the constructor and by the handlers when new options are loaded */
	Action.prototype.configure = function (settings) {
		FSMUtil.setParameters.call(this, settings, this.constructor.external.parameters);
		FSMUtil.setTransitions.call(this, settings, this.constructor.external.transitions);
	};

	/* this is called by external functions - called once, when the host state becomes active */
	Action.prototype.enter = function (fsm) {
		this._setup(fsm);
		if (!this.everyFrame) {
			this._run(fsm);
		}
	};

	/* this is called by external functions - called on every frame */
	Action.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this._run(fsm);
		}
	};

	/* this is called by external functions - called on every frame */
	Action.prototype.fixedUpdate = function (/*fsm*/) {};

	/* this is called when the machine just started */
	Action.prototype.ready = function (/*fsm*/) {};

	/* this is called when the machine stops and makes sure that any changes not undone by exit methods get undone */
	Action.prototype.cleanup = function (/*fsm*/) {};

	/* this is called by external functions; also the place to cleanup whatever _setup did */
	Action.prototype.exit = function (/*fsm*/) {};

	return Action;
});