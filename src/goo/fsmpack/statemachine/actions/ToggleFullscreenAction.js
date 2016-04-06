var Action = require('./Action');
var GameUtils = require('./../../../util/GameUtils');

function ToggleFullscreenAction(/*id, settings*/) {
	Action.apply(this, arguments);
}

ToggleFullscreenAction.prototype = Object.create(Action.prototype);
ToggleFullscreenAction.prototype.constructor = ToggleFullscreenAction;

ToggleFullscreenAction.external = {
	key: 'Toggle Fullscreen',
	name: 'Toggle Fullscreen',
	type: 'display',
	description: 'Toggles fullscreen on/off. Note that in most browsers this must be initiated by a user gesture. For example, click or touch.',
	parameters: [],
	transitions: []
};

ToggleFullscreenAction.prototype.enter = function (/*fsm*/) {
	GameUtils.toggleFullScreen();
};

module.exports = ToggleFullscreenAction;