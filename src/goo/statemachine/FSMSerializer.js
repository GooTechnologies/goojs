define([
	'goo/statemachine/FSMComponent',
	'goo/statemachine/actions/TweenAction',
	'goo/statemachine/actions/KeyPressAction',
	'goo/statemachine/actions/KeyDownAction',
	'goo/statemachine/actions/KeyUpAction',
	'goo/statemachine/actions/SetCssPropertyAction',
	'goo/statemachine/actions/GuiButtonAction',
	'goo/statemachine/actions/WaitAction',
	'goo/statemachine/actions/ScriptAction',
	'goo/statemachine/actions/RandomEventAction',
	'goo/statemachine/actions/EventListenerAction',
	'goo/statemachine/actions/NumberCompareAction',
	'goo/statemachine/actions/SetNumberAction',
	'goo/statemachine/actions/SetPositionAction',
	'goo/statemachine/actions/AddPositionAction',
	'goo/statemachine/actions/SetClearColorAction',
	'goo/statemachine/actions/TweenPositionAction',
	'goo/statemachine/actions/TweenRotationAction',
	'goo/statemachine/actions/TestCollisionAction',
	'goo/statemachine/actions/AddVectorAction'
],
/** @lends */
function (
	FSMComponent,
	TweenAction,
	KeyPressAction,
	KeyDownAction,
	KeyUpAction,
	SetCssPropertyAction,
	GuiButtonAction,
	WaitAction,
	ScriptAction,
	RandomEventAction,
	EventListenerAction,
	NumberCompareAction,
	SetNumberAction,
	SetPositionAction,
	AddPositionAction,
	SetClearColorAction,
	TweenPositionAction,
	TweenRotationAction,
	TestCollisionAction,
	AddVectorAction
) {
	"use strict";

	/**
	 * @class Serializes FSMs
	 */
	function FSMSerializer() {
	}

	FSMSerializer.prototype.toJson = function (fsmComponent) {
		var fsmObj = {
			globalVariables: FSMComponent.globalVariables,
			localVariables: fsmComponent.localVariables,
			states: [],
			initialState: fsmComponent.initialState
		};

		for (var i = 0; i < fsmComponent.stateList.length; i++) {
			var state = fsmComponent.stateList[i];

			var stateObj = {
				name: state.name,
				id: state.id,
				actions: [],
				events: state.getEvents(),
				transitions: {}
			};
			fsmObj.states.push(stateObj);

			for (var j = 0; j < state.actions.length; j++) {
				var action = state.actions[j];

				var actionObj = {
					type: action.type,
					data: {}
				};
				stateObj.actions.push(actionObj);

				for (var actionKey in action.external) {
					actionObj.data[actionKey] = action[actionKey];
				}
			}

			for (var transitionKey in state.transitions) {
				stateObj.transitions[transitionKey] = state.transitions[transitionKey];
			}
		}

		return fsmObj;
	};

	FSMSerializer.prototype.fromJson = function (json) {
		var fsmComponent = new FSMComponent();

		for (var glob in json.globalVariables) {
			FSMComponent.globalVariables[glob] = json.globalVariables[glob];
		}
		fsmComponent.localVariables = json.localVariables;

		for (var i = 0; i < json.states.length; i++) {
			var stateObj = json.states[i];

			var state = fsmComponent.createState(stateObj.name, stateObj.id);

			for (var j = 0; j < stateObj.actions.length; j++) {
				var actionObj = stateObj.actions[j];

				var type = actionObj.type;
				var data = actionObj.data;

				var ActionFunction = eval(type);
				var action = new ActionFunction(data);
				state.addAction(action);
			}

			for (var j = 0; j < stateObj.events.length; j++) {
				var eventObj = stateObj.events[j];
				state.addEvent(eventObj);
			}

			for (var transitionKey in stateObj.transitions) {
				state.addTransition(transitionKey, stateObj.transitions[transitionKey]);
			}
		}

		fsmComponent.setStartState(json.initialState);

		return fsmComponent;		
	};

	return FSMSerializer;
});