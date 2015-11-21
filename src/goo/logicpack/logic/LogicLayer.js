var LogicInterface = require('../../logic/LogicInterface');

	'use strict';

	/**
	 * Handles a logic layer, which is a container for Logic Nodes and connections. It handles resolving and executing
	 *        connections, as well as cross-layer connections (through LogicSystem). Each LogicLayer has an entity owner.
	 * @private
	 */
	function LogicLayer(ownerEntity) {
		this._logicInterfaces = {};
		this._connectionsBySource = {}; // REVIEW: unused?
		this._instanceID = 0;
		this._updateRound = 0;
		this._nextFrameNotifications = [];
		this.ownerEntity = ownerEntity;

		// Hax to get LogicSystem
		this.logicSystem = ownerEntity._world.getSystem('LogicSystem');
	}

	LogicLayer.prototype.clear = function () {
		this._logicInterfaces = {};
		this._connectionsBySource = {};
		this._instanceID = 0;
		this._nextFrameNotifications = [];
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
	 * @returns An instance descriptor
	 */
	LogicLayer.prototype.addInterfaceInstance = function (iface, instance, name, wantsProcessCall) {
		// if wished, autogenerate name.
		if (name === null) {
			name = '_auto-' + this._instanceID;
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
		instDesc.remove = function () {
			delete this.outConnections;
			delete _this._logicInterfaces[name];

			// nice n^2 algo here to remove all instances.
			_this.unresolveAllConnections();

		};
		instDesc.getPorts = function () {
			return iface.getPorts();
		};

		// HACK: Pick up LogicNodeEntityProxy entityRef and store it in the description too.
		if (instance.entityRef !== undefined) {
			instDesc.proxyRef = instance.entityRef;
		}

		this._logicInterfaces[name] = instDesc;

		return instDesc;
	};

	LogicLayer.prototype.unresolveAllConnections = function () {
		// Un-do all connection resolving. Processes all instances, all ports and all connections
		for (var n in this._logicInterfaces) {
			var ports = this._logicInterfaces[n].outConnections;
			if (ports === undefined) { // REVIEW: not really needed, the for loop below would not blow up or execute anything if ports were undefined
				continue;
			}

			for (var p in ports) {
				var cx = ports[p]; // REVIEW: why is an element of 'ports' called 'cx'? what is a cx?
				for (var i = 0; i < cx.length; i++) {
					if (cx[i].length > 2) {
						cx[i] = [cx[i][0], cx[i][1]];
					}
				}
			}
		}
	};

	LogicLayer.resolvePortID = function (instDesc, portName) {
		if (typeof portName === 'number') {
			return portName;
		}

		if (LogicInterface.isDynamicPortName(portName)) {
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

		console.warn('Unable to resolve port [' + portName + ']!');
		return null;
	};

	LogicLayer.prototype.resolveTargetAndPortID = function (targetRef, portName) {
		var tgt = this._logicInterfaces[targetRef];

		// can't be resolved right away, not added yet.
		if (tgt === undefined) {
			return;
		}

		// First check the proxy cases.
		if (tgt.obj.entityRef !== undefined && LogicInterface.isDynamicPortName(portName)) {
			var logicLayer2 = this.logicSystem.getLayerByEntity(tgt.obj.entityRef);
			for (var n in logicLayer2._logicInterfaces) {
				var l = logicLayer2._logicInterfaces[n];
				// if (l.obj.type === "LogicNodeInput") {
				// 	console.log(l);
				// }

				if (l.obj.type === 'LogicNodeInput' && l.obj.dummyInport !== null && LogicInterface.makePortDataName(l.obj.dummyInport)) {
					return {
						target: l,
						portID: portName
					};
				}
			}
		}

		// See if the port exists directly at that node.
		var directAttempt = LogicLayer.resolvePortID(tgt, portName);
		if (directAttempt !== null) {
			// direct connection.
			return {
				target: tgt,
				portID: directAttempt
			};
		}

		console.warn('Failed resolving target&portid to ' + targetRef + ':' + portName);
		return null;
	};

	LogicLayer.prototype.addConnectionByName = function (instDesc, sourcePort, targetName, targetPort) {
		//
		// Adding connection here which will be in unresolved state
		// [targetName, targetPort]
		//
		// when resolved they will have 4 columns

		if (instDesc.outConnections === undefined) {
			instDesc.outConnections = {};
		}

		// resolve from name
		var sourcePortID = LogicLayer.resolvePortID(instDesc, sourcePort);

		if (instDesc.outConnections[sourcePortID] === undefined) {
			instDesc.outConnections[sourcePortID] = [];
		}

		instDesc.outConnections[sourcePortID].push([targetName, targetPort]); // REVIEW: so this is a 'cx'
	};

	/**
	 * Resolve all outgoing connections from the logic instance instDesc and
	 * call the provided callback function on each connected target.
	 */
	LogicLayer.doConnections = function (instDesc, portID, func) {
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

		// Connections can be encountered as unresolved [x, y] or resolved [x, y, z, w].
		// Resolved connections contain pointers to the actual objects.

		for (var i = 0; i < cArr.length; i++) {
			var tconn = cArr[i];

			// unresolved
			if (tconn.length === 2) {
				var out = instDesc.layer.resolveTargetAndPortID(tconn[0], tconn[1]);
				if (out === null) {
					console.log('Target unresolved ' + tconn[0] + ' and ' + tconn[1]);
					// TODO: Queue write.
					continue;
				}
				tconn.push(out.target);
				tconn.push(out.portID);
			}

			// now resolved.
			func(tconn[2], tconn[3]);
		}
	};

	/**
	 * Writes a value using an instance descriptor and a portID (which must be registered through the interface the instance
	 * was created with). All connected objects get the onPropertyWrite call.
	 */
	LogicLayer.writeValue = function (instDesc, outPortID, value) {
		//
		LogicLayer.doConnections(instDesc, outPortID, function (targetDesc, portID) {
			// write
			if (targetDesc._portValues === undefined) {
				targetDesc._portValues = {};
			}

			if (targetDesc._lastNotification === undefined) {
				targetDesc._lastNotification = {};
			}

			var old = targetDesc._portValues[portID];
			targetDesc._portValues[portID] = value;

			if (old !== value) {
				var tlayer = targetDesc.layer;
				if (targetDesc._lastNotification[portID] !== tlayer._updateRound) {
					targetDesc._lastNotification[portID] = tlayer._updateRound;
					targetDesc.obj.onInputChanged(targetDesc, portID, value);
				} else {
					tlayer._nextFrameNotifications.push([targetDesc, portID, value]);
				}
			}
		});
	};

	/**
	 * Use this to write a layer to an output node, they need to be treated specially.
	 * @param outNodeDesc instDesc of the output node
	 * @param outPortDesc Port id of the output port
	 * @param value Value to write
	 */
	LogicLayer.writeValueToLayerOutput = function (outNodeDesc, outPortDesc, value) {
		// TODO: Cache writeFn
		var writeFn = outNodeDesc.layer.logicSystem.makeOutputWriteFn(outNodeDesc.layer.ownerEntity, outPortDesc);
		writeFn(value);
	};

	/**
	 * Read a (possibly cached) value from an input port on a particular node.
	 * @param instDesc instDesc of the node to read from
	 * @param portID portID of interest
	 * @returns Returns the value at the port
	 */
	LogicLayer.readPort = function (instDesc, portID) {
		// 2-step lookup. note that value will first be
		// _portValue if it exists.
		var value = instDesc._portValues;
		if (value !== undefined) {
			value = value[portID];
		} else {
			instDesc._portValues = {};
		}

		if (value !== undefined) {
			return value;
		}

		// default value - here we could look up editable. Unfortunately
		// if the default specifies 'undefined' value, reading from it will
		// repeatedly end up in this loop.
		var ports = instDesc.iface.getPorts();
		for (var n in ports) {
			if (ports[n].id === portID) {
				return instDesc._portValues[portID] = ports[n].def;
			}
		}

		console.log('Could not find the port [' + portID + ']!');
		return undefined; // REVIEW: returns undefined anyway
	};

	/**
	 * Fire an event.
	 * @param portId The port connecting the event. (Returned when registering the event port)
	 */
	LogicLayer.fireEvent = function (instDesc, outPortID) {
		LogicLayer.doConnections(instDesc, outPortID, function (targetDesc, portID) {
			targetDesc.obj.onEvent(targetDesc, portID);
		});
	};


	LogicLayer.resolveEntityRef = function (instDesc, entityRef) {
		if (entityRef === '[self]') {
			return instDesc.layer.ownerEntity;
		} else {
			return instDesc.layer.logicSystem.resolveEntityRef(entityRef);
		}
	};

	LogicLayer.prototype.process = function (tpf) {
		// First of all process queued property update notifications from last frame.
		// These are limited to one per frame and queued up if more should happen.
		// Reason for this being avoiding cyclic and infinite update loops.
		var not = this._nextFrameNotifications;
		this._nextFrameNotifications = [];
		for (var i = 0; i < not.length; i++) {
			var ne = not[i];
			ne[0]._lastNotification[ne[1]] = this._updateRound;
			ne[0].obj.onInputChanged(ne[0], ne[1], ne[2]);
		}

		// ...then update all logic objects
		for (var i in this._logicInterfaces) {
			if (this._logicInterfaces[i].wantsProcess && this._logicInterfaces[i].obj.processLogic) {
				this._logicInterfaces[i].obj.processLogic(tpf);
			}
		}

		this._updateRound++;
	};

	/**
	 * For all logic objects (i.e. those who added logicInstances and passed themselves along)
	 * @param f Function to call for every object.
	 */
	LogicLayer.prototype.forEachLogicObject = function (f) {
		for (var i in this._logicInterfaces) {
			var o = this._logicInterfaces[i].obj;
			if (o !== undefined) {
				f(o);
			}
		}
	};

	/**
	 * For all objects that follow the convention of having an logicInstance property for their connections
	 * (components, logic nodes), this is useful for less verbose connection code. It looks up the logicInstance
	 * in the objects passed in and connects their endpoints.
	 */
	LogicLayer.prototype.connectObjectsWithLogic = function (sourceObj, sourcePort, destObj, destPort) {
		this.connectEndpoints(sourceObj.logicInstance, sourcePort, destObj.logicInstance, destPort);
	};

	/**
	 * Connects two objects through their instance descriptors and port names.
	 */
	LogicLayer.prototype.connectEndpoints = function (sourceInst, sourcePort, destInst, destPort) {
		this.addConnectionByName(sourceInst, sourcePort, destInst.name, destPort);
	};

	module.exports = LogicLayer;