define(
	[
	"goo/logic/LogicInterface"
	]
	,
	/** @lends */
	function 
	(
		LogicInterface
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
	* @param iface The interface descriptor (LogicInterface) for the object 'instance'
	* @param instance The object that exposes the logic interface defined by iface.
	* @param name The name (ref) for adding connections by name. Supply null for automatically generated name.
	* @param wantsProcessCall If the instance passed wants processLogic per-frame calls
	* @return An instance descriptor 
	*/
	LogicLayer.prototype.addInterfaceInstance = function(iface, instance, name, wantsProcessCall) {
		
		// if wished, autogenerate name.
		if (name === null)
			name = "_auto-" + this._instanceID;
		
		// create the instance description
		var instDesc = { id: this._instanceID, name: name, obj: instance, iface: iface, layer: this, wantsProcess: wantsProcessCall };
		this._instanceID++;
		
		// also supply self-destructing code
		var _this = this;
		instDesc.remove = function() {
			delete _this._logicInterfaces[name];
		}
		instDesc.getPorts = function() {
			return iface.getPorts(); 
		}

		this._logicInterfaces[name] = instDesc;

		return instDesc;
	}
	
	LogicLayer.resolvePortID = function(instDesc, portName)
	{
		if (typeof portName == "number")
			return portName;
			
		// could be good to actually figure out if we need to do this.
		// if realPortid is a number, no need to do all this
		var ports = instDesc.getPorts();
		for (var j=0;j<ports.length;j++)
		{
			if (LogicInterface.makePortDataName(ports[j]) == portName)
			{
				return ports[j].id;
			}
		}
		
		console.log("Failed to resolve port");
	}
	
	LogicLayer.prototype.addConnectionByName = function(instDesc, sourcePort, targetName, targetPort) {
		//
		// Adding connection here which will be in unresolved state
		// [targetName, targetPort]
		//
		// (TODO: When resolved a 3rd column is adedd containing the direct pointer)
		
		sourcePort = LogicLayer.resolvePortID(instDesc, sourcePort);
		
		if (instDesc.outConnections === undefined)
			instDesc.outConnections = {}
		
		if (instDesc.outConnections[sourcePort] === undefined)
			instDesc.outConnections[sourcePort] = [];
		
		instDesc.outConnections[sourcePort].push([targetName, targetPort]);
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
			
		if (cArr.length == 0)
			delete instDesc.outConnections;
				
		// Write to all connected instances	
		for (var i = 0;i < cArr.length;i++)
		{
			var tconn = cArr[i];
			var tgt = instDesc.layer._logicInterfaces[tconn[0]];
			if (tgt === undefined)
				continue; // unresolved.
			
			// unmapped
			if (tconn.length == 2)
			{
				var realPortId = LogicLayer.resolvePortID(tgt, tconn[1]);
				tconn.push(realPortId);
			}
			
			// use mapped port name
			tgt.obj.onPropertyWrite(cArr[i][2], value);
		}
	}

	/**
	* Fire an event.
	* @param portId The port connecting the event. (Returned when registering the event port)
	*/
	LogicLayer.fireEvent = function(instDesc, portID) {
		// See if there are any connections at all
		if (instDesc.outConnections === undefined)
			return;
			
		var cArr = instDesc.outConnections[portID];
		if (cArr === undefined)
			return;
		
		// Write to all connected instances	
		for (var i = 0;i < cArr.length;i++)
		{
			var tconn = cArr[i];
			var tgt = instDesc.layer._logicInterfaces[tconn[0]];
			if (tgt === undefined)
				continue; // unresolved.

			// unmapped
			if (tconn.length == 2)
			{
				var realPortId = LogicLayer.resolvePortID(tgt, tconn[1]);
				tconn.push(realPortId);
			}

			tgt.obj.onEvent(cArr[i][2]);
		}
	}
	
	LogicLayer.prototype.process = function(tpf) {
		for (var i in this._logicInterfaces)
		{
			if (this._logicInterfaces[i].wantsProcess)
				this._logicInterfaces[i].obj.processLogic(tpf);
		}
	}
	
	/**
	* For all objects that follow the convention of having an logicInstance property for their connections
	* (components, logic nodes), this is useful for less verbose connection code. It looks up the logicInstance
	* in the objects passed in and connects their endpoints.
	*/
	LogicLayer.prototype.connectObjectsWithLogic = function(sourceObj, sourcePort, destObj, destPort) {
		this.connectEndpoints(sourceObj.logicInstance, sourcePort, destObj.logicInstance, destPort);	
	}
	
	/**
	* Connects two objects through their instance descriptors and port names.
	*/
	LogicLayer.prototype.connectEndpoints = function(sourceInst, sourcePort, destInst, destPort) {
		this.addConnectionByName(sourceInst, sourcePort, destInst.name, destPort);
	}
	
	return LogicLayer;
});