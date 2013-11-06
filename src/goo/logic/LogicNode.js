define(
       ['goo/logic/LogicInterface']
       ,
	/** @lends */
	function (LogicInterface) {
	"use strict";

	/**
	 * @class Base class/module for all logic boxes
	 */
	function LogicNode() {
	
		Object.defineProperty(this, 'id', {
			value : LogicNode.instanceCount++,
			writable : false
		});
		this.name = name !== undefined ? name : 'Logic_' + this.id;
		this.logicInstance = null;
		
		// For now this needs to be set to true in the constructor of those who wants it, or 
		// at least before addToWorldLogic is called.
		this.wantsProcessCall = false;
	}
	
	LogicNode.prototype.addToWorldLogic = function(world, withProcess) {
		this.logicInstance = world.logicLayer.addInterfaceInstance(this.logicInterface, this, this.wantsProcessCall);
	}
	
	LogicNode.prototype.process = function() {
	}
	
	LogicNode.instanceCount = 0;

	return LogicNode;
});
