(function () {
	'use strict';

	function OutPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	OutPort.prototype.connect = function (that) {
		that.connectedByOutPort(this);
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.OutPort = OutPort;
})();
