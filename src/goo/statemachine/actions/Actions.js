define([
	'goo/statemachine/Util',
	'goo/Util/ObjectUtil'
],
/** @lends */
function(
Util,
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
				items[Util.uncapitalizeFirst(key)] = {name:key};
			}	
			return items;
		}
	}
	
	return Actions;
});