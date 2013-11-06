define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Describes all the inputs / outputs for this logic interface. Typically one instance of this class exists for every class that
	 *        implements logic.
	 */
	function LogicInterface() {
		this.ports = [];
		this.portID = 0;
		// This interface is what binds (otherwise anonymous) endpoints in the logic layer to something named
	}
	
	LogicInterface.prototype.addInputProperty = function(name_, valueType, defaultValue) {
		this.ports.push({ id: ++this.portID, input: true, property: true, event:false, name: name_, type: valueType, def: defaultValue });
		return this.portID;
	}
	
	LogicInterface.prototype.addOutputProperty = function(name_, valueType) {
		this.ports.push({ id: ++this.portID, input: false, property: true, event:false, name: name_, type: valueType });
		return this.portID;
	}
	
	LogicInterface.prototype.oddInputEvent = function(name_) {
		this.ports.push({ id: ++this.portID, input: false, property: false, event: true, name: name_ });
		return this.portID;
	}

	LogicInterface.prototype.oddOutputEvent = function(name_) {
		this.port.push({ id: ++this.portID, input: false, property: false, event: true, name: name_ });
		return this.portID;
	}
	
	LogicInterface.prototype.getPorts = function() {
		return this.ports;
	}

	return LogicInterface;
});