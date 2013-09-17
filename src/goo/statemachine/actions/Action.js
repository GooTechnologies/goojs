define([],
/** @lends */
function() {
	"use strict";

	function Action() {
	}

	/* this gets executed on enter - override this */
	Action.prototype._setup = function(fsm) {
	};

	/* this gets executed on enter or on update depending on `everyFrame` - override this */
	Action.prototype._run = function(fsm) {
	};

	/* this is called by external functions - called once, when the host state becomes active */
	Action.prototype.enter = function(fsm) {
		this._setup(fsm);
		if (!this.everyFrame) {
			this._run(fsm);
		}
	};

	/* this is called by external functions - called on every frame */
	Action.prototype.update = function(fsm) {
		if (this.everyFrame) {
			this._run(fsm);
		}
	};

	/* this is called by external functions; also the place to cleanup whatever _onEnter did */
	Action.prototype.exit = function(fsm) {
	};

	return Action;
});