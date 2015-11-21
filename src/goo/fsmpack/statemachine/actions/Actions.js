var ArrowsAction = require('goo/fsmpack/statemachine/actions/ArrowsAction');
var MouseUpAction = require('goo/fsmpack/statemachine/actions/MouseUpAction');
var MouseDownAction = require('goo/fsmpack/statemachine/actions/MouseDownAction');
var MouseMoveAction = require('goo/fsmpack/statemachine/actions/MouseMoveAction');
var KeyUpAction = require('goo/fsmpack/statemachine/actions/KeyUpAction');
var KeyDownAction = require('goo/fsmpack/statemachine/actions/KeyDownAction');
var KeyPressedAction = require('goo/fsmpack/statemachine/actions/KeyPressedAction');
var PickAction = require('goo/fsmpack/statemachine/actions/PickAction');
var PickAndExitAction = require('goo/fsmpack/statemachine/actions/PickAndExitAction');
var WasdAction = require('goo/fsmpack/statemachine/actions/WasdAction');
var MoveAction = require('goo/fsmpack/statemachine/actions/MoveAction');
var RotateAction = require('goo/fsmpack/statemachine/actions/RotateAction');
var ScaleAction = require('goo/fsmpack/statemachine/actions/ScaleAction');
var LookAtAction = require('goo/fsmpack/statemachine/actions/LookAtAction');
var TweenMoveAction = require('goo/fsmpack/statemachine/actions/TweenMoveAction');
var TweenRotationAction = require('goo/fsmpack/statemachine/actions/TweenRotationAction');
var TweenScaleAction = require('goo/fsmpack/statemachine/actions/TweenScaleAction');
var TweenLookAtAction = require('goo/fsmpack/statemachine/actions/TweenLookAtAction');
var ShakeAction = require('goo/fsmpack/statemachine/actions/ShakeAction');
var PauseAnimationAction = require('goo/fsmpack/statemachine/actions/PauseAnimationAction');
var ResumeAnimationAction = require('goo/fsmpack/statemachine/actions/ResumeAnimationAction');
var SetAnimationAction = require('goo/fsmpack/statemachine/actions/SetAnimationAction');
var WaitAction = require('goo/fsmpack/statemachine/actions/WaitAction');
var TransitionAction = require('goo/fsmpack/statemachine/actions/TransitionAction');
var RandomTransitionAction = require('goo/fsmpack/statemachine/actions/RandomTransitionAction');
var EmitAction = require('goo/fsmpack/statemachine/actions/EmitAction');
var TransitionOnMessageAction = require('goo/fsmpack/statemachine/actions/TransitionOnMessageAction');
var EvalAction = require('goo/fsmpack/statemachine/actions/EvalAction');
var HideAction = require('goo/fsmpack/statemachine/actions/HideAction');
var ShowAction = require('goo/fsmpack/statemachine/actions/ShowAction');
var RemoveAction = require('goo/fsmpack/statemachine/actions/RemoveAction');
var AddLightAction = require('goo/fsmpack/statemachine/actions/AddLightAction');
var RemoveLightAction = require('goo/fsmpack/statemachine/actions/RemoveLightAction');
var TweenLightColorAction = require('goo/fsmpack/statemachine/actions/TweenLightColorAction');
var SetClearColorAction = require('goo/fsmpack/statemachine/actions/SetClearColorAction');
var SwitchCameraAction = require('goo/fsmpack/statemachine/actions/SwitchCameraAction');
var InFrustumAction = require('goo/fsmpack/statemachine/actions/InFrustumAction');
var DollyZoomAction = require('goo/fsmpack/statemachine/actions/DollyZoomAction');
var InBoxAction = require('goo/fsmpack/statemachine/actions/InBoxAction');
var CompareDistanceAction = require('goo/fsmpack/statemachine/actions/CompareDistanceAction');
var CollidesAction = require('goo/fsmpack/statemachine/actions/CollidesAction');
var TagAction = require('goo/fsmpack/statemachine/actions/TagAction');
var SmokeAction = require('goo/fsmpack/statemachine/actions/SmokeAction');
var FireAction = require('goo/fsmpack/statemachine/actions/FireAction');
var RemoveParticlesAction = require('goo/fsmpack/statemachine/actions/RemoveParticlesAction');
var SoundFadeInAction = require('goo/fsmpack/statemachine/actions/SoundFadeInAction');
var SoundFadeOutAction = require('goo/fsmpack/statemachine/actions/SoundFadeOutAction');
var SetRenderTargetAction = require('goo/fsmpack/statemachine/actions/SetRenderTargetAction');
var TweenTextureOffsetAction = require('goo/fsmpack/statemachine/actions/TweenTextureOffsetAction');
var LogMessageAction = require('goo/fsmpack/statemachine/actions/LogMessageAction');
var TweenOpacityAction = require('goo/fsmpack/statemachine/actions/TweenOpacityAction');
var HtmlAction = require('goo/fsmpack/statemachine/actions/HtmlAction');
var CopyJointTransformAction = require('goo/fsmpack/statemachine/actions/CopyJointTransformAction');
var TweenOpacityAction = require('goo/fsmpack/statemachine/actions/TweenOpacityAction');
var TriggerEnterAction = require('goo/fsmpack/statemachine/actions/TriggerEnterAction');
var TriggerLeaveAction = require('goo/fsmpack/statemachine/actions/TriggerLeaveAction');
var ApplyImpulseAction = require('goo/fsmpack/statemachine/actions/ApplyImpulseAction');
var CompareCounterAction = require('goo/fsmpack/statemachine/actions/CompareCounterAction');
var CompareCountersAction = require('goo/fsmpack/statemachine/actions/CompareCountersAction');
var SetCounterAction = require('goo/fsmpack/statemachine/actions/SetCounterAction');
var IncrementCounterAction = require('goo/fsmpack/statemachine/actions/IncrementCounterAction');

	'use strict';

	var _actions = {};

	var Actions = {};

	var IGNORED_ACTIONS = [
		'Eval',
		'HTMLPick',
		'Remove',
		'Collides',
		'Tag'
	];

	Actions.register = function (name, actionClass) {
		_actions[name] = actionClass;
	};

	Actions.actionForType = function (name) {
		return _actions[name];
	};

	Actions.allActions = function () {
		var actions = {};
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (IGNORED_ACTIONS.indexOf(key) === -1) {
				actions[key] = _actions[key];
			}
		}
		return actions;
	};

	Actions.allActionsArray = function () {
		var actions = [];
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (key === 'Eval' || key === 'HTMLPick' || key === 'Remove') {
				continue;
			}
			actions.push(_actions[key]);
		}
		return actions;
	};

	function registerAll(args) {
		var actionsStartIndex = 0;
		for (var i = actionsStartIndex; i < args.length; i++) {
			var arg = args[i];
			Actions.register(arg.external.key || arg.external.name, arg);
		}
	}

	registerAll(arguments);

	module.exports = Actions;
