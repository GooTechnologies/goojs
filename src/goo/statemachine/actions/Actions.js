define([
	'goo/util/StringUtil',
	'goo/util/ObjectUtil',
	/*
	'goo/statemachine/actions/LogVariableAction',
	'goo/statemachine/actions/SetVariableAction',
	'goo/statemachine/actions/AddPositionAction',
	'goo/statemachine/actions/MouseClickAction',
	'goo/statemachine/actions/SetPositionAction',
	'goo/statemachine/actions/AddVariableAction',
	//'goo/statemachine/actions/MouseMoveAction',
	'goo/statemachine/actions/SetRotationAction',
	//'goo/statemachine/actions/AddVectorAction',
	'goo/statemachine/actions/MultiplyVariableAction',
	//'goo/statemachine/actions/TestAngleAction',
	//'goo/statemachine/actions/EventListenerAction',
	'goo/statemachine/actions/NumberCompareAction',
	//'goo/statemachine/actions/TestCollisionAction',
	//'goo/statemachine/actions/FollowEntityAction',
	//'goo/statemachine/actions/RandomEventAction',
	//'goo/statemachine/actions/TestSpeedAction',
	'goo/statemachine/actions/GetPositionAction',
	//'goo/statemachine/actions/ScriptAction',
	//'goo/statemachine/actions/TweenAction',
	//'goo/statemachine/actions/GuiButtonAction',
	'goo/statemachine/actions/SetAnimationAction',
	//'goo/statemachine/actions/TweenPositionAction',
	'goo/statemachine/actions/KeyDownAction',
	'goo/statemachine/actions/SetClearColorAction',
	//'goo/statemachine/actions/TweenRotationAction',
	//'goo/statemachine/actions/KeyPressAction',
	//'goo/statemachine/actions/SetCssPropertyAction',

	'goo/statemachine/actions/KeyUpAction',
	'goo/statemachine/actions/SetLightRangeAction',

	// 'goo/statemachine/actions/TransformAction',
	'goo/statemachine/actions/MoveAction',
	'goo/statemachine/actions/RotateAction'
    */
	'goo/statemachine/actions/WaitAction',
	'goo/statemachine/actions/MoveAction',
	// 'goo/statemachine/actions/MoveWithRotationAction',
	'goo/statemachine/actions/RotateAction',
	'goo/statemachine/actions/ScaleAction',
	// 'goo/statemachine/actions/LookAtAction',

	'goo/statemachine/actions/TweenMoveAction',
	//'goo/statemachine/actions/TweenRotateAction',
	//'goo/statemachine/actions/TweenScaleAction',
	//'goo/statemachine/actions/TweenLookAtAction',

	'goo/statemachine/actions/HideAction',
	'goo/statemachine/actions/ShowAction',
	// 'goo/statemachine/actions/RemoveAction',
	'goo/statemachine/actions/AddLightAction',
	'goo/statemachine/actions/RemoveLightAction',

	'goo/statemachine/actions/InBoxAction',
	'goo/statemachine/actions/CompareDistanceAction',

	'goo/statemachine/actions/SetClearColorAction',
	'goo/statemachine/actions/SuspendFSMAction',
	'goo/statemachine/actions/ResumeFSMAction',

	'goo/statemachine/actions/InFrustumAction',
	'goo/statemachine/actions/TransitionAction',
	'goo/statemachine/actions/EmitAction',
	'goo/statemachine/actions/EvalAction',

//	'goo/statemachine/actions/SwitchCameraAction',
	'goo/statemachine/actions/LogMessageAction',
	'goo/statemachine/actions/PauseAnimationAction',
	'goo/statemachine/actions/ResumeAnimationAction',
	'goo/statemachine/actions/SetAnimationAction',

//	'goo/statemachine/actions/MouseUpAction',
	'goo/statemachine/actions/MouseDownAction',
	'goo/statemachine/actions/KeyUpAction',
	'goo/statemachine/actions/KeyDownAction',
	'goo/statemachine/actions/WASDAction',
	'goo/statemachine/actions/ArrowsAction'
],
/** @lends */
function(
	StringUtil,
	_
) {
	"use strict";

	var _actions = {};

	var Actions = {};

	Actions.register = function (name, actionClass) {
		_actions[name] = actionClass;
	};

	Actions.actionForType = function (name) {
		return _actions[name];
	};

	Actions.allActions = function() {
		var actions = {};
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			actions[key] = _actions[key];
		}
		return actions;
	};

	Actions.menuItems = function() {
		var keys = _.keys(_actions).sort();
		var items = {};
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			items[StringUtil.uncapitalize(key)] = { name: key };
		}
		return items;
	};

	function registerAll(args) {
		var actionsStartIndex = 2;
		for (var i = actionsStartIndex; i < args.length; i++) {
			var arg = args[i];
			var stringedFun = arg.toString();
			var type = stringedFun.substring(9, stringedFun.indexOf('('));
			Actions.register(type, arg);
		}
	}

	registerAll(arguments);

	return Actions;
});