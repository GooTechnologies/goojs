(function () {
	'use strict';

	function OutPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	OutPort.prototype.connect = function (inPort) {
		this._node.connect(this.name, inPort.nodeId, inPort.name);
	};
})();
