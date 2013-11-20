define([
	'goo/logic/LogicInterface',
	'goo/logic/LogicLayer',
	'goo/entities/components/Component'
],
/** @lends */
function (
	LogicInterface,
	LogicLayer,
	Component
) {
	"use strict";

	/**
	*
	 */
	function LogicComponent() {
	
		Component.call(this);
		
		this.type = 'LogicComponent';
		this.parent = null;
		this._time = 0;
		this.logicInstance = null;
		this.logicLayer = null;
	}

	LogicComponent.prototype = Object.create(Component.prototype);
	
	// Output ports from this component	
	LogicComponent.logicInterface = new LogicInterface();

	// Adding
	LogicComponent.prototype.insertIntoLogicLayer = function(logicLayer, name) {
		this.logicInstance = logicLayer.addInterfaceInstance(LogicComponent.logicInterface, this, name, true);
	}

	return LogicComponent;

});