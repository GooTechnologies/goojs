define([
	'goo/statemachine/StateUtils',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
StateUtils,
_
) {
	"use strict";

	var _actions = {};

	var Actions = {
		register:function (name, actionClass) {
			_actions[name] = actionClass;
		},

		actionForType: function (name) {
			return _actions[name];
		},

		allActions: function() {
			return _actions;
		},

		menuItems: function() {
			var keys = _.keys(_actions).sort();
			var items = {};
			for (var i = 0; i < keys.length; i++){
				var key = keys[i];
				items[StateUtils.uncapitalizeFirst(key)] = {name:key};
			}
			return items;
		}
	};

	return Actions;
});