define(
	/** @lends */
	function (LogicNodes) {
	"use strict";

	/**
	 * @class Base class/module for all logic boxes
	 */
	function LogicNodes() {
	}
	
	
	LogicNodes.types = { };
	
	/**
	 */
	LogicNodes.registerType = function(name, fn) {
                console.log("Registered [" + name + "]");
	        LogicNodes.types[name] = { fn: fn, desc: "Desc: " + name, editorName: "EN:" + name };
	}
	
	LogicNodes.getInterfaceByName = function(name) {
                console.log("looking up " + name);
	        return LogicNodes.types[name].fn.logicInterface;
	}
	
	LogicNodes.getAllTypes = function() {
                var out = [];
	        for (var n in LogicNodes.types)
	                out.push(n);

                console.log("returning types " + out);	                
                return out;
	}

	return LogicNodes;
});
