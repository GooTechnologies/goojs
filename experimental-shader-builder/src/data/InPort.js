define([
	'shader-bits/data/Connection'
], function (
	Connection
) {
	'use strict';

	// !schteppe: is it worth making a Port base class to this?

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
	 * @return {InPort}
	 */
	InPort.prototype.connectedByNode = function (node) {
		this.connectedByOutPort(node.singleOutPort);
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param outPort
	 * @return {InPort}
	 */
	InPort.prototype.connectedByOutPort = function (outPort) {
		outPort._node._context.structure.addConnection(
			outPort._node,
			new Connection(outPort.name, this._node.id, this.name)
		);
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param node
	 * @return {InPort}
	 */
	InPort.prototype.disconnectedByNode = function (node) {
		this.disconnectedByOutPort(node.singleOutPort);
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param outPort
	 * @return {InPort}
	 */
	InPort.prototype.disconnectedByOutPort = function (outPort) {
		outPort._node._context.structure.removeConnection(
			outPort._node,
			new Connection(outPort.name, this._node.id, this.name)
		);
		return this;
	};

	return InPort;
});
