define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Describes all the inputs / outputs for this logic interface. Typically one instance of this class exists for every class that
	 *        implements logic.
	 */
	function LogicInterface(name) {
		this.ports = [];
		
		// Name builds the data name prefix
		if (name === undefined)
			this.dn_pfx = "";
		else
			this.dn_pfx = name + "-";
	}
	
	LogicInterface.prototype.addInputProperty = function(name_, valueType, defaultValue) {
		this.ports.push({ id: ++LogicInterface.portID, input: true, property: true, event:false, name: (this.dn_pfx + name_), type: valueType, def: defaultValue });
		return LogicInterface.portID;
	}
	
	LogicInterface.prototype.addOutputProperty = function(name_, valueType) {
		this.ports.push({ id: ++LogicInterface.portID, input: false, property: true, event:false, name: (this.dn_pfx + name_), type: valueType });
		return LogicInterface.portID;
	}
	
	LogicInterface.prototype.addInputEvent = function(name_) {
		this.ports.push({ id: ++LogicInterface.portID, input: true, property: false, event: true, name: (this.dn_pfx + name_) });
		return LogicInterface.portID;
	}

	LogicInterface.prototype.addOutputEvent = function(name_) {
		this.ports.push({ id: ++LogicInterface.portID, input: false, property: false, event: true, name: (this.dn_pfx + name_) });
		return LogicInterface.portID;
	}
	
	LogicInterface.prototype.getPorts = function() {
		return this.ports;
	}
	
	/**
	* Computes a name for the port that can be saved in the data model without having it confused when (other) ports are added/removed
	*/
	LogicInterface.makePortDataName = function(port) {
		if (port.dataname !== undefined)
			return port.dataname;
		else
		{
			return "dn-" + port.name;
		}
	}
	
	LogicInterface.assignPortDataName = function(port, dataname) {
		port.dataname = dataname;
	}

	/**
	* Globally unique port id counter
	*/
	LogicInterface.portID = 0;
	
	return LogicInterface;
});