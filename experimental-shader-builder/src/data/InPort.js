define([
	'shader-bits/data/Connection'
], function (
	Connection
) {
	'use strict';

	function InPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	InPort.prototype.connectedByNode = function (node) {
		this.connectedByOutPort(node.singleOutPort);
	};

	InPort.prototype.connectedByOutPort = function (outPort) {
		outPort._node._context.structure.addConnection(
			outPort._node,
			new Connection(outPort.name, this._node.id, this.name)
		);
	};

	InPort.prototype.disconnectedByNode = function (node) {
		this.disconnectedByOutPort(node.singleOutPort);
	};

	InPort.prototype.disconnectedByOutPort = function (outPort) {
		outPort._node._context.structure.removeConnection(
			outPort._node,
			new Connection(outPort.name, this._node.id, this.name)
		);
	};

	return InPort;
});
