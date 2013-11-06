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
	 * @class Holds the transform of an entity. It also allows for a scene graph to be created, where transforms are inherited
	 * down the tree.
	 */
	function FunctionGeneratorComponent() {
	
		Component.call(this);
		
		this.type = 'FunctionGeneratorComponent';
		this.parent = null;
		this._time = 0;
		this.logicInstance = null;
	}

	FunctionGeneratorComponent.prototype = Object.create(Component.prototype);
	
	// Output ports from this component	
	FunctionGeneratorComponent.logicInterface = new LogicInterface();
	FunctionGeneratorComponent.outportTime = FunctionGeneratorComponent.logicInterface.addOutputProperty("Time", "float");
	FunctionGeneratorComponent.outportSine = FunctionGeneratorComponent.logicInterface.addInputProperty("Sine", "float");

	// Adding
	FunctionGeneratorComponent.prototype.insertIntoLogicLayer = function(logicLayer) {
		this.logicInstance = logicLayer.addInterfaceInstance(FunctionGeneratorComponent.logicInterface, this, true);
	}

	FunctionGeneratorComponent.prototype.processLogic = function(tpf) {
		this._time += tpf;
		
		// write all outputs
		LogicLayer.writeValue(this.logicInstance, FunctionGeneratorComponent.outportTime, this._time);
		LogicLayer.writeValue(this.logicInstance, FunctionGeneratorComponent.outportSine, Math.sin(this._time));
	}

	return FunctionGeneratorComponent;

});