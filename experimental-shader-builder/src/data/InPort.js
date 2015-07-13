define([
	'shader-bits/data/Connection'
], function (
	Connection
) {
	'use strict';

	/**
	 * Allows nodes to receive connections; these have no representation in the data model
	 * @param name
	 * @param type
	 */
	function InPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	/**
	 * Should be called only internally
	 * @hidden
	 * @param node
	 */
	InPort.prototype.connectedByNode = function (node) {
		this.connectedByOutPort(node.singleOutPort);
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param outPort
	 */
	InPort.prototype.connectedByOutPort = function (outPort) {
		outPort._node._context.structure.addConnection(
			outPort._node,
			new Connection(outPort.name, this._node.id, this.name)
		);
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param node
	 */
	InPort.prototype.disconnectedByNode = function (node) {
		this.disconnectedByOutPort(node.singleOutPort);
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param outPort
	 */
	InPort.prototype.disconnectedByOutPort = function (outPort) {
		outPort._node._context.structure.removeConnection(
			outPort._node,
			new Connection(outPort.name, this._node.id, this.name)
		);
	};

	return InPort;
});
