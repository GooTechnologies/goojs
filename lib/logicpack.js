/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([11],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(385);


/***/ },

/***/ 385:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		LogicInterface: __webpack_require__(386),
		LogicLayer: __webpack_require__(387),
		LogicNode: __webpack_require__(388),
		LogicNodeAdd: __webpack_require__(389),
		LogicNodeApplyMatrix: __webpack_require__(391),
		LogicNodeConstVec3: __webpack_require__(392),
		LogicNodeDebug: __webpack_require__(393),
		LogicNodeEntityProxy: __webpack_require__(394),
		LogicNodeFloat: __webpack_require__(395),
		LogicNodeInput: __webpack_require__(396),
		LogicNodeInt: __webpack_require__(397),
		LogicNodeLightComponent: __webpack_require__(398),
		LogicNodeMax: __webpack_require__(399),
		LogicNodeMeshRendererComponent: __webpack_require__(400),
		LogicNodeMouse: __webpack_require__(401),
		LogicNodeMultiply: __webpack_require__(402),
		LogicNodeMultiplyFloat: __webpack_require__(403),
		LogicNodeOutput: __webpack_require__(404),
		LogicNodeRandom: __webpack_require__(405),
		LogicNodeRotationMatrix: __webpack_require__(406),
		LogicNodes: __webpack_require__(390),
		LogicNodeSine: __webpack_require__(407),
		LogicNodeSub: __webpack_require__(408),
		LogicNodeTime: __webpack_require__(409),
		LogicNodeTransformComponent: __webpack_require__(410),
		LogicNodeVec3: __webpack_require__(411),
		LogicNodeVec3Add: __webpack_require__(412),
		LogicNodeWASD: __webpack_require__(413),
		LogicNodeWASD2: __webpack_require__(414),
		LogicComponent: __webpack_require__(415),
		LogicComponentHandler: __webpack_require__(416),
		LogicSystem: __webpack_require__(417)
	};
	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 386:
/***/ function(module, exports) {

	/**
	 * @private
	 * Describes all the inputs / outputs for this logic interface. Typically one instance of this class exists for every class that
	 *        implements logic.
	 */
	function LogicInterface(name) {
		this.ports = [];
		this.configOpts = [];

		// Name builds the data name prefix
		if (name === undefined) {
			this.dn_pfx = '';
		} else {
			this.dn_pfx = name + '-';
		}
	}

	LogicInterface.prototype.addInputProperty = function (name_, valueType, defaultValue) {
		this.ports.push({
			id: ++LogicInterface._portID,
			input: true,
			property: true,
			event: false,
			name: (this.dn_pfx + name_),
			type: valueType,
			def: defaultValue
		});
		return LogicInterface._portID;
	};

	LogicInterface.prototype.addOutputProperty = function (name_, valueType) {
		this.ports.push({
			id: ++LogicInterface._portID,
			input: false,
			property: true,
			event: false,
			name: (this.dn_pfx + name_),
			type: valueType
		});
		return LogicInterface._portID;
	};

	LogicInterface.prototype.addInputEvent = function (name_) {
		this.ports.push({
			id: ++LogicInterface._portID,
			input: true,
			property: false,
			event: true,
			name: (this.dn_pfx + name_)
		});
		return LogicInterface._portID;
	};

	LogicInterface.prototype.addOutputEvent = function (name_) {
		this.ports.push({
			id: ++LogicInterface._portID,
			input: false,
			property: false,
			event: true,
			name: (this.dn_pfx + name_)
		});
		return LogicInterface._portID;
	};

	LogicInterface.createDynamicInput = function (name_) {
		return {
			id: LogicInterface.makeDynamicId(),
			input: true,
			property: true,
			event: true,
			dynamic: true,
			name: name_
		};
	};

	LogicInterface.createDynamicOutput = function (name_) {
		return {
			id: LogicInterface.makeDynamicId(),
			input: false,
			property: true,
			event: true,
			dynamic: true,
			name: name_
		};
	};

	/*
	 * The config entry here is an object containing all the parameters that go into the automatically
	 * generated goo-property-edit when editing the schematics
	 */
	LogicInterface.prototype.addConfigEntry = function (conf) {
		this.configOpts.push(conf);
	};

	LogicInterface.prototype.getConfigEntries = function () {
		return this.configOpts;
	};

	LogicInterface.prototype.getPorts = function () {
		return this.ports;
	};

	LogicInterface.isDynamicPortName = function (name) {
		return name[0] === '$';
	};

	LogicInterface.makeDynamicId = function () {
		return ++LogicInterface._portID;
	};

	/**
	 * Computes a name for the port that can be saved in the data model without having it confused when (other) ports are added/removed
	 * @param port Port description object as returned by createDynamicInput/Output or from the getPorts() array.
	 */
	LogicInterface.makePortDataName = function (port) {
		if (port.dataname !== undefined) {
			return port.dataname;
		} else {
			var prefix = port.input ? 'in-' : 'out-';
			if (port.property) {
				prefix += 'prop-';
			}
			if (port.event) {
				prefix += 'event-';
			}

			// tag dynamic ports with $ at the start so they can be routed
			// properly.
			var dyn = (port.dynamic === true) ? '$' : '';
			return dyn + prefix + port.name;
		}
	};

	LogicInterface.assignPortDataName = function (port, dataname) {
		port.dataname = dataname;
	};

	/**
	 * Globally unique port id counter
	 */
	LogicInterface._portID = 0;

	module.exports = LogicInterface;

/***/ },

/***/ 387:
/***/ function(module, exports, __webpack_require__) {

	var LogicInterface = __webpack_require__(386);

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

/***/ },

/***/ 388:
/***/ function(module, exports) {

	/**
	 * Base class/module for all logic boxes
	 * @private
	 */
	function LogicNode() {
		// Generated the same way as entities are, except different naming.
		Object.defineProperty(this, 'id', {
			value: LogicNode._instanceCount++,
			writable: false
		});

		// create default configuration.
		this.config = {
			ref: 'unconf-' + this.id
		};

		this.name = name !== undefined ? name : 'Logic_' + this.id;

		// If instantiated in a logic layer.
		this.logicInstance = null;

		// For now this needs to be set to true in the constructor of those who wants it, or
		// at least before addToWorldLogic is called.
		this.wantsProcessCall = false;
	}

	/**
	 * Add the logic node to the world's logic layer. This is a necessary step for allowing
	 * connections. This should be called by logic node implementations.
	 *
	 * @param {world} World to add it to
	 */
	LogicNode.prototype.addToLogicLayer = function (logicLayer, withId) {
		// Cleanup of previous; this will also remove connections so we always need to (re-) add them.
		if (this.logicInstance !== null) {
			this.logicInstance.remove();
		}

		this.logicInstance = logicLayer.addInterfaceInstance(this.logicInterface, this, withId, this.wantsProcessCall);

		if (this.connections !== undefined) {
			// data comes from configure call.
			for (var i = 0; i < this.connections.length; i++) {
				var conn = this.connections[i];
				logicLayer.addConnectionByName(this.logicInstance, conn.sourcePort, conn.targetRef, conn.targetPort);
			}

			// this prevents duplicate adding.
			delete this.connections;
		}
	};

	LogicNode.prototype.configure = function (nodeData) {
		var c = (nodeData.config !== undefined) ? nodeData.config : {};
		this.onConfigure(c);
		this.config = c;
		this.connections = nodeData.connections;
	};

	/**
	 * Called after getting new configuration data; before getting added to world. Override
	 * this function and not configure.
	 * @param newConfig The new configuration data.
	 */
	LogicNode.prototype.onConfigure = function () {};

	/**
	 * When logic system is started.
	 */
	LogicNode.prototype.onSystemStarted = function () {};

	/**
	 * Called when system is stopped.
	 * @param stopForPause If true, world has been paused. Otherwise stopped & reset.
	 */
	LogicNode.prototype.onSystemStopped = function () {};

	/**
	 * Called when node receives an input value.
	 * @param instDesc Instance description
	 * @param port Port ID
	 * @param nv New value on that particular port.
	 */
	LogicNode.prototype.onInputChanged = function () {};

	LogicNode._instanceCount = 0;

	module.exports = LogicNode;

/***/ },

/***/ 389:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node to add values.
	 * @private
	 */
	function LogicNodeAdd() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeAdd.logicInterface;
		this.type = 'LogicNodeAdd';
	}

	LogicNodeAdd.prototype = Object.create(LogicNode.prototype);
	LogicNodeAdd.editorName = 'Add';

	LogicNodeAdd.prototype.onInputChanged = function (instDesc) {
		var out = LogicLayer.readPort(instDesc, LogicNodeAdd.inportX) +
			LogicLayer.readPort(instDesc, LogicNodeAdd.inportY);

		LogicLayer.writeValue(this.logicInstance, LogicNodeAdd.outportSum, out);
	};

	LogicNodeAdd.logicInterface = new LogicInterface();
	LogicNodeAdd.outportSum = LogicNodeAdd.logicInterface.addOutputProperty('sum', 'float');
	LogicNodeAdd.inportX = LogicNodeAdd.logicInterface.addInputProperty('x', 'float', 0);
	LogicNodeAdd.inportY = LogicNodeAdd.logicInterface.addInputProperty('y', 'float', 0);

	LogicNodes.registerType('LogicNodeAdd', LogicNodeAdd);

	module.exports = LogicNodeAdd;


/***/ },

/***/ 390:
/***/ function(module, exports) {

	/**
	 * Base class/module for all logic boxes
	 * @private
	 */
	function LogicNodes() {}

	LogicNodes.types = {};

	/**
	 * Register a new logic node. All logic nodes must call this to register themselves.
	 * @private
	 */
	LogicNodes.registerType = function (name, fn) {
		LogicNodes.types[name] = {
			fn: fn,
			name: name,
			editorName: fn.editorName
		};
	};

	LogicNodes.getInterfaceByName = function (name) {
		if (LogicNodes.types[name] !== undefined) {
			return LogicNodes.types[name].fn.logicInterface;
		}
		return null;
	};

	LogicNodes.getClass = function (name) {
		if (LogicNodes.types[name] === undefined) {
			return function () {
				console.error('LogicNode type [' + name + '] does not exist.');
				return null;
			};
		}

		return LogicNodes.types[name].fn;
	};

	LogicNodes.getAllTypes = function () {
		var out = [];
		for (var n in LogicNodes.types) {
			out.push(LogicNodes.types[n]);
		}
		return out;
	};

	module.exports = LogicNodes;

/***/ },

/***/ 391:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);
	var Vector3 = __webpack_require__(8);
	var Matrix3 = __webpack_require__(24);

	/**
	 * Logic node for vector < matrix computation
	 * @private
	 */
	function LogicNodeApplyMatrix() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeApplyMatrix.logicInterface;
		this.type = 'LogicNodeApplyMatrix';
		this.vec = new Vector3();
	}

	LogicNodeApplyMatrix.prototype = Object.create(LogicNode.prototype);
	LogicNodeApplyMatrix.editorName = 'ApplyMatrix';

	LogicNodeApplyMatrix.prototype.onInputChanged = function (instDesc) {
		var vec = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportX);
		var mat = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportY);
		this.vec.copy(vec);
		mat.applyPost(this.vec);
		LogicLayer.writeValue(this.logicInstance, LogicNodeApplyMatrix.outportProduct, this.vec);
	};

	LogicNodeApplyMatrix.logicInterface = new LogicInterface();
	LogicNodeApplyMatrix.outportProduct = LogicNodeApplyMatrix.logicInterface.addOutputProperty('product', 'Vector3');
	LogicNodeApplyMatrix.inportX = LogicNodeApplyMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
	LogicNodeApplyMatrix.inportY = LogicNodeApplyMatrix.logicInterface.addInputProperty('mat', 'Matrix3', new Matrix3());

	LogicNodes.registerType('LogicNodeApplyMatrix', LogicNodeApplyMatrix);

	module.exports = LogicNodeApplyMatrix;


/***/ },

/***/ 392:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);
	var Vector3 = __webpack_require__(8);

	/**
	 * Logic node to provide a const Vec3
	 * @private
	 */
	function LogicNodeConstVec3() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeConstVec3.logicInterface;
		this.type = 'LogicNodeConstVec3';
	}

	LogicNodeConstVec3.prototype = Object.create(LogicNode.prototype);
	LogicNodeConstVec3.editorName = 'ConstVec3';

	LogicNodeConstVec3.prototype.onConfigure = function (newConfig) {
		if (newConfig.value !== undefined) {
			this.value = newConfig.value;
			LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
		}
	};

	LogicNodeConstVec3.prototype.onSystemStarted = function () {
		LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
	};

	LogicNodes.registerType('LogicNodeConstVec3', LogicNodeConstVec3);

	LogicNodeConstVec3.logicInterface = new LogicInterface();
	LogicNodeConstVec3.outportVec = LogicNodeConstVec3.logicInterface.addOutputProperty('xyz', 'Vector3');

	LogicNodeConstVec3.logicInterface.addConfigEntry({
		name: 'x',
		type: 'float',
		label: 'X'
	});

	LogicNodeConstVec3.logicInterface.addConfigEntry({
		name: 'y',
		type: 'float',
		label: 'Y'
	});

	LogicNodeConstVec3.logicInterface.addConfigEntry({
		name: 'z',
		type: 'float',
		label: 'Z'
	});

	module.exports = LogicNodeConstVec3;

/***/ },

/***/ 393:
/***/ function(module, exports, __webpack_require__) {

	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that writes output to the console.
	 * @private
	 */
	function LogicNodeDebug() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeDebug.logicInterface;
		this.type = 'LogicNodeDebug';
		this._time = 0;
	}

	LogicNodeDebug.prototype = Object.create(LogicNode.prototype);
	LogicNodeDebug.editorName = 'Debug';

	LogicNodeDebug.prototype.onInputChanged = function (instDesc, portID, value) {
		console.log('LogicNodeDebug (' + this.logicInstance.name + ') value port ' + portID + ' = [' + value + ']');
	};

	LogicNodeDebug.prototype.onEvent = function (instDesc, portID) {
		console.log('LogicNodeDebug (' + this.logicInstance.name + ') event on port ' + portID);
	};

	LogicNodeDebug.logicInterface = new LogicInterface();
	LogicNodeDebug.inportEvent = LogicNodeDebug.logicInterface.addInputEvent('Event');
	LogicNodeDebug.inportFloat = LogicNodeDebug.logicInterface.addInputProperty('FloatValue', 'float', 0);

	LogicNodes.registerType('LogicNodeDebug', LogicNodeDebug);

	module.exports = LogicNodeDebug;

/***/ },

/***/ 394:
/***/ function(module, exports, __webpack_require__) {

	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that lets you access the logic layer of a different entity.
	 * @private
	 */
	function LogicNodeEntityProxy() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeEntityProxy.logicInterface;
		this.type = 'LogicNodeEntityProxy';
	}

	LogicNodeEntityProxy.prototype = Object.create(LogicNode.prototype);
	LogicNodeEntityProxy.editorName = 'EntityProxy';

	LogicNodeEntityProxy.prototype.onConfigure = function (config) {
		this.entityRef = config.entityRef;
	};

	// Empty.
	LogicNodeEntityProxy.logicInterface = new LogicInterface('Component Proxy');
	LogicNodeEntityProxy.logicInterface.addConfigEntry({
		name: 'entityRef',
		type: 'entityRef',
		label: 'Entity'
	});

	LogicNodes.registerType('LogicNodeEntityProxy', LogicNodeEntityProxy);

	module.exports = LogicNodeEntityProxy;

/***/ },

/***/ 395:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that provides a float value.
	 * @private
	 */
	function LogicNodeFloat() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeFloat.logicInterface;
		this.type = 'LogicNodeFloat';
	}

	LogicNodeFloat.prototype = Object.create(LogicNode.prototype);
	LogicNodeFloat.editorName = 'Float';

	LogicNodeFloat.prototype.onConfigure = function (newConfig) {
		if (newConfig.value !== undefined) {
			this.value = newConfig.value;
			LogicLayer.writeValue(this.logicInstance, LogicNodeFloat.outportFloat, this.value);
		}
	};

	LogicNodeFloat.prototype.onSystemStarted = function () {
		LogicLayer.writeValue(this.logicInstance, LogicNodeFloat.outportFloat, this.value);
	};

	LogicNodes.registerType('LogicNodeFloat', LogicNodeFloat);

	LogicNodeFloat.logicInterface = new LogicInterface();
	LogicNodeFloat.outportFloat = LogicNodeFloat.logicInterface.addOutputProperty('value', 'float');
	LogicNodeFloat.logicInterface.addConfigEntry({
		name: 'value',
		type: 'float',
		label: 'Value'
	});

	module.exports = LogicNodeFloat;

/***/ },

/***/ 396:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node to be used as Layer input.
	 * @private
	 */
	function LogicNodeInput() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeInput.logicInterface;
		this.type = 'LogicNodeInput';
		this.dummyInport = null;
	}

	LogicNodeInput.prototype = Object.create(LogicNode.prototype);
	LogicNodeInput.editorName = 'Input';

	// Configure new input.
	LogicNodeInput.prototype.onConfigure = function (newConfig) {
		this.dummyInport = LogicInterface.createDynamicInput(newConfig.Name);
	};

	LogicNodeInput.prototype.onInputChanged = function (instDesc, portID, value) {
		// this will be the dummy inport getting values written.
		LogicLayer.writeValue(this.logicInstance, LogicNodeInput.outportInput, value);
	};

	LogicNodes.registerType('LogicNodeInput', LogicNodeInput);

	LogicNodeInput.logicInterface = new LogicInterface();

	// TODO: This should be a both, not property/event.
	LogicNodeInput.outportInput = LogicNodeInput.logicInterface.addOutputProperty('Input', 'any');

	LogicNodeInput.logicInterface.addConfigEntry({
		name: 'Name',
		type: 'string',
		label: 'Name'
	});

	module.exports = LogicNodeInput;

/***/ },

/***/ 397:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that provides an integer.
	 * @private
	 */
	function LogicNodeInt() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeInt.logicInterface;
		this.type = 'LogicNodeInt';
		this.defValue = 0;
		this.value = 0;
	}

	LogicNodeInt.prototype = Object.create(LogicNode.prototype);
	LogicNodeInt.editorName = 'Int';

	LogicNodeInt.prototype.onConfigure = function (newConfig) {
		if (newConfig.value !== undefined) {
			this.defValue = newConfig.value;
		}

		this.value = this.defValue;
	};

	LogicNodeInt.prototype.onConnected = function (instDesc) {
		LogicLayer.writeValue(instDesc, LogicNodeInt.outportInt, this.value);
	};

	LogicNodeInt.prototype.onEvent = function (instDesc, evt) {
		if (evt === LogicNodeInt.ineventIncrease) {
			this.value = this.value + 1;
		} else if (evt === LogicNodeInt.ineventDecrease) {
			this.value = this.value - 1;
		} else {
			this.value = this.defValue;
		}

		LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
	};

	LogicNodeInt.prototype.onSystemStarted = function () {
		LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
	};

	LogicNodeInt.prototype.onSystemStopped = function () {};

	LogicNodes.registerType('LogicNodeInt', LogicNodeInt);

	LogicNodeInt.logicInterface = new LogicInterface();
	LogicNodeInt.ineventReset = LogicNodeInt.logicInterface.addInputEvent('reset');
	LogicNodeInt.ineventIncrease = LogicNodeInt.logicInterface.addInputEvent('increase');
	LogicNodeInt.ineventDecrease = LogicNodeInt.logicInterface.addInputEvent('decrease');
	LogicNodeInt.outportInt = LogicNodeInt.logicInterface.addOutputProperty('value', 'int');
	LogicNodeInt.logicInterface.addConfigEntry({
		name: 'value',
		type: 'int',
		label: 'Value'
	});

	module.exports = LogicNodeInt;

/***/ },

/***/ 398:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node connecting to the LightComponent of an entity.
	 * @private
	 */
	function LogicNodeLightComponent() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeLightComponent.logicInterface;
		this.type = 'LightComponent';
	}

	LogicNodeLightComponent.prototype = Object.create(LogicNode.prototype);
	LogicNodeLightComponent.editorName = 'LightComponent';

	LogicNodeLightComponent.prototype.onConfigure = function (config) {
		this.entityRef = config.entityRef;
	};

	// Logic interface set-up
	LogicNodeLightComponent.logicInterface = new LogicInterface('LightComponent');
	LogicNodeLightComponent.inportIntensity = LogicNodeLightComponent.logicInterface.addInputProperty('Intensity', 'float');
	LogicNodeLightComponent.inportRange = LogicNodeLightComponent.logicInterface.addInputProperty('Range', 'float');

	LogicNodeLightComponent.prototype.onInputChanged = function (instDesc, propID, value) {
		var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
		if (propID === LogicNodeLightComponent.inportIntensity) {
			entity.lightComponent.light.intensity = value;
		} else if (propID === LogicNodeLightComponent.inportRange) {
			entity.lightComponent.light.range = value;
		}
	};

	LogicNodeLightComponent.logicInterface.addConfigEntry({ name: 'entityRef', type: 'entityRef', label: 'Entity'});
	LogicNodes.registerType('LightComponent', LogicNodeLightComponent);

	module.exports = LogicNodeLightComponent;

/***/ },

/***/ 399:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that computes the max of two inputs.
	 * @private
	 */
	function LogicNodeMax() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeMax.logicInterface;
		this.type = 'LogicNodeMax';
	}

	LogicNodeMax.prototype = Object.create(LogicNode.prototype);
	LogicNodeMax.editorName = 'Max';

	LogicNodeMax.prototype.onInputChanged = function (instDesc) {
		var val1 = LogicLayer.readPort(instDesc, LogicNodeMax.inportX);
		var val2 = LogicLayer.readPort(instDesc, LogicNodeMax.inportY);
		var out = Math.max(val1, val2);

		LogicLayer.writeValue(instDesc, LogicNodeMax.outportSum, out);
	};

	LogicNodeMax.logicInterface = new LogicInterface();
	LogicNodeMax.outportSum = LogicNodeMax.logicInterface.addOutputProperty('max', 'float');
	LogicNodeMax.inportX = LogicNodeMax.logicInterface.addInputProperty('x', 'float', 0);
	LogicNodeMax.inportY = LogicNodeMax.logicInterface.addInputProperty('y', 'float', 0);

	LogicNodes.registerType('LogicNodeMax', LogicNodeMax);

	module.exports = LogicNodeMax;

/***/ },

/***/ 400:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);
	var Vector3 = __webpack_require__(8);

	/**
	 * Logic node that connects to the MeshRendererComponent of an entity.
	 * @private
	 */
	function LogicNodeMeshRendererComponent() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeMeshRendererComponent.logicInterface;
		this.type = 'MeshRendererComponent';
	}

	LogicNodeMeshRendererComponent.prototype = Object.create(LogicNode.prototype);
	LogicNodeMeshRendererComponent.editorName = 'MeshRendererComponent';

	LogicNodeMeshRendererComponent.prototype.onConfigure = function (config) {
		this.entityRef = config.entityRef;
	};

	LogicNodeMeshRendererComponent.prototype.onInputChanged = function (instDesc, portID, value) {
		var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
		var comp = entity.meshRendererComponent;

		if (portID === LogicNodeMeshRendererComponent.inportAmbient && comp.materials.length > 0) {
			comp.meshRendererComponent.materials[0].uniforms.materialAmbient[0] = value[0];
			comp.materials[0].uniforms.materialAmbient[1] = value[1];
			comp.materials[0].uniforms.materialAmbient[2] = value[2];
		}
	};

	LogicNodeMeshRendererComponent.prototype.onEvent = function (instDesc, event) {
		var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
		var comp = entity.meshRendererComponent;

		if (event === LogicNodeMeshRendererComponent.inportShadows) {
			comp.castShadows = !comp.castShadows;
		} else if (event === LogicNodeMeshRendererComponent.inportHidden) {
			comp.hidden = !comp.hidden;
		}
	};

	LogicNodeMeshRendererComponent.logicInterface = new LogicInterface('Material');
	LogicNodeMeshRendererComponent.inportShadows = LogicNodeMeshRendererComponent.logicInterface.addInputEvent('toggle-shadows');
	LogicNodeMeshRendererComponent.inportHidden = LogicNodeMeshRendererComponent.logicInterface.addInputEvent('toggle-hidden');
	LogicNodeMeshRendererComponent.inportAmbient = LogicNodeMeshRendererComponent.logicInterface.addInputProperty('ambient', 'Vector3', new Vector3(0.5, 0.0, 0.0));
	LogicNodeMeshRendererComponent.logicInterface.addConfigEntry({
		name: 'entityRef',
		type: 'entityRef',
		label: 'Entity'
	});
	LogicNodes.registerType('MeshRendererComponent', LogicNodeMeshRendererComponent);

	module.exports = LogicNodeMeshRendererComponent;

/***/ },

/***/ 401:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that reads mouse input.
	 * @private
	 */
	function LogicNodeMouse() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeMouse.logicInterface;
		this.type = 'LogicNodeMouse';

		this.eventMouseMove = function (event) {
			var mx = event.clientX;
			var my = event.clientY;
			var dx = mx - this.x;
			var dy = my - this.y;
			LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portX, mx);
			LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portY, my);
			LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDX, dx);
			LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDY, dy);
		}.bind(this);

		this.eventMouseDown = function (event) {
			if (event.button === 0) {
				LogicLayer.fireEvent(this.logicInstance, LogicNodeMouse.outEventLmb);
			}
			if (event.button === 2) {
				LogicLayer.fireEvent(this.logicInstance, LogicNodeMouse.outEventRmb);
			}
		}.bind(this);
	}

	LogicNodeMouse.prototype = Object.create(LogicNode.prototype);
	LogicNodeMouse.editorName = 'Mouse';

	LogicNodeMouse.prototype.onSystemStarted = function () {
		this.x = 0;
		this.y = 0;
		document.addEventListener('mousemove', this.eventMouseMove, false);
		document.addEventListener('mousedown', this.eventMouseDown, false);
	};

	LogicNodeMouse.prototype.onSystemStopped = function () {
		document.removeEventListener('mousemove', this.eventMouseMove);
		document.removeEventListener('mousedown', this.eventMouseDown);
	};

	LogicNodeMouse.logicInterface = new LogicInterface();
	LogicNodeMouse.portX = LogicNodeMouse.logicInterface.addOutputProperty('x', 'float', 0);
	LogicNodeMouse.portY = LogicNodeMouse.logicInterface.addOutputProperty('y', 'float', 0);
	LogicNodeMouse.portDX = LogicNodeMouse.logicInterface.addOutputProperty('dx', 'float', 0);
	LogicNodeMouse.portDY = LogicNodeMouse.logicInterface.addOutputProperty('dy', 'float', 0);
	LogicNodeMouse.outEventLmb = LogicNodeMouse.logicInterface.addOutputEvent('lmb');
	LogicNodeMouse.outEventRmb = LogicNodeMouse.logicInterface.addOutputEvent('rmb');

	LogicNodes.registerType('LogicNodeMouse', LogicNodeMouse);

	module.exports = LogicNodeMouse;

/***/ },

/***/ 402:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that multiplies two inputs.
	 * @private
	 */
	function LogicNodeMultiply() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeMultiply.logicInterface;
		this.type = 'LogicNodeMultiply';
		this._x = this._y = 0; // REVIEW: unused ?
	}

	LogicNodeMultiply.prototype = Object.create(LogicNode.prototype);
	LogicNodeMultiply.editorName = 'Multiply';

	LogicNodeMultiply.prototype.onInputChanged = function (instDesc) {
		var x = LogicLayer.readPort(instDesc, LogicNodeMultiply.inportX);
		var y = LogicLayer.readPort(instDesc, LogicNodeMultiply.inportY);
		LogicLayer.writeValue(instDesc, LogicNodeMultiply.outportProduct, x * y);
	};

	LogicNodeMultiply.logicInterface = new LogicInterface();
	LogicNodeMultiply.outportProduct = LogicNodeMultiply.logicInterface.addOutputProperty('product', 'float');
	LogicNodeMultiply.inportX = LogicNodeMultiply.logicInterface.addInputProperty('x', 'float', 0);
	LogicNodeMultiply.inportY = LogicNodeMultiply.logicInterface.addInputProperty('y', 'float', 0);

	LogicNodes.registerType('LogicNodeMultiply', LogicNodeMultiply);

	module.exports = LogicNodeMultiply;

/***/ },

/***/ 403:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that multiplies two floats.
	 * @private
	 */
	function LogicNodeMultiplyFloat() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeMultiplyFloat.logicInterface;
		this.type = 'LogicNodeMultiplyFloat';
		this._x = this._y = 0; // REVIEW: unused?
	}

	LogicNodeMultiplyFloat.prototype = Object.create(LogicNode.prototype);
	LogicNodeMultiplyFloat.editorName = 'MultiplyFloat';

	LogicNodeMultiplyFloat.prototype.onConfigure = function (newConfig) {
		if (newConfig.value !== undefined) {
			this.value = newConfig.value;
		}
	};

	LogicNodeMultiplyFloat.prototype.onInputChanged = function (instDesc) {
		var x = LogicLayer.readPort(instDesc, LogicNodeMultiplyFloat.inportX);
		var y = this.value;
		LogicLayer.writeValue(instDesc, LogicNodeMultiplyFloat.outportProduct, x * y);
	};

	LogicNodeMultiplyFloat.logicInterface = new LogicInterface();
	LogicNodeMultiplyFloat.outportProduct = LogicNodeMultiplyFloat.logicInterface.addOutputProperty('product', 'float');
	LogicNodeMultiplyFloat.inportX = LogicNodeMultiplyFloat.logicInterface.addInputProperty('x', 'float', 0);
	LogicNodeMultiplyFloat.logicInterface.addConfigEntry({
		name: 'value',
		type: 'float',
		label: 'Value'
	});

	LogicNodes.registerType('LogicNodeMultiplyFloat', LogicNodeMultiplyFloat);

	module.exports = LogicNodeMultiplyFloat;

/***/ },

/***/ 404:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node to be used as layer output.
	 * @private
	 */
	function LogicNodeOutput() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeOutput.logicInterface;
		this.type = 'LogicNodeOutput';
		this.realOutport = null;
	}

	LogicNodeOutput.prototype = Object.create(LogicNode.prototype);
	LogicNodeOutput.editorName = 'Output';

	LogicNodeOutput.prototype.onInputChanged = function (instDesc, portID, value) {
		LogicLayer.writeValueToLayerOutput(instDesc, this.realOutport, value);
	};

	LogicNodeOutput.prototype.onEvent = function () { };

	// Configure new output.
	LogicNode.prototype.onConfigure = function (newConfig) {
		this.realOutport = LogicInterface.createDynamicOutput(newConfig.Name);
	};

	LogicNodes.registerType('LogicNodeOutput', LogicNodeOutput);

	LogicNodeOutput.logicInterface = new LogicInterface();
	LogicNodeOutput.inportOutput = LogicNodeOutput.logicInterface.addInputProperty('Output', 'any');
	LogicNodeOutput.logicInterface.addConfigEntry({ name: 'Name', type: 'string', label: 'Name'});

	module.exports = LogicNodeOutput;

/***/ },

/***/ 405:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicInterface = __webpack_require__(386);
	var LogicNodes = __webpack_require__(390);

	/**
	 * Logic node implementing a random value. Every frame a new random value is written
	 * to its output.
	 * @private
	 */
	function LogicNodeRandom() {
		LogicNode.call(this);
		this.wantsProcessCall = true;
		this.logicInterface = LogicNodeRandom.logicInterface;
		this.type = 'LogicNodeRandom';
	}

	// Logic interface set-up
	LogicNodeRandom.prototype = Object.create(LogicNode.prototype);
	LogicNodeRandom.editorName = 'Random';
	LogicNodeRandom.logicInterface = new LogicInterface();

	// ports
	LogicNodeRandom.outPropRandom = LogicNodeRandom.logicInterface.addOutputProperty('Random0_1', 'float');

	// Process
	LogicNodeRandom.prototype.processLogic = function () {
		LogicLayer.writeValue(this.logicInstance, LogicNodeRandom.outPropRandom, Math.random());
	};

	LogicNodes.registerType('LogicNodeRandom', LogicNodeRandom);

	module.exports = LogicNodeRandom;

/***/ },

/***/ 406:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);
	var Vector3 = __webpack_require__(8);
	var Matrix3 = __webpack_require__(24);

	/**
	 * Logic node that constructs a rotation matrix.
	 * @private
	 */
	function LogicNodeRotationMatrix() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeRotationMatrix.logicInterface;
		this.type = 'LogicNodeRotationMatrix';
		this.vec = new Vector3();
	}

	LogicNodeRotationMatrix.prototype = Object.create(LogicNode.prototype);
	LogicNodeRotationMatrix.editorName = 'RotationMatrix';

	LogicNodeRotationMatrix.prototype.onInputChanged = function (instDesc) {
		var vec = LogicLayer.readPort(instDesc, LogicNodeRotationMatrix.inportX);
		var mat = new Matrix3();
		mat.fromAngles(vec.x, vec.y, vec.z);
		LogicLayer.writeValue(instDesc, LogicNodeRotationMatrix.outportProduct, mat);
	};

	LogicNodeRotationMatrix.logicInterface = new LogicInterface();
	LogicNodeRotationMatrix.inportX = LogicNodeRotationMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
	LogicNodeRotationMatrix.outportProduct = LogicNodeRotationMatrix.logicInterface.addOutputProperty('mat', 'Matrix3', new Matrix3());

	LogicNodes.registerType('LogicNodeRotationMatrix', LogicNodeRotationMatrix);

	module.exports = LogicNodeRotationMatrix;

/***/ },

/***/ 407:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that calculates sin & cos.
	 * @private
	 */
	function LogicNodeSine() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeSine.logicInterface;
		this.type = 'LogicNodeSine';
		this._time = 0;
	}

	LogicNodeSine.prototype = Object.create(LogicNode.prototype);
	LogicNodeSine.editorName = 'Sine';

	LogicNodeSine.prototype.onInputChanged = function (instDesc, portID, value) {
		LogicLayer.writeValue(this.logicInstance, LogicNodeSine.outportSin, Math.sin(value));
		LogicLayer.writeValue(this.logicInstance, LogicNodeSine.outportCos, Math.cos(value));
	};

	LogicNodeSine.logicInterface = new LogicInterface();
	LogicNodeSine.outportSin = LogicNodeSine.logicInterface.addOutputProperty('Sine', 'float');
	LogicNodeSine.outportCos = LogicNodeSine.logicInterface.addOutputProperty('Cosine', 'float');
	LogicNodeSine.inportPhase = LogicNodeSine.logicInterface.addInputProperty('Phase', 'float', 0);

	LogicNodes.registerType('LogicNodeSine', LogicNodeSine);

	module.exports = LogicNodeSine;

/***/ },

/***/ 408:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node that subtracts inputs.
	 * @private
	 */
	function LogicNodeSub() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeSub.logicInterface;
		this.type = 'LogicNodeSub';
	}

	LogicNodeSub.prototype = Object.create(LogicNode.prototype);
	LogicNodeSub.editorName = 'Sub';

	LogicNodeSub.prototype.onInputChanged = function (instDesc /*, portID, value */ ) {
		var out = LogicLayer.readPort(instDesc, LogicNodeSub.inportX) -
			LogicLayer.readPort(instDesc, LogicNodeSub.inportY);

		LogicLayer.writeValue(this.logicInstance, LogicNodeSub.outportSum, out);
	};

	LogicNodeSub.logicInterface = new LogicInterface();
	LogicNodeSub.outportSum = LogicNodeSub.logicInterface.addOutputProperty('sum', 'float');
	LogicNodeSub.inportX = LogicNodeSub.logicInterface.addInputProperty('x', 'float', 0);
	LogicNodeSub.inportY = LogicNodeSub.logicInterface.addInputProperty('y', 'float', 0);

	LogicNodes.registerType('LogicNodeSub', LogicNodeSub);

	module.exports = LogicNodeSub;

/***/ },

/***/ 409:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicInterface = __webpack_require__(386);
	var LogicNodes = __webpack_require__(390);

	/**
	 * Logic node implementing a time counter. Processed every frame and time is increased. Output
	 * can be read through the 'Time' port
	 * @private
	 */
	function LogicNodeTime() {
		LogicNode.call(this);
		this.wantsProcessCall = true;
		this.logicInterface = LogicNodeTime.logicInterface;
		this.type = 'LogicNodeTime';
		this._time = 0;
		this._running = true;
	}

	// Logic interface set-up
	LogicNodeTime.prototype = Object.create(LogicNode.prototype);

	LogicNodeTime.editorName = 'Time';
	LogicNodeTime.logicInterface = new LogicInterface();

	// ports
	LogicNodeTime.outPropTime = LogicNodeTime.logicInterface.addOutputProperty('Time', 'float');

	// events
	LogicNodeTime.outEventReached1 = LogicNodeTime.logicInterface.addOutputEvent('>1');
	LogicNodeTime.inEventStart = LogicNodeTime.logicInterface.addInputEvent('Start');
	LogicNodeTime.inEventStop = LogicNodeTime.logicInterface.addInputEvent('Stop');
	LogicNodeTime.inEventReset = LogicNodeTime.logicInterface.addInputEvent('Reset');

	LogicNodeTime.prototype.onConfigure = function () {
		this._time = 0;
		this._running = true;
	};

	// Process
	LogicNodeTime.prototype.processLogic = function (tpf) {
		if (this._running) {
			var old = this._time;
			this._time += tpf;
			LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, this._time);

			if (old < 1 && this._time >= 1) {
				LogicLayer.fireEvent(this.logicInstance, LogicNodeTime.outEventReached1);
			}
		}
	};

	// should they have args too?
	LogicNodeTime.prototype.onEvent = function (instDesc, event) {
		if (event === LogicNodeTime.inEventStart) {
			this._running = true;
		} else if (event === LogicNodeTime.inEventStop) {
			this._running = false;
		} else if (event === LogicNodeTime.inEventReset) {
			this._time = 0;
			LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, 0);
		}
	};

	LogicNodes.registerType('LogicNodeTime', LogicNodeTime);

	module.exports = LogicNodeTime;

/***/ },

/***/ 410:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);
	var Vector3 = __webpack_require__(8);
	var Matrix3 = __webpack_require__(24);

	/**
	 * Logic node that connects to the transform component of an entity.
	 * @private
	 */
	function LogicNodeTransformComponent() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeTransformComponent.logicInterface;
		this.type = 'TransformComponent';
	}

	LogicNodeTransformComponent.prototype = Object.create(LogicNode.prototype);
	LogicNodeTransformComponent.editorName = 'TransformComponent';

	LogicNodeTransformComponent.prototype.onConfigure = function (config) {
		this.entityRef = config.entityRef; //
	};

	LogicNodeTransformComponent.prototype.onInputChanged = function (instDesc, portID, value) {
		var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
		var transformComponent = entity.transformComponent;

		if (portID === LogicNodeTransformComponent.inportPos) {
			transformComponent.setTranslation(value);
		} else if (portID === LogicNodeTransformComponent.inportRot) {
			transformComponent.setRotation(value[0], value[1], value[2]);
		} else if (portID === LogicNodeTransformComponent.inportScale) {
			transformComponent.setScale(value);
		}
		LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportPos, entity.transformComponent.transform.translation.clone());
		LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportRot, entity.transformComponent.transform.rotation.clone());
	};

	LogicNodeTransformComponent.logicInterface = new LogicInterface('Transform');
	LogicNodeTransformComponent.inportPos = LogicNodeTransformComponent.logicInterface.addInputProperty('position', 'Vector3', new Vector3(0, 0, 0));
	LogicNodeTransformComponent.inportRot = LogicNodeTransformComponent.logicInterface.addInputProperty('rotation', 'Vector3', new Vector3(0, 0, 0));
	LogicNodeTransformComponent.inportScale = LogicNodeTransformComponent.logicInterface.addInputProperty('scale', 'Vector3', new Vector3(1, 1, 1));
	LogicNodeTransformComponent.outportPos = LogicNodeTransformComponent.logicInterface.addOutputProperty('outpos', 'Vector3', new Vector3());
	LogicNodeTransformComponent.outportRot = LogicNodeTransformComponent.logicInterface.addOutputProperty('rotmat', 'Matrix3', new Matrix3());
	LogicNodeTransformComponent.logicInterface.addConfigEntry({
		name: 'entityRef',
		type: 'entityRef',
		label: 'Entity'
	});


	LogicNodes.registerType('TransformComponent', LogicNodeTransformComponent);

	module.exports = LogicNodeTransformComponent;

/***/ },

/***/ 411:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);
	var Vector3 = __webpack_require__(8);

	/**
	 * Logic node that provides a Vec3.
	 * @private
	 */
	function LogicNodeVec3() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeVec3.logicInterface;
		this.type = 'LogicNodeVec3';
		this._x = this._y = this._z = 0; // REVIEW: unused?
	}

	LogicNodeVec3.prototype = Object.create(LogicNode.prototype);
	LogicNodeVec3.editorName = 'Vec3';

	LogicNodeVec3.prototype.onInputChanged = function (instDesc) {
		var x = LogicLayer.readPort(instDesc, LogicNodeVec3.inportX);
		var y = LogicLayer.readPort(instDesc, LogicNodeVec3.inportY);
		var z = LogicLayer.readPort(instDesc, LogicNodeVec3.inportZ);
		var xyz = LogicLayer.readPort(instDesc, LogicNodeVec3.inportVec3);
		if (xyz !== null) {
			x = xyz.x;
			y = xyz.y;
			z = xyz.z;
		}

		LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportVec3, new Vector3(x, y, z));
		LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportX, x);
		LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportY, y);
		LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportZ, z);
	};

	LogicNodeVec3.logicInterface = new LogicInterface();

	LogicNodeVec3.outportVec3 = LogicNodeVec3.logicInterface.addOutputProperty('xyz', 'Vector3');
	LogicNodeVec3.inportVec3 = LogicNodeVec3.logicInterface.addInputProperty('xyz', 'Vector3', null);
	LogicNodeVec3.inportX = LogicNodeVec3.logicInterface.addInputProperty('x', 'float', 0);
	LogicNodeVec3.inportY = LogicNodeVec3.logicInterface.addInputProperty('y', 'float', 0);
	LogicNodeVec3.inportZ = LogicNodeVec3.logicInterface.addInputProperty('z', 'float', 0);
	LogicNodeVec3.outportX = LogicNodeVec3.logicInterface.addOutputProperty('x', 'float', 0);
	LogicNodeVec3.outportY = LogicNodeVec3.logicInterface.addOutputProperty('y', 'float', 0);
	LogicNodeVec3.outportZ = LogicNodeVec3.logicInterface.addOutputProperty('z', 'float', 0);

	LogicNodes.registerType('LogicNodeVec3', LogicNodeVec3);

	module.exports = LogicNodeVec3;

/***/ },

/***/ 412:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);
	var Vector3 = __webpack_require__(8);

	/**
	 * Logic node that adds Vec3 inputs.
	 * @private
	 */
	function LogicNodeVec3Add() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeVec3Add.logicInterface;
		this.type = 'LogicNodeVec3Add';
	}

	LogicNodeVec3Add.prototype = Object.create(LogicNode.prototype);
	LogicNodeVec3Add.editorName = 'AddVec3';

	LogicNodeVec3Add.prototype.onInputChanged = function (instDesc) {
		var vec1 = LogicLayer.readPort(instDesc, LogicNodeVec3Add.inportX);
		var vec2 = LogicLayer.readPort(instDesc, LogicNodeVec3Add.inportY);

		var vec = new Vector3();
		vec.copy(vec1).add(vec2);

		LogicLayer.writeValue(this.logicInstance, LogicNodeVec3Add.outportSum, vec);
	};

	LogicNodeVec3Add.logicInterface = new LogicInterface();
	LogicNodeVec3Add.outportSum = LogicNodeVec3Add.logicInterface.addOutputProperty('sum', 'Vector3');
	LogicNodeVec3Add.inportX = LogicNodeVec3Add.logicInterface.addInputProperty('vec1', 'Vector3', new Vector3());
	LogicNodeVec3Add.inportY = LogicNodeVec3Add.logicInterface.addInputProperty('vec2', 'Vector3', new Vector3());

	LogicNodes.registerType('LogicNodeVec3Add', LogicNodeVec3Add);

	module.exports = LogicNodeVec3Add;

/***/ },

/***/ 413:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node handling WASD input.
	 * @private
	 */
	function LogicNodeWASD() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeWASD.logicInterface;
		this.type = 'LogicNodeWASD';

		var preventRepeat = {};
		this.eventListenerDown = function (event) {
			var character = String.fromCharCode(event.which).toLowerCase();
			if (preventRepeat[character]) {
				return;
			}
			var keyEvent = LogicNodeWASD.downKeys[character];
			if (keyEvent) {
				preventRepeat[character] = true;
				LogicLayer.fireEvent(this.logicInstance, keyEvent);
			}
		}.bind(this);
		this.eventListenerUp = function (event) {
			var character = String.fromCharCode(event.which).toLowerCase();
			if (preventRepeat[character]) {
				preventRepeat[character] = false;
			}
			var keyEvent = LogicNodeWASD.upKeys[character];
			if (keyEvent) {
				LogicLayer.fireEvent(this.logicInstance, keyEvent);
			}
		}.bind(this);
	}

	LogicNodeWASD.prototype = Object.create(LogicNode.prototype);
	LogicNodeWASD.editorName = 'WASD';

	LogicNodeWASD.prototype.onSystemStarted = function () {
		document.addEventListener('keydown', this.eventListenerDown);
		document.addEventListener('keyup', this.eventListenerUp);
	};

	LogicNodeWASD.prototype.onSystemStopped = function () {
		document.removeEventListener('keydown', this.eventListenerDown);
		document.removeEventListener('keyup', this.eventListenerUp);
	};

	LogicNodeWASD.logicInterface = new LogicInterface();
	LogicNodeWASD.downKeys = {
		'w': LogicNodeWASD.logicInterface.addOutputEvent('W-down'),
		'a': LogicNodeWASD.logicInterface.addOutputEvent('A-down'),
		's': LogicNodeWASD.logicInterface.addOutputEvent('S-down'),
		'd': LogicNodeWASD.logicInterface.addOutputEvent('D-down')
	};
	LogicNodeWASD.upKeys = {
		'w': LogicNodeWASD.logicInterface.addOutputEvent('W-up'),
		'a': LogicNodeWASD.logicInterface.addOutputEvent('A-up'),
		's': LogicNodeWASD.logicInterface.addOutputEvent('S-up'),
		'd': LogicNodeWASD.logicInterface.addOutputEvent('D-up')
	};

	LogicNodes.registerType('LogicNodeWASD', LogicNodeWASD);

	module.exports = LogicNodeWASD;

/***/ },

/***/ 414:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNode = __webpack_require__(388);
	var LogicNodes = __webpack_require__(390);
	var LogicInterface = __webpack_require__(386);

	/**
	 * Logic node handling WASD input.
	 * @private
	 */
	function LogicNodeWASD2() {
		LogicNode.call(this);
		this.logicInterface = LogicNodeWASD2.logicInterface;
		this.type = 'LogicNodeWASD2';

		var preventRepeat = {};
		this.eventListenerDown = function (event) {
			var character = String.fromCharCode(event.which).toLowerCase();
			if (preventRepeat[character]) {
				return;
			}
			var keyEvent = LogicNodeWASD2.downKeys[character];
			if (keyEvent) {
				preventRepeat[character] = true;
				LogicLayer.writeValue(this.logicInstance, keyEvent.port, keyEvent.value);
			}
		}.bind(this);
		this.eventListenerUp = function (event) {
			var character = String.fromCharCode(event.which).toLowerCase();
			if (preventRepeat[character]) {
				preventRepeat[character] = false;
			}
			var keyEvent = LogicNodeWASD2.downKeys[character];
			if (keyEvent) {
				LogicLayer.writeValue(this.logicInstance, keyEvent.port, 0);
			}
		}.bind(this);
	}

	LogicNodeWASD2.prototype = Object.create(LogicNode.prototype);
	LogicNodeWASD2.editorName = 'WASD2';

	LogicNodeWASD2.prototype.onSystemStarted = function () {
		document.addEventListener('keydown', this.eventListenerDown);
		document.addEventListener('keyup', this.eventListenerUp);
	};

	LogicNodeWASD2.prototype.onSystemStopped = function () {
		document.removeEventListener('keydown', this.eventListenerDown);
		document.removeEventListener('keyup', this.eventListenerUp);
	};

	LogicNodeWASD2.logicInterface = new LogicInterface();
	LogicNodeWASD2.downKeys = {
		'w': {
			port: LogicNodeWASD2.logicInterface.addOutputProperty('W', 'float', 0),
			value: 1
		},
		'a': {
			port: LogicNodeWASD2.logicInterface.addOutputProperty('A', 'float', 0),
			value: 1
		},
		's': {
			port: LogicNodeWASD2.logicInterface.addOutputProperty('S', 'float', 0),
			value: -1
		},
		'd': {
			port: LogicNodeWASD2.logicInterface.addOutputProperty('D', 'float', 0),
			value: -1
		}
	};

	LogicNodes.registerType('LogicNodeWASD2', LogicNodeWASD2);

	module.exports = LogicNodeWASD2;

/***/ },

/***/ 415:
/***/ function(module, exports, __webpack_require__) {

	var LogicLayer = __webpack_require__(387);
	var LogicNodes = __webpack_require__(390);
	var Component = __webpack_require__(20);

	/**
	 * A component that embeds a LogicLayer and processes it every frame.
	 * @private
	 */
	function LogicComponent(entity) {
		Component.call(this);

		this.type = 'LogicComponent';
		this.parent = null;
		this.logicInstance = null;

		// these used to be global but aren't any longer.
		this.logicLayer = null;
		this.nodes = {};

		this._entity = entity;
	}

	LogicComponent.prototype = Object.create(Component.prototype);

	LogicComponent.prototype.configure = function (conf) {
		// cleanup.
		for (var x in this.nodes) {
			if (this.nodes[x].onSystemStopped !== undefined) {
				this.nodes[x].onSystemStopped(false);
			}
		}

		this.logicLayer = new LogicLayer(this._entity);

		this.nodes = {};

		for (var k in conf.logicNodes) {
			var ln = conf.logicNodes[k];
			var Fn = LogicNodes.getClass(ln.type);
			var obj = new Fn();

			obj.configure(ln);
			obj.addToLogicLayer(this.logicLayer, ln.id);

			this.nodes[k] = obj;
		}
	};

	LogicComponent.prototype.process = function (tpf) {
		if (this.logicLayer !== null) {
			this.logicLayer.process(tpf);
		}
	};

	module.exports = LogicComponent;

/***/ },

/***/ 416:
/***/ function(module, exports, __webpack_require__) {

	var ComponentHandler = __webpack_require__(88);
	var LogicComponent = __webpack_require__(415);
	var PromiseUtils = __webpack_require__(54);

	// TODO: include somewhere else
	__webpack_require__(394);
	__webpack_require__(410);
	__webpack_require__(400);
	__webpack_require__(398);
	__webpack_require__(393);
	__webpack_require__(405);
	__webpack_require__(409);
	__webpack_require__(407);
	__webpack_require__(411);
	__webpack_require__(402);
	__webpack_require__(413);
	__webpack_require__(414);
	__webpack_require__(401);
	__webpack_require__(389);
	__webpack_require__(408);
	__webpack_require__(395);
	__webpack_require__(391);
	__webpack_require__(392);
	__webpack_require__(412);
	__webpack_require__(406);
	__webpack_require__(403);
	__webpack_require__(399);
	__webpack_require__(397);
	__webpack_require__(396);
	__webpack_require__(404);

	/**
	* 	* @private
	*/
	function LogicComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	LogicComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	LogicComponentHandler.prototype.constructor = LogicComponentHandler;
	ComponentHandler._registerClass('logic', LogicComponentHandler);

	LogicComponentHandler.prototype._create = function (entity, config) {
		var c = new LogicComponent(entity);
		c.configure(config);
		entity.setComponent(c);
		return c;
	};

	LogicComponentHandler.prototype.update = function (entity, config) {
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		component.configure(config);
		return PromiseUtils.resolve(component);
	};

	module.exports = LogicComponentHandler;


/***/ },

/***/ 417:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);
	var LogicLayer = __webpack_require__(387);
	var LogicInterface = __webpack_require__(386);

	// REVIEW: this description seems inaccurate
	/**
	 * Updates cameras/cameracomponents with ther transform component transforms
	 * @private
	 */
	function LogicSystem() {
		System.call(this, 'LogicSystem', null);

		this.passive = true;
		this._entities = {};
	}

	LogicSystem.prototype = Object.create(System.prototype);

	LogicSystem.prototype.inserted = function (entity) {
		this._entities[entity.name] = {
			entity: entity,
			inserted: false // REVIEW: is this ever accessed? seems to start off false and be reset to false again in .stop, several lines below
		};
	};

	LogicSystem.prototype.deleted = function (entity) {
		delete this._entities[entity.name];
	};

	LogicSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];
			if (e.logicComponent !== undefined) {
				e.logicComponent.process(tpf);
			}
		}
	};

	/**
	 * Called when proxy entities want to resolve their entities. Called from LogicLayer.
	 */
	LogicSystem.prototype.resolveEntityRef = function (entityRef) {
		var e = this._entities[entityRef];
		if (e !== undefined) {
			return e.entity;
		}
		// REVIEW: no need to check, function returns undefined anyways
	};

	LogicSystem.prototype.getLayerByEntity = function (entityName) {
		var e = this._entities[entityName];
		if (e === undefined) {
			return e;
		}

		var c = e.entity.logicComponent;
		if (c === undefined) {
			return c;
		}

		return c.logicLayer;
	};

	LogicSystem.prototype.makeOutputWriteFn = function (sourceEntity, outPortDesc) {
		// Lets do this the really slow and stupid way for now!

		// TODO: Make sure this function is cached and only generated once
		//
		var matches = [];
		this.forEachLogicObject(function (o) {
			// Look for entities that point to this here.
			if (o.type === 'LogicNodeEntityProxy' && o.entityRef === sourceEntity.name) {
				matches.push([o.logicInstance, LogicInterface.makePortDataName(outPortDesc)]);
				// REVIEW: use objects instead of arrays when representing pairs ('0' and '1' are harder to read than some proper names)
			}
		});

		return function (v) {
			for (var i = 0; i < matches.length; i++) {
				LogicLayer.writeValue(matches[i][0], matches[i][1], v);
			}
		};
	};

	LogicSystem.prototype.forEachLogicObject = function (f) {
		for (var n in this._entities) {
			var e = this._entities[n].entity;
			if (e.logicComponent !== undefined) { // REVIEW: can this ever be undefined?
				e.logicComponent.logicLayer.forEachLogicObject(f);
			}
		}
	};

	LogicSystem.prototype.play = function () {
		this.passive = false;

		// notify system start.
		this.forEachLogicObject(function (o) {
			if (o.onSystemStarted !== undefined) {
				o.onSystemStarted();
			}
		});
	};

	LogicSystem.prototype.pause = function () {
		this.passive = true;

		// notify system stop for pause
		this.forEachLogicObject(function (o) {
			if (o.onSystemStopped !== undefined) {
				o.onSystemStopped(true);
			}
		});
	};

	LogicSystem.prototype.stop = function () {
		this.passive = true;

		// notify system (full) stop
		this.forEachLogicObject(function (o) {
			if (o.onSystemStopped !== undefined) {
				o.onSystemStopped(false);
			}
		});

		// now that logic layer is cleared, need to put them back in on play.
		for (var k in this._entities) {
			this._entities[k].inserted = false;
		}
	};

	module.exports = LogicSystem;

/***/ }

});
