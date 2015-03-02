define(
	/** @lends */
	function() {
		'use strict';

		/**
		 * @private
		 * @class Describes all the inputs / outputs for this logic interface. Typically one instance of this class exists for every class that
		 *        implements logic.
		 */
		function LogicInterface(name) {
			this.ports = [];
			this.configOpts = [];

			// Name builds the data name prefix
			if (name === undefined) {
				this.dn_pfx = "";
			} else {
				this.dn_pfx = name + "-";
			}
		}

		LogicInterface.prototype.addInputProperty = function(name_, valueType, defaultValue) {
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

		LogicInterface.prototype.addOutputProperty = function(name_, valueType) {
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

		LogicInterface.prototype.addInputEvent = function(name_) {
			this.ports.push({
				id: ++LogicInterface._portID,
				input: true,
				property: false,
				event: true,
				name: (this.dn_pfx + name_)
			});
			return LogicInterface._portID;
		};

		LogicInterface.prototype.addOutputEvent = function(name_) {
			this.ports.push({
				id: ++LogicInterface._portID,
				input: false,
				property: false,
				event: true,
				name: (this.dn_pfx + name_)
			});
			return LogicInterface._portID;
		};

		LogicInterface.createDynamicInput = function(name_) {
			return {
				id: LogicInterface.makeDynamicId(),
				input: true,
				property: true,
				event: true,
				dynamic: true,
				name: name_
			};
		};

		LogicInterface.createDynamicOutput = function(name_) {
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
		LogicInterface.prototype.addConfigEntry = function(conf) {
			this.configOpts.push(conf);
		};

		LogicInterface.prototype.getConfigEntries = function() {
			return this.configOpts;
		};

		LogicInterface.prototype.getPorts = function() {
			return this.ports;
		};

		LogicInterface.isDynamicPortName = function(name) {
			return name[0] === "$";
		};

		LogicInterface.makeDynamicId = function() {
			return ++LogicInterface._portID;
		};

		/**
		 * Computes a name for the port that can be saved in the data model without having it confused when (other) ports are added/removed
		 * @param port Port description object as returned by createDynamicInput/Output or from the getPorts() array.
		 */
		LogicInterface.makePortDataName = function(port) {
			if (port.dataname !== undefined) {
				return port.dataname;
			} else {
				var prefix = port.input ? "in-" : "out-";
				if (port.property) {
					prefix += "prop-";
				}
				if (port.event) {
					prefix += "event-";
				}

				// tag dynamic ports with $ at the start so they can be routed
				// properly.
				var dyn = (port.dynamic === true) ? "$" : "";
				return dyn + prefix + port.name;
			}
		};

		LogicInterface.assignPortDataName = function(port, dataname) {
			port.dataname = dataname;
		};

		/**
		 * Globally unique port id counter
		 */
		LogicInterface._portID = 0;

		return LogicInterface;
	});