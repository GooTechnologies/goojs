(function () {
	'use strict';

	var Connection = shaderBits.Connection;

	function Node(id) {
		this.id = id;
		this.incomingConnections = new Set();
		this.resolvedTypes = new Map();
	}

	Node.prototype.connect = function (that) {
		that.connectedByNode(this);
	};

	Node.prototype.disconnect = function (that) {
		that.disconnectedByNode(this);
	};

	Node.prototype.connectedByNode = function (node) {
		node._context.structure.addConnection(
			node,
			new Connection(node.singleOutPort.name, this.id, this.singleInPort.name)
		);
	};

	Node.prototype.connectedByOutPort = function (outPort) {
		outPort._node._context.addConnection(
			outPort._node,
			new Connection(outPort.name, this.id, this.singleInPort.name)
		);
	};

	Node.prototype.disconnectedByNode = function (node) {
		node._context.structure.removeConnection(
			node,
			new Connection(node.singleOutPort.name, this.id, this.singleInPort.name)
		);
	};

	Node.prototype.disconnectedByOutPort = function (outPort) {
		outPort._node._context.removeConnection(
			outPort._node,
			new Connection(outPort.name, this.id, this.singleInPort.name)
		);
	};

	Node.prototype.acceptsConnection = function (connection) {
		return !this.outputsTo.some(function (candidate) {
			return candidate.equals(connection);
		});
	};

	Node.prototype.addConnection = function (connection) {
		if (!this.acceptsConnection(connection)) {
			throw new Error(
				'could not connect [' + connection.output + '] to [' + connection.input + ']'
			);
		}

		this.outputsTo.push(connection);

		return this;
	};

	Node.prototype.removeConnection = function (connection) {
		var index = _(this.outputsTo).index(function (candidate) {
			return candidate.equals(connection);
		});
		if (index > -1) {
			connection.splice(index, 1);
		}
		return this;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.Node = Node;
})();
