define(
	[
		"goo/logic/LogicInterface"
	],
	/** @lends */
	function(
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
			this._updateRound = 0;
			this._nextFrameNotifications = [];
			this._outputForwarding = {};
		}

		LogicLayer.prototype.clear = function() {
			this._logicInterfaces = {};
			this._connectionsBySource = {};
			this._instanceID = 0;
			this._nextFrameNotifications = [];
			this._outputForwarding = {};
		};

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
			if (name === null) {
				name = "_auto-" + this._instanceID;
			}

			// create the instance description
			var instDesc = {
				id: this._instanceID,
				name: name,
				obj: instance,
				iface: iface,
				layer: this,
				wantsProcess: wantsProcessCall,
			};
			
			this._instanceID++;
			
			// also supply self-destructing code
			var _this = this;
			instDesc.remove = function() {
				delete this.outConnections;
				delete _this._logicInterfaces[name];
				
				// nice n^2 algo here to remove all instances.
				_this.unresolveAllConnections();

			};
			instDesc.getPorts = function() {
				return iface.getPorts();
			};

			this._logicInterfaces[name] = instDesc;

			return instDesc;
		};
		
		LogicLayer.setupConnectionProxySource = function(instDesc, proxyRef)
		{
			// entityRef used by targets
			instDesc.proxyRef = proxyRef;
		}

		LogicLayer.prototype.unresolveAllConnections = function() {
			// Un-do all connection resolving. Processes all instances, all ports and all connections
			for (var n in this._logicInterfaces)
			{
				var ports = this._logicInterfaces[n].outConnections;
				if (ports === undefined)
					continue;
				for (var p in ports)
				{
					var cx = ports[p];
					for (var i=0;i<cx.length;i++)
						if (cx[i].length > 2)
							cx[i] = [cx[i][0], cx[i][1]];
				}
			}
		}


		LogicLayer.resolvePortID = function(instDesc, portName) {
			if (typeof portName === "number") {
				return portName;
			}

			// could be good to actually figure out if we need to do this.
			// if realPortid is a number, no need to do all this
			var ports = instDesc.getPorts();
			for (var j = 0; j < ports.length; j++) {
				if (LogicInterface.makePortDataName(ports[j]) === portName) {
					return ports[j].id;
				}
			}

			return null;
		};

		LogicLayer.prototype.resolveTargetAndPortID = function(targetRef, portName) {
			var tgt = this._logicInterfaces[targetRef];
			
			// can't be resolved right away, not added yet.
			if (tgt === undefined)
				return;

			// See if the port exists directly at that node.
			var directAttempt = LogicLayer.resolvePortID(tgt, portName);
			if (directAttempt !== null) {
				// direct connection.
				return {
					target: tgt,
					portID: directAttempt
				};
			} else if (tgt.obj.entityRef !== undefined) {
				// this case is for proxy nodes.
				console.log("Resolving entity ref " + tgt.obj.entityRef);
				for (var i = 0; i < 100; i++) {
					// Go throug components and try resolving them to entity components.
					// Brute force by <entityname>~<componentIndex> and we know they have that
					// name once instantiated. Once we fail to find a component, abort.
					var compIName = tgt.obj.entityRef + "~" + i;
					var compInterface = this._logicInterfaces[compIName];

					if (compInterface === undefined) {
						break;
					}

					var compAttempt = LogicLayer.resolvePortID(compInterface, portName);
					if (compAttempt !== null) {
						return {
							target: compInterface,
							portID: compAttempt
						};
					}
				}
			}
			
			console.warn("Failed resolving target&portid to " + targetRef + ":" + portName);
			return null;
		};

		LogicLayer.prototype.addConnectionByName = function(instDesc, sourcePort, targetName, targetPort) {
			//
			// Adding connection here which will be in unresolved state
			// [targetName, targetPort]
			//
			// resolved have 4 columns

			if (instDesc.outConnections === undefined) {
				instDesc.outConnections = {};
			}

			// This is a proxy object for an entity component. Whenever it wants
			// to send outputs, it needs to look up through _outputForwarding
			if (instDesc.obj !== undefined && instDesc.obj.entityRef !== undefined)
			{
				// note that in this case we are not using resolved connection
				// names. connections are then magically trickeried
				this._outputForwarding[instDesc.obj.entityRef] = instDesc;
			}
			else
			{
				// if not proxy always resolve
				sourcePort = LogicLayer.resolvePortID(instDesc, sourcePort);
			}

			if (instDesc.outConnections[sourcePort] === undefined) {
				instDesc.outConnections[sourcePort] = [];
			}

			instDesc.outConnections[sourcePort].push([targetName, targetPort]);
		};

		/**
		 * Writes a value using an instance descriptor and a portID (which must be registered through the interface the instance
		 * was created with). All connected objects get the onPropertyWrite call.
		 */
		LogicLayer.writeValue = function(instDesc, portID, value) {
			// See if there are any connections at all
			if (instDesc.outConnections === undefined) {
				if (instDesc.proxyRef === undefined)
					return;
				
				// leads to the proxying object for this (linked together by proxyRef)
				var next = instDesc.layer._outputForwarding[instDesc.proxyRef];
				if (next === undefined || next.outConnections === undefined)
					return;
				
				var added = 0;
				for (var cn in next.outConnections)
				{
					var c = next.outConnections[cn];
					if (LogicLayer.resolvePortID(instDesc, cn) != null)
					{
						for (var i=0;i<c.length;i++)
							instDesc.layer.addConnectionByName(instDesc, cn, c[i][0], c[i][1]);
						added += c.length;
					}
				}
				
				if (added == 0)
					return;
					
				console.log(added + " connections imported from proxy object");
				LogicLayer.writeValue(instDesc, portID, value);
				return;
			}
			
			var cArr = instDesc.outConnections[portID];
			if (cArr === undefined) {
				return;
			}

			if (cArr.length === 0) {
				delete instDesc.outConnections;
			}
			
			// Write to all connected instances	
			for (var i = 0; i < cArr.length; i++) {
				var tconn = cArr[i];

				// unmapped
				if (tconn.length === 2) {
					var out = instDesc.layer.resolveTargetAndPortID(tconn[0], tconn[1]);
					if (out == null) {
						console.log("Target unresolved " + tconn[0] + " and " + tconn[1]);
						continue;
					}

					tconn.push(out.target);
					tconn.push(out.portID);
				}
				
				var targetDesc = tconn[2];
				if (targetDesc._portValues === undefined)
					targetDesc._portValues = {};
				if (targetDesc._lastNotification === undefined)
					targetDesc._lastNotification = {};
					
				// this is the resolved real port id
				var portID = tconn[3];
				
				var old = targetDesc._portValues[portID];
				targetDesc._portValues[portID] = value;
				
				if (old !== value)
				{
					var tlayer = targetDesc.layer;

					if (targetDesc._lastNotification[portID] !== tlayer._updateRound)
					{
						targetDesc._lastNotification[portID] = tlayer._updateRound;
						targetDesc.obj.onInputChanged(targetDesc, portID, value);
					}
					else
					{
						tlayer._nextFrameNotifications.push([targetDesc, portID, value]);
					}
				}
			}
		};
		
		LogicLayer.readPort = function(instDesc, portID) {
			// 2 step lookup. note that value will first be
			// _portValue if it exists. 
			var value = instDesc._portValues;
			if (value !== undefined)
				value = value[portID];
			else
				instDesc._portValues = {};
				
			if (value !== undefined)
				return value;
			
			// default value - here we could look up editable. Unfortunately
			// if the default specifies 'undefined' value, reading from it will
			// repeatedly end up in this loop.
			var ports = instDesc.iface.getPorts();
			for (var n in ports)
				if (ports[n].id == portID)
					return instDesc._portValues[portID] = ports[n].def;
					
			console.log("Could not find the port [" + portID + "]!");
			return undefined;
		}

		/**
		 * Fire an event.
		 * @param portId The port connecting the event. (Returned when registering the event port)
		 */
		LogicLayer.fireEvent = function(instDesc, portID) {
			// See if there are any connections at all
			if (instDesc.outConnections === undefined) {
				return;
			}

			var cArr = instDesc.outConnections[portID];
			if (cArr === undefined) {
				return;
			}

			// Write to all connected instances	
			for (var i = 0; i < cArr.length; i++) {
				var tconn = cArr[i];
				var tgt = instDesc.layer._logicInterfaces[tconn[0]];
				if (tgt === undefined) {
					continue; // unresolved.
				}

				// unmapped
				if (tconn.length === 2) {
					var out = instDesc.layer.resolveTargetAndPortID(tconn[0], tconn[1]);
					if (out == null) {
						console.log("Target unresolved " + tconn[0] + " and " + tconn[1]);
						continue;
					}

					tconn.push(out.target);
					tconn.push(out.portID);
				}

				tconn[2].obj.onEvent(tconn[3]);
			}
		};

		LogicLayer.prototype.process = function(tpf) {
		
			// last frame queued property update notifications, see writeValue
			var not = this._nextFrameNotifications;
			this._nextFrameNotifications = [];

			for (var i=0;i<not.length;i++)
			{
				var ne = not[i];
				ne[0]._lastNotification[ne[1]] = this._updateRound;
				ne[0].obj.onInputChanged(ne[0], ne[1], ne[2]); 
			}
			
			
			for (var i in this._logicInterfaces) {
				if (this._logicInterfaces[i].wantsProcess && this._logicInterfaces[i].obj.processLogic) {
					this._logicInterfaces[i].obj.processLogic(tpf);
				}
			}
			
			this._updateRound++;
		};

		/**
		* For all logic objects (i.e. those who added logicInstances and passed themselves along)
		*/		
		LogicLayer.prototype.forEachLogicObject = function(f) {
			for (var i in this._logicInterfaces) {
				var o = this._logicInterfaces[i].obj;
				if (o !== undefined)
					f(o);
			}
		};

		/**
		 * For all objects that follow the convention of having an logicInstance property for their connections
		 * (components, logic nodes), this is useful for less verbose connection code. It looks up the logicInstance
		 * in the objects passed in and connects their endpoints.
		 */
		LogicLayer.prototype.connectObjectsWithLogic = function(sourceObj, sourcePort, destObj, destPort) {
			this.connectEndpoints(sourceObj.logicInstance, sourcePort, destObj.logicInstance, destPort);
		};

		/**
		 * Connects two objects through their instance descriptors and port names.
		 */
		LogicLayer.prototype.connectEndpoints = function(sourceInst, sourcePort, destInst, destPort) {
			this.addConnectionByName(sourceInst, sourcePort, destInst.name, destPort);
		};

		return LogicLayer;
	});