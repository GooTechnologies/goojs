define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function SetClearColorAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || false;

		this.color = settings.color || [0, 0, 0, 0];
	}

	SetClearColorAction.prototype = Object.create(Action.prototype);

	SetClearColorAction.external = [{
			name:'Color',
			key:'color',
			type:'color'
		}];

	// not onCreate
	SetClearColorAction.prototype.onCreate = function(fsm) {
		console.log("Setting clear color to " + JSON.stringify(this.color));
		fsm.getEngine().renderer.setClearColor(this.color[0], this.color[1], this.color[2], this.color[3]);
	};

	return SetClearColorAction;
});