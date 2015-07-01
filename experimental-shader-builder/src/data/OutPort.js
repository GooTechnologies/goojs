define(function () {
	'use strict';

	function OutPort(name, type) {
		this.name = name;
		this.type = type;
		this._node = null;
	}

	OutPort.prototype.connect = function (that) {
		that.connectedByOutPort(this);
	};

	OutPort.prototype.disconnect = function (that) {
		that.disconnectedByOutPort(this);
	};

	return OutPort;
});
