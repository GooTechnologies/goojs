define([
	'goo/fsmpack/statemachine/actions/ArrowsAction',
	'goo/fsmpack/statemachine/actions/MouseUpAction',
	'goo/fsmpack/statemachine/actions/MouseDownAction',
	'goo/fsmpack/statemachine/actions/MouseMoveAction',
	'goo/fsmpack/statemachine/actions/KeyUpAction',
	'goo/fsmpack/statemachine/actions/KeyDownAction',
	'goo/fsmpack/statemachine/actions/KeyPressedAction',
	'goo/fsmpack/statemachine/actions/PickAction',
	'goo/fsmpack/statemachine/actions/PickAndExitAction',
	'goo/fsmpack/statemachine/actions/ClickAction',
	'goo/fsmpack/statemachine/actions/HoverEnterAction',
	'goo/fsmpack/statemachine/actions/HoverExitAction',
	'goo/fsmpack/statemachine/actions/WasdAction',

	'goo/fsmpack/statemachine/actions/MoveAction',
	'goo/fsmpack/statemachine/actions/RotateAction',
	'goo/fsmpack/statemachine/actions/ScaleAction',
	'goo/fsmpack/statemachine/actions/LookAtAction',

	'goo/fsmpack/statemachine/actions/TweenMoveAction',
	'goo/fsmpack/statemachine/actions/TweenRotationAction',
	'goo/fsmpack/statemachine/actions/TweenScaleAction',
	'goo/fsmpack/statemachine/actions/TweenLookAtAction',
	'goo/fsmpack/statemachine/actions/ShakeAction',

	'goo/fsmpack/statemachine/actions/PauseAnimationAction',
	'goo/fsmpack/statemachine/actions/ResumeAnimationAction',
	'goo/fsmpack/statemachine/actions/SetAnimationAction',
	'goo/fsmpack/statemachine/actions/SetTimeScale',

	'goo/fsmpack/statemachine/actions/WaitAction',

	'goo/fsmpack/statemachine/actions/TransitionAction',
	'goo/fsmpack/statemachine/actions/NextFrameAction',
	'goo/fsmpack/statemachine/actions/RandomTransitionAction',
	'goo/fsmpack/statemachine/actions/EmitAction',
	'goo/fsmpack/statemachine/actions/TransitionOnMessageAction',
	'goo/fsmpack/statemachine/actions/EvalAction',

	'goo/fsmpack/statemachine/actions/HideAction',
	'goo/fsmpack/statemachine/actions/ShowAction',
	'goo/fsmpack/statemachine/actions/RemoveAction',

	'goo/fsmpack/statemachine/actions/AddLightAction',
	'goo/fsmpack/statemachine/actions/RemoveLightAction',
	'goo/fsmpack/statemachine/actions/SetLightPropertiesAction',
	'goo/fsmpack/statemachine/actions/TweenLightColorAction',

	'goo/fsmpack/statemachine/actions/SetClearColorAction',

	'goo/fsmpack/statemachine/actions/SwitchCameraAction',
	'goo/fsmpack/statemachine/actions/InFrustumAction',
	'goo/fsmpack/statemachine/actions/DollyZoomAction',

	'goo/fsmpack/statemachine/actions/InBoxAction',
	'goo/fsmpack/statemachine/actions/CompareDistanceAction',
	'goo/fsmpack/statemachine/actions/CollidesAction',
	'goo/fsmpack/statemachine/actions/TagAction',

	'goo/fsmpack/statemachine/actions/SmokeAction',
	'goo/fsmpack/statemachine/actions/FireAction',
	'goo/fsmpack/statemachine/actions/RemoveParticlesAction',
	'goo/fsmpack/statemachine/actions/TogglePostFxAction',
	'goo/fsmpack/statemachine/actions/ToggleFullscreenAction',

	'goo/fsmpack/statemachine/actions/PlaySoundAction',
	'goo/fsmpack/statemachine/actions/PauseSoundAction',
	'goo/fsmpack/statemachine/actions/StopSoundAction',
	'goo/fsmpack/statemachine/actions/SoundFadeInAction',
	'goo/fsmpack/statemachine/actions/SoundFadeOutAction',

	'goo/fsmpack/statemachine/actions/SetRenderTargetAction',
	'goo/fsmpack/statemachine/actions/TweenTextureOffsetAction',
	'goo/fsmpack/statemachine/actions/SetMaterialColorAction',

	'goo/fsmpack/statemachine/actions/LogMessageAction',

	'goo/fsmpack/statemachine/actions/TweenOpacityAction',
	'goo/fsmpack/statemachine/actions/HtmlAction',
	'goo/fsmpack/statemachine/actions/CopyJointTransformAction',
	'goo/fsmpack/statemachine/actions/TweenOpacityAction',

	'goo/fsmpack/statemachine/actions/TriggerEnterAction',
	'goo/fsmpack/statemachine/actions/TriggerLeaveAction',

	'goo/fsmpack/statemachine/actions/ApplyImpulseAction',
	'goo/fsmpack/statemachine/actions/ApplyForceAction',
	'goo/fsmpack/statemachine/actions/ApplyTorqueAction',

	'goo/fsmpack/statemachine/actions/SetRigidBodyPositionAction',
	'goo/fsmpack/statemachine/actions/SetRigidBodyVelocityAction',
	'goo/fsmpack/statemachine/actions/SetRigidBodyAngularVelocityAction',

	'goo/fsmpack/statemachine/actions/CompareCounterAction',
	'goo/fsmpack/statemachine/actions/CompareCountersAction',
	'goo/fsmpack/statemachine/actions/SetCounterAction',
	'goo/fsmpack/statemachine/actions/IncrementCounterAction',

	'goo/fsmpack/statemachine/actions/MuteAction',
	'goo/fsmpack/statemachine/actions/UnmuteAction',
	'goo/fsmpack/statemachine/actions/ToggleMuteAction',

	'goo/fsmpack/statemachine/actions/StartTimelineAction',
	'goo/fsmpack/statemachine/actions/PauseTimelineAction',
	'goo/fsmpack/statemachine/actions/StopTimelineAction',
	'goo/fsmpack/statemachine/actions/SetTimelineTimeAction',

	// 'goo/fsmpack/statemachine/actions/SetVariableAction',
	// 'goo/fsmpack/statemachine/actions/AddVariableAction',
	// 'goo/fsmpack/statemachine/actions/MultiplyVariableAction',
	// 'goo/fsmpack/statemachine/actions/CopyVariableAction',

	'goo/fsmpack/statemachine/actions/ScriptAction',

	'goo/fsmpack/statemachine/actions/SetHtmlTextAction'
], function (
	_ // placeholder // what for?
) {
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

	return Actions;
});
