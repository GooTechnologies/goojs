define([
	/*
	'goo/fsmpack/statemachine/actions/LogVariableAction',
	'goo/fsmpack/statemachine/actions/SetVariableAction',
	'goo/fsmpack/statemachine/actions/AddPositionAction',
	'goo/fsmpack/statemachine/actions/MouseClickAction',
	'goo/fsmpack/statemachine/actions/SetPositionAction',
	'goo/fsmpack/statemachine/actions/AddVariableAction',
	//'goo/fsmpack/statemachine/actions/MouseMoveAction',
	'goo/fsmpack/statemachine/actions/SetRotationAction',
	//'goo/fsmpack/statemachine/actions/AddVectorAction',
	'goo/fsmpack/statemachine/actions/MultiplyVariableAction',
	//'goo/fsmpack/statemachine/actions/TestAngleAction',
	//'goo/fsmpack/statemachine/actions/EventListenerAction',
	'goo/fsmpack/statemachine/actions/NumberCompareAction',
	//'goo/fsmpack/statemachine/actions/TestCollisionAction',
	//'goo/fsmpack/statemachine/actions/FollowEntityAction',
	//'goo/fsmpack/statemachine/actions/RandomEventAction',
	//'goo/fsmpack/statemachine/actions/TestSpeedAction',
	'goo/fsmpack/statemachine/actions/GetPositionAction',
	//'goo/fsmpack/statemachine/actions/ScriptAction',
	//'goo/fsmpack/statemachine/actions/TweenAction',
	//'goo/fsmpack/statemachine/actions/GuiButtonAction',
	'goo/fsmpack/statemachine/actions/SetAnimationAction',
	//'goo/fsmpack/statemachine/actions/TweenPositionAction',
	'goo/fsmpack/statemachine/actions/KeyDownAction',
	'goo/fsmpack/statemachine/actions/SetClearColorAction',
	//'goo/fsmpack/statemachine/actions/TweenRotationAction',
	//'goo/fsmpack/statemachine/actions/KeyPressAction',
	//'goo/fsmpack/statemachine/actions/SetCssPropertyAction',

	'goo/fsmpack/statemachine/actions/KeyUpAction',
	'goo/fsmpack/statemachine/actions/SetLightRangeAction',

	// 'goo/fsmpack/statemachine/actions/TransformAction',
	'goo/fsmpack/statemachine/actions/MoveAction',
	'goo/fsmpack/statemachine/actions/RotateAction'
    */

	'goo/fsmpack/statemachine/actions/ArrowsAction',
	'goo/fsmpack/statemachine/actions/MouseUpAction',
	'goo/fsmpack/statemachine/actions/MouseDownAction',
	'goo/fsmpack/statemachine/actions/MouseMoveAction',
	'goo/fsmpack/statemachine/actions/KeyUpAction',
	'goo/fsmpack/statemachine/actions/KeyDownAction',
	'goo/fsmpack/statemachine/actions/KeyPressedAction',
	'goo/fsmpack/statemachine/actions/PickAction',
	'goo/fsmpack/statemachine/actions/WASDAction',

	'goo/fsmpack/statemachine/actions/MoveAction',
	'goo/fsmpack/statemachine/actions/RotateAction',
	'goo/fsmpack/statemachine/actions/ScaleAction',
	'goo/fsmpack/statemachine/actions/LookAtAction',

	'goo/fsmpack/statemachine/actions/TweenMoveAction',
	'goo/fsmpack/statemachine/actions/TweenRotationAction', // Tween Rotate
	'goo/fsmpack/statemachine/actions/TweenScaleAction',
	'goo/fsmpack/statemachine/actions/TweenLookAtAction',
	'goo/fsmpack/statemachine/actions/ShakeAction',

	'goo/fsmpack/statemachine/actions/PauseAnimationAction',
	'goo/fsmpack/statemachine/actions/ResumeAnimationAction',
	'goo/fsmpack/statemachine/actions/SetAnimationAction',

	'goo/fsmpack/statemachine/actions/WaitAction',

	'goo/fsmpack/statemachine/actions/TransitionAction',
	'goo/fsmpack/statemachine/actions/RandomTransitionAction',
	'goo/fsmpack/statemachine/actions/EmitAction', // Emit Message
	'goo/fsmpack/statemachine/actions/TransitionOnMessageAction', // Listen
	'goo/fsmpack/statemachine/actions/EvalAction',

	'goo/fsmpack/statemachine/actions/HideAction',
	'goo/fsmpack/statemachine/actions/ShowAction',
	'goo/fsmpack/statemachine/actions/RemoveAction',

	'goo/fsmpack/statemachine/actions/AddLightAction',
	'goo/fsmpack/statemachine/actions/RemoveLightAction',
	'goo/fsmpack/statemachine/actions/TweenLightColorAction',

	'goo/fsmpack/statemachine/actions/SetClearColorAction', // Background Color

	'goo/fsmpack/statemachine/actions/SwitchCameraAction',
	'goo/fsmpack/statemachine/actions/InFrustumAction', // In View
	'goo/fsmpack/statemachine/actions/DollyZoomAction',

	'goo/fsmpack/statemachine/actions/InBoxAction',
	'goo/fsmpack/statemachine/actions/CompareDistanceAction', // Camera Distance
	'goo/fsmpack/statemachine/actions/CollidesAction', // Collision
	'goo/fsmpack/statemachine/actions/TagAction',

	'goo/fsmpack/statemachine/actions/SmokeAction', // Smoke FX
	'goo/fsmpack/statemachine/actions/FireAction', // Fire FX
	'goo/fsmpack/statemachine/actions/RemoveParticlesAction',

	'goo/fsmpack/statemachine/actions/SoundFadeInAction',
	'goo/fsmpack/statemachine/actions/SoundFadeOutAction',

	'goo/fsmpack/statemachine/actions/SetRenderTargetAction',
	'goo/fsmpack/statemachine/actions/TweenTextureOffsetAction',

	'goo/fsmpack/statemachine/actions/LogMessageAction',

	'goo/fsmpack/statemachine/actions/TweenOpacityAction',
	'goo/fsmpack/statemachine/actions/HTMLAction',
	'goo/fsmpack/statemachine/actions/CopyJointTransformAction',
	'goo/fsmpack/statemachine/actions/TweenOpacityAction'
	//'goo/fsmpack/statemachine/actions/GotoURLAction'
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
			if (key === 'Eval') {
				continue;
			}
			actions[key] = _actions[key];
		}
		return actions;
	};

	function registerAll (args) {
		var actionsStartIndex = 0;
		for (var i = actionsStartIndex; i < args.length; i++) {
			var arg = args[i];
			Actions.register(arg.external.key || arg.external.name, arg);
		}
	}

	registerAll(arguments);

	return Actions;
});