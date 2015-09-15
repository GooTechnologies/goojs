define([
	'shader-bits/data/Connection'
], function (
	Connection
) {
	'use strict';

	/**
	 * Base class for nodes
	 * @param id
	 */
	function Node(id) {
		this.id = id;
		this.incomingConnections = new Set();
		this.resolvedTypes = new Map();
	}

	/**
	 * Connects this node (if this node has a single out-port) to another node or its in-port
	 * @param that
	 * @returns {Node}
	 */
	Node.prototype.connect = function (that) {
		that.connectedByNode(this);
		return this;
	};

	/**
	 * Removes a previously created connection
	 * @param that
	 * @returns {Node}
	 */
	Node.prototype.disconnect = function (that) {
		that.disconnectedByNode(this);
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param node
	 * @returns {Node}
	 */
	Node.prototype.connectedByNode = function (node) {
		node._context.structure.addConnection(
			node,
			new Connection(node.singleOutPort.name, this.id, this.singleInPort.name)
		);
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param outPort
	 * @returns {Node}
	 */
	Node.prototype.connectedByOutPort = function (outPort) {
		outPort._node._context.addConnection(
			outPort._node,
			new Connection(outPort.name, this.id, this.singleInPort.name)
		);
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param node
	 * @returns {Node}
	 */
	Node.prototype.disconnectedByNode = function (node) {
		node._context.structure.removeConnection(
			node,
			new Connection(node.singleOutPort.name, this.id, this.singleInPort.name)
		);
		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param outPort
	 * @returns {Node}
	 */
	Node.prototype.disconnectedByOutPort = function (outPort) {
		outPort._node._context.removeConnection(
			outPort._node,
			new Connection(outPort.name, this.id, this.singleInPort.name)
		);
		return this;
	};

	/**
	 * Returns whether this node accepts a connection.
	 * This method performs only superficial checks.
	 * Should be called only internally.
	 * @hidden
	 * @param connection
	 */
	// !schteppe: should this method be on ExternalInputNode and FunctionNode instead? outputsTo is not defined in Node constructor
	Node.prototype.acceptsConnection = function (connection) {
		return !this.outputsTo.some(function (candidate) {
			return candidate.equals(connection);
		});
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param {Connection} connection
	 * @returns {Node}
	 */
	Node.prototype.addConnection = function (connection) {
		if (!this.acceptsConnection(connection)) {
			throw new Error(
				'could not connect [' + connection.output + '] to [' + connection.input + ']'
			);
		}

		this.outputsTo.push(connection);

		return this;
	};

	/**
	 * Should be called only internally
	 * @hidden
	 * @param {Connection} connection
	 * @returns {Node}
	 */
	Node.prototype.removeConnection = function (connection) {
		var index = _(this.outputsTo).index(function (candidate) {
			return candidate.equals(connection);
		});
		if (index > -1) {
			connection.splice(index, 1);
		}
		return this;
	};

	return Node;
});
