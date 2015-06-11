(function () {
	'use strict';

	var Connection = shaderBits.Connection;

	function OutPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	OutPort.prototype.connect = function (inPort) {
		this._node.connect(new Connection(this.name, inPort.nodeId, inPort.name));
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.OutPort = OutPort;
})();
