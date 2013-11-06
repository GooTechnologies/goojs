define(
	/** @lends */
	function (
	) {
	
	"use strict";

	/**
	 * @class Handles the logic layer of the world. 
	 */
	function LogicLayer(entityManager) {
		this._logicInterfaces = {};
		this._connectionsBySource = {};
		this._instanceID = 0;
	}

	/**
	* Creates an active instance (node) of logic described by iface parameter, tied to an instance of some other object.
	* The instance is expected to implement onPropertyWrite and onEvent but can be of any class. The instance descriptor
	* returned can then be used to make connections through connectEndPoints
	* 
	* @return An instance descriptor 
	*/
	LogicLayer.prototype.addInterfaceInstance = function(iface, instance) {
		// create the instance description
		var instDesc = { id: this._instanceID, obj: instance, iface: iface, layer: this };
		this._logicInterfaces[this._instanceID++] = instDesc;
		return instDesc;
	}
	
	/**
	* Writes a value using an instance descriptor and a portID (which must be registered through the interface the instance
	* was created with). All connected objects get the onPropertyWrite call.
	*/
	LogicLayer.writeValue = function(instDesc, portID, value) {
		// See if there are any connections at all
		if (instDesc.outConnections === undefined)
			return;
			
		var cArr = instDesc.outConnections[portID];
		if (cArr === undefined)
			return;
		
		// Write to all connected instances	
		for (var i = 0;i < cArr.length;i++)
			cArr[i][0].obj.onPropertyWrite(cArr[i][1], value);
	}
	
	/**
	* Connects two objects through their instance descriptors and port names.
	*/
	LogicLayer.connectEndpoints = function(sourceInst, sourcePort, destInst, destPort) {
	
		var layer = sourceInst.layer;
		if (layer !== destInst.layer)
			console.warn("Broken layer linking!");
			
		// Note: An option might be to store this in a connection list in the LogicLayer
		//       (which was the original idea), but write into the sourceInst description instead.
		
		if (sourceInst.outConnections == undefined)
			sourceInst.outConnections = {};
		if (sourceInst.outConnections[sourcePort] == undefined)
			sourceInst.outConnections[sourcePort] = [];
		
		var connectionDef = [destInst, destPort];
		sourceInst.outConnections[sourcePort].push(connectionDef);	
		console.log("Connected from sourcePort to destPort " + sourcePort + "/" + destPort);
	}
	
	return LogicLayer;
});