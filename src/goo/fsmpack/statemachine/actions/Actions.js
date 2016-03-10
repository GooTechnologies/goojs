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
			Actions.register(arg.external.key, arg);
		}
	}

	registerAll({
		ArrowsAction: require('../../../fsmpack/statemachine/actions/ArrowsAction'),
		MouseUpAction: require('../../../fsmpack/statemachine/actions/MouseUpAction'),
		MouseDownAction: require('../../../fsmpack/statemachine/actions/MouseDownAction'),
		MouseMoveAction: require('../../../fsmpack/statemachine/actions/MouseMoveAction'),
		KeyUpAction: require('../../../fsmpack/statemachine/actions/KeyUpAction'),
		KeyDownAction: require('../../../fsmpack/statemachine/actions/KeyDownAction'),
		KeyPressedAction: require('../../../fsmpack/statemachine/actions/KeyPressedAction'),
		PickAction: require('../../../fsmpack/statemachine/actions/PickAction'),
		PickAndExitAction: require('../../../fsmpack/statemachine/actions/PickAndExitAction'),
		WasdAction: require('../../../fsmpack/statemachine/actions/WasdAction'),
		MoveAction: require('../../../fsmpack/statemachine/actions/MoveAction'),
		RotateAction: require('../../../fsmpack/statemachine/actions/RotateAction'),
		ScaleAction: require('../../../fsmpack/statemachine/actions/ScaleAction'),
		LookAtAction: require('../../../fsmpack/statemachine/actions/LookAtAction'),
		TweenMoveAction: require('../../../fsmpack/statemachine/actions/TweenMoveAction'),
		TweenRotationAction: require('../../../fsmpack/statemachine/actions/TweenRotationAction'),
		TweenScaleAction: require('../../../fsmpack/statemachine/actions/TweenScaleAction'),
		TweenLookAtAction: require('../../../fsmpack/statemachine/actions/TweenLookAtAction'),
		ShakeAction: require('../../../fsmpack/statemachine/actions/ShakeAction'),
		PauseAnimationAction: require('../../../fsmpack/statemachine/actions/PauseAnimationAction'),
		ResumeAnimationAction: require('../../../fsmpack/statemachine/actions/ResumeAnimationAction'),
		SetAnimationAction: require('../../../fsmpack/statemachine/actions/SetAnimationAction'),
		WaitAction: require('../../../fsmpack/statemachine/actions/WaitAction'),
		TransitionAction: require('../../../fsmpack/statemachine/actions/TransitionAction'),
		RandomTransitionAction: require('../../../fsmpack/statemachine/actions/RandomTransitionAction'),
		EmitAction: require('../../../fsmpack/statemachine/actions/EmitAction'),
		TransitionOnMessageAction: require('../../../fsmpack/statemachine/actions/TransitionOnMessageAction'),
		EvalAction: require('../../../fsmpack/statemachine/actions/EvalAction'),
		HideAction: require('../../../fsmpack/statemachine/actions/HideAction'),
		ShowAction: require('../../../fsmpack/statemachine/actions/ShowAction'),
		RemoveAction: require('../../../fsmpack/statemachine/actions/RemoveAction'),
		AddLightAction: require('../../../fsmpack/statemachine/actions/AddLightAction'),
		RemoveLightAction: require('../../../fsmpack/statemachine/actions/RemoveLightAction'),
		TweenLightColorAction: require('../../../fsmpack/statemachine/actions/TweenLightColorAction'),
		SetClearColorAction: require('../../../fsmpack/statemachine/actions/SetClearColorAction'),
		SwitchCameraAction: require('../../../fsmpack/statemachine/actions/SwitchCameraAction'),
		InFrustumAction: require('../../../fsmpack/statemachine/actions/InFrustumAction'),
		DollyZoomAction: require('../../../fsmpack/statemachine/actions/DollyZoomAction'),
		InBoxAction: require('../../../fsmpack/statemachine/actions/InBoxAction'),
		CompareDistanceAction: require('../../../fsmpack/statemachine/actions/CompareDistanceAction'),
		CollidesAction: require('../../../fsmpack/statemachine/actions/CollidesAction'),
		TagAction: require('../../../fsmpack/statemachine/actions/TagAction'),
		SmokeAction: require('../../../fsmpack/statemachine/actions/SmokeAction'),
		FireAction: require('../../../fsmpack/statemachine/actions/FireAction'),
		RemoveParticlesAction: require('../../../fsmpack/statemachine/actions/RemoveParticlesAction'),
		SoundFadeInAction: require('../../../fsmpack/statemachine/actions/SoundFadeInAction'),
		SoundFadeOutAction: require('../../../fsmpack/statemachine/actions/SoundFadeOutAction'),
		SetRenderTargetAction: require('../../../fsmpack/statemachine/actions/SetRenderTargetAction'),
		TweenTextureOffsetAction: require('../../../fsmpack/statemachine/actions/TweenTextureOffsetAction'),
		LogMessageAction: require('../../../fsmpack/statemachine/actions/LogMessageAction'),
		TweenOpacityAction: require('../../../fsmpack/statemachine/actions/TweenOpacityAction'),
		HtmlAction: require('../../../fsmpack/statemachine/actions/HtmlAction'),
		CopyJointTransformAction: require('../../../fsmpack/statemachine/actions/CopyJointTransformAction'),
		TriggerEnterAction: require('../../../fsmpack/statemachine/actions/TriggerEnterAction'),
		TriggerLeaveAction: require('../../../fsmpack/statemachine/actions/TriggerLeaveAction'),
		ApplyImpulseAction: require('../../../fsmpack/statemachine/actions/ApplyImpulseAction'),
		CompareCounterAction: require('../../../fsmpack/statemachine/actions/CompareCounterAction'),
		CompareCountersAction: require('../../../fsmpack/statemachine/actions/CompareCountersAction'),
		SetCounterAction: require('../../../fsmpack/statemachine/actions/SetCounterAction'),
		IncrementCounterAction: require('../../../fsmpack/statemachine/actions/IncrementCounterAction')
	});

module.exports = Actions;
