(function () {
	'use strict';

	function InPort(name, type, nodeId) {
		this.name = name;
		this.type = type;
		this.nodeId = nodeId;
	}

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.InPort = InPort;
})();
