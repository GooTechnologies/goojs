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
		// Generated the same way as entities are, except different naming.
		Object.defineProperty(this, 'id', {
			value : LogicNode.instanceCount++,
			writable : false
		});
		
		// create default configuration.
		this.config = { ref: ('unconf-' + this.id) };

		this.name = name !== undefined ? name : 'Logic_' + this.id;

                // If instantiated in a logic layer.
		this.logicInstance = null;
		
		// For now this needs to be set to true in the constructor of those who wants it, or 
		// at least before addToWorldLogic is called.
		this.wantsProcessCall = false;
	}
	
	/**
	 * Add the logic node to the world's logic layer. This is necessary a necessary step for allowing 
	 * connections. This should be called by logic node implementations.
	 *
	 * @param {world} World to add it to
	 */
	LogicNode.prototype.addToWorldLogic = function(world) {
	
	        console.log("cykel1 " + this.logicInstance);
	        if (this.logicInstance != null)
	                this.logicInstance.remove();

                console.log("pump");	                
		this.logicInstance = world.logicLayer.addInterfaceInstance(this.logicInterface, this, this.config.ref, this.wantsProcessCall);
		
	}
	
	LogicNode.prototype.configure = function(newConfig) {
	        this.onConfigure(newConfig);
	        this.config = newConfig;
        }
        
        /**
        * Override me
        */
        LogicNode.prototype.onConfigure = function(newConfig) {
        };

	LogicNode.instanceCount = 0;

	return LogicNode;
});
