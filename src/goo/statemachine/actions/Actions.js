define([
	'goo/statemachine/StateUtils',
	'goo/util/ObjectUtil',

	'goo/statemachine/actions/LogVariableAction',
	'goo/statemachine/actions/SetNumberAction',
	'goo/statemachine/actions/AddPositionAction',
	'goo/statemachine/actions/MouseClickAction',
	'goo/statemachine/actions/SetPositionAction',
	'goo/statemachine/actions/AddVariableAction',
	'goo/statemachine/actions/MouseMoveAction',
	'goo/statemachine/actions/SetRotationAction',
	'goo/statemachine/actions/AddVectorAction',
	'goo/statemachine/actions/MultiplyVariableAction',
	'goo/statemachine/actions/TestAngleAction',
	'goo/statemachine/actions/EventListenerAction',
	'goo/statemachine/actions/NumberCompareAction',
	'goo/statemachine/actions/TestCollisionAction',
	'goo/statemachine/actions/FollowEntityAction',
	'goo/statemachine/actions/RandomEventAction',
	'goo/statemachine/actions/TestSpeedAction',
	'goo/statemachine/actions/GetPositionAction',
	'goo/statemachine/actions/ScriptAction',
	'goo/statemachine/actions/TweenAction',
	'goo/statemachine/actions/GuiButtonAction',
	'goo/statemachine/actions/SetAnimationAction',
	'goo/statemachine/actions/TweenPositionAction',
	'goo/statemachine/actions/KeyDownAction',
	'goo/statemachine/actions/SetClearColorAction',
	'goo/statemachine/actions/TweenRotationAction',
	'goo/statemachine/actions/KeyPressAction',
	'goo/statemachine/actions/SetCssPropertyAction',
	'goo/statemachine/actions/WaitAction',
	'goo/statemachine/actions/KeyUpAction',
	'goo/statemachine/actions/SetLightRangeAction'
],
/** @lends */
function(
	StateUtils,
	_
) {
	"use strict";

	var _actions = {};

	var Actions = {};

	Actions.register = function (name, actionClass) {
		console.log('action register', '|'+name+'|');
		_actions[name] = actionClass;
	};

	Actions.actionForType = function (name) {
		return _actions[name];
	};

	Actions.allActions = function() {
		return _actions; // should return a shallow copy and not the array itself
	};

	Actions.menuItems = function() {
		var keys = _.keys(_actions).sort();
		var items = {};
		for (var i = 0; i < keys.length; i++){
			var key = keys[i];
			items[StateUtils.uncapitalizeFirst(key)] = {name:key};
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