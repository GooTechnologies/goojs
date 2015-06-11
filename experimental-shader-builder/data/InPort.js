(function () {
	'use strict';

	var Connection = shaderBits.Connection;

	function InPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	InPort.prototype.connectedByNode = function (node) {
		this.connectedByOutPort(node.singleOutPort);
	};

	InPort.prototype.connectedByOutPort = function (outPort) {
		outPort._node.addConnection(new Connection(outPort.name, this._node.id, this.name));
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.InPort = InPort;
})();
