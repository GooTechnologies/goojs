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
		}

		LogicLayer.prototype.clear = function() {
			this._logicInterfaces = {};
			this._connectionsBySource = {};
			this._instanceID = 0;
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
				wantsProcess: wantsProcessCall
			};
			this._instanceID++;

			// also supply self-destructing code
			var _this = this;
			instDesc.remove = function() {
				delete this.outConnections;
				delete _this._logicInterfaces[name];
			};
			instDesc.getPorts = function() {
				return iface.getPorts();
			};

			this._logicInterfaces[name] = instDesc;

			return instDesc;
		};

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
			// (TODO: When resolved a 3rd column is adedd containing the direct pointer)

			sourcePort = LogicLayer.resolvePortID(instDesc, sourcePort);

			if (instDesc.outConnections === undefined) {
				instDesc.outConnections = {};
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

				// use mapped target & port name
				tconn[2].obj.onPropertyWrite(tconn[3], value);
			}
		};

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
			for (var i in this._logicInterfaces) {
				if (this._logicInterfaces[i].wantsProcess && this._logicInterfaces[i].obj.processLogic) {
					this._logicInterfaces[i].obj.processLogic(tpf);
				}
			}
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