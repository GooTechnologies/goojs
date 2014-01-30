define([
	/*
	'fsmpack/statemachine/actions/LogVariableAction',
	'fsmpack/statemachine/actions/SetVariableAction',
	'fsmpack/statemachine/actions/AddPositionAction',
	'fsmpack/statemachine/actions/MouseClickAction',
	'fsmpack/statemachine/actions/SetPositionAction',
	'fsmpack/statemachine/actions/AddVariableAction',
	//'fsmpack/statemachine/actions/MouseMoveAction',
	'fsmpack/statemachine/actions/SetRotationAction',
	//'fsmpack/statemachine/actions/AddVectorAction',
	'fsmpack/statemachine/actions/MultiplyVariableAction',
	//'fsmpack/statemachine/actions/TestAngleAction',
	//'fsmpack/statemachine/actions/EventListenerAction',
	'fsmpack/statemachine/actions/NumberCompareAction',
	//'fsmpack/statemachine/actions/TestCollisionAction',
	//'fsmpack/statemachine/actions/FollowEntityAction',
	//'fsmpack/statemachine/actions/RandomEventAction',
	//'fsmpack/statemachine/actions/TestSpeedAction',
	'fsmpack/statemachine/actions/GetPositionAction',
	//'fsmpack/statemachine/actions/ScriptAction',
	//'fsmpack/statemachine/actions/TweenAction',
	//'fsmpack/statemachine/actions/GuiButtonAction',
	'fsmpack/statemachine/actions/SetAnimationAction',
	//'fsmpack/statemachine/actions/TweenPositionAction',
	'fsmpack/statemachine/actions/KeyDownAction',
	'fsmpack/statemachine/actions/SetClearColorAction',
	//'fsmpack/statemachine/actions/TweenRotationAction',
	//'fsmpack/statemachine/actions/KeyPressAction',
	//'fsmpack/statemachine/actions/SetCssPropertyAction',

	'fsmpack/statemachine/actions/KeyUpAction',
	'fsmpack/statemachine/actions/SetLightRangeAction',

	// 'fsmpack/statemachine/actions/TransformAction',
	'fsmpack/statemachine/actions/MoveAction',
	'fsmpack/statemachine/actions/RotateAction'
    */

	'fsmpack/statemachine/actions/MoveAction',
	'fsmpack/statemachine/actions/RotateAction',
	'fsmpack/statemachine/actions/ScaleAction',
	'fsmpack/statemachine/actions/LookAtAction',

	'fsmpack/statemachine/actions/TweenMoveAction',
	'fsmpack/statemachine/actions/TweenRotationAction',
	'fsmpack/statemachine/actions/TweenScaleAction',
	'fsmpack/statemachine/actions/TweenLookAtAction',

	'fsmpack/statemachine/actions/HideAction',
	'fsmpack/statemachine/actions/ShowAction',
	'fsmpack/statemachine/actions/RemoveAction',
	'fsmpack/statemachine/actions/AddLightAction',
	'fsmpack/statemachine/actions/RemoveLightAction',

	'fsmpack/statemachine/actions/InBoxAction',
	'fsmpack/statemachine/actions/CompareDistanceAction',

	'fsmpack/statemachine/actions/SetClearColorAction',
	//'fsmpack/statemachine/actions/SuspendFSMAction',
	//'fsmpack/statemachine/actions/ResumeFSMAction',

	'fsmpack/statemachine/actions/InFrustumAction',
	'fsmpack/statemachine/actions/TransitionAction',
	'fsmpack/statemachine/actions/EmitAction',
	'fsmpack/statemachine/actions/EvalAction',

	'fsmpack/statemachine/actions/SwitchCameraAction',
	'fsmpack/statemachine/actions/LogMessageAction',
	'fsmpack/statemachine/actions/PauseAnimationAction',
	'fsmpack/statemachine/actions/ResumeAnimationAction',
	'fsmpack/statemachine/actions/SetAnimationAction',

	'fsmpack/statemachine/actions/MouseUpAction',
	'fsmpack/statemachine/actions/MouseDownAction',
	'fsmpack/statemachine/actions/MouseMoveAction',
	'fsmpack/statemachine/actions/KeyUpAction',
	'fsmpack/statemachine/actions/KeyDownAction',
	'fsmpack/statemachine/actions/KeyPressedAction',
	'fsmpack/statemachine/actions/WASDAction',
	'fsmpack/statemachine/actions/ArrowsAction',

	'fsmpack/statemachine/actions/SetRenderTargetAction',
	'fsmpack/statemachine/actions/WaitAction',
	'fsmpack/statemachine/actions/RandomTransitionAction',
	'fsmpack/statemachine/actions/ShakeAction',
	'fsmpack/statemachine/actions/SmokeAction',
	'fsmpack/statemachine/actions/FireAction',
	'fsmpack/statemachine/actions/RemoveParticlesAction',
	'fsmpack/statemachine/actions/DollyZoomAction',
	'fsmpack/statemachine/actions/TweenTextureOffsetAction',
	'fsmpack/statemachine/actions/PickAction',

	'fsmpack/statemachine/actions/SoundFadeInAction',
	'fsmpack/statemachine/actions/SoundFadeOutAction',

	'fsmpack/statemachine/actions/TransitionOnMessageAction',
	'fsmpack/statemachine/actions/TweenLightColorAction',
	'fsmpack/statemachine/actions/CollidesAction',
	'fsmpack/statemachine/actions/TagAction'
],
/** @lends */
function(

) {
	'use strict';

	var _actions = {};

	var Actions = {};

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
			actions[key] = _actions[key];
		}
		return actions;
	};

	function registerAll (args) {
		var actionsStartIndex = 0;
		for (var i = actionsStartIndex; i < args.length; i++) {
			var arg = args[i];
			Actions.register(arg.external.name, arg);
		}
	}

	registerAll(arguments);

	return Actions;
});