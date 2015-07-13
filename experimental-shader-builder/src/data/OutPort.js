define(function () {
	'use strict';

	/**
	 * Allows nodes to connect to other nodes; these have no representation in the data model
	 * @param name
	 * @param type
	 */
	function OutPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	/**
	 * Connects this out-port to a node or its in-ports
	 * @param that
	 */
	OutPort.prototype.connect = function (that) {
		that.connectedByOutPort(this);
	};

	/**
	 * Removes a previously created connection
	 * @param that
	 */
	OutPort.prototype.disconnect = function (that) {
		that.disconnectedByOutPort(this);
	};

	return OutPort;
});
