var ArrowsAction = require('../../../fsmpack/statemachine/actions/ArrowsAction');
var MouseUpAction = require('../../../fsmpack/statemachine/actions/MouseUpAction');
var MouseDownAction = require('../../../fsmpack/statemachine/actions/MouseDownAction');
var MouseMoveAction = require('../../../fsmpack/statemachine/actions/MouseMoveAction');
var KeyUpAction = require('../../../fsmpack/statemachine/actions/KeyUpAction');
var KeyDownAction = require('../../../fsmpack/statemachine/actions/KeyDownAction');
var KeyPressedAction = require('../../../fsmpack/statemachine/actions/KeyPressedAction');
var PickAction = require('../../../fsmpack/statemachine/actions/PickAction');
var PickAndExitAction = require('../../../fsmpack/statemachine/actions/PickAndExitAction');
var WasdAction = require('../../../fsmpack/statemachine/actions/WasdAction');
var MoveAction = require('../../../fsmpack/statemachine/actions/MoveAction');
var RotateAction = require('../../../fsmpack/statemachine/actions/RotateAction');
var ScaleAction = require('../../../fsmpack/statemachine/actions/ScaleAction');
var LookAtAction = require('../../../fsmpack/statemachine/actions/LookAtAction');
var TweenMoveAction = require('../../../fsmpack/statemachine/actions/TweenMoveAction');
var TweenRotationAction = require('../../../fsmpack/statemachine/actions/TweenRotationAction');
var TweenScaleAction = require('../../../fsmpack/statemachine/actions/TweenScaleAction');
var TweenLookAtAction = require('../../../fsmpack/statemachine/actions/TweenLookAtAction');
var ShakeAction = require('../../../fsmpack/statemachine/actions/ShakeAction');
var PauseAnimationAction = require('../../../fsmpack/statemachine/actions/PauseAnimationAction');
var ResumeAnimationAction = require('../../../fsmpack/statemachine/actions/ResumeAnimationAction');
var SetAnimationAction = require('../../../fsmpack/statemachine/actions/SetAnimationAction');
var WaitAction = require('../../../fsmpack/statemachine/actions/WaitAction');
var TransitionAction = require('../../../fsmpack/statemachine/actions/TransitionAction');
var RandomTransitionAction = require('../../../fsmpack/statemachine/actions/RandomTransitionAction');
var EmitAction = require('../../../fsmpack/statemachine/actions/EmitAction');
var TransitionOnMessageAction = require('../../../fsmpack/statemachine/actions/TransitionOnMessageAction');
var EvalAction = require('../../../fsmpack/statemachine/actions/EvalAction');
var HideAction = require('../../../fsmpack/statemachine/actions/HideAction');
var ShowAction = require('../../../fsmpack/statemachine/actions/ShowAction');
var RemoveAction = require('../../../fsmpack/statemachine/actions/RemoveAction');
var AddLightAction = require('../../../fsmpack/statemachine/actions/AddLightAction');
var RemoveLightAction = require('../../../fsmpack/statemachine/actions/RemoveLightAction');
var TweenLightColorAction = require('../../../fsmpack/statemachine/actions/TweenLightColorAction');
var SetClearColorAction = require('../../../fsmpack/statemachine/actions/SetClearColorAction');
var SwitchCameraAction = require('../../../fsmpack/statemachine/actions/SwitchCameraAction');
var InFrustumAction = require('../../../fsmpack/statemachine/actions/InFrustumAction');
var DollyZoomAction = require('../../../fsmpack/statemachine/actions/DollyZoomAction');
var InBoxAction = require('../../../fsmpack/statemachine/actions/InBoxAction');
var CompareDistanceAction = require('../../../fsmpack/statemachine/actions/CompareDistanceAction');
var CollidesAction = require('../../../fsmpack/statemachine/actions/CollidesAction');
var TagAction = require('../../../fsmpack/statemachine/actions/TagAction');
var SmokeAction = require('../../../fsmpack/statemachine/actions/SmokeAction');
var FireAction = require('../../../fsmpack/statemachine/actions/FireAction');
var RemoveParticlesAction = require('../../../fsmpack/statemachine/actions/RemoveParticlesAction');
var SoundFadeInAction = require('../../../fsmpack/statemachine/actions/SoundFadeInAction');
var SoundFadeOutAction = require('../../../fsmpack/statemachine/actions/SoundFadeOutAction');
var SetRenderTargetAction = require('../../../fsmpack/statemachine/actions/SetRenderTargetAction');
var TweenTextureOffsetAction = require('../../../fsmpack/statemachine/actions/TweenTextureOffsetAction');
var LogMessageAction = require('../../../fsmpack/statemachine/actions/LogMessageAction');
var TweenOpacityAction = require('../../../fsmpack/statemachine/actions/TweenOpacityAction');
var HtmlAction = require('../../../fsmpack/statemachine/actions/HtmlAction');
var CopyJointTransformAction = require('../../../fsmpack/statemachine/actions/CopyJointTransformAction');
var TweenOpacityAction = require('../../../fsmpack/statemachine/actions/TweenOpacityAction');
var TriggerEnterAction = require('../../../fsmpack/statemachine/actions/TriggerEnterAction');
var TriggerLeaveAction = require('../../../fsmpack/statemachine/actions/TriggerLeaveAction');
var ApplyImpulseAction = require('../../../fsmpack/statemachine/actions/ApplyImpulseAction');
var CompareCounterAction = require('../../../fsmpack/statemachine/actions/CompareCounterAction');
var CompareCountersAction = require('../../../fsmpack/statemachine/actions/CompareCountersAction');
var SetCounterAction = require('../../../fsmpack/statemachine/actions/SetCounterAction');
var IncrementCounterAction = require('../../../fsmpack/statemachine/actions/IncrementCounterAction');

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
