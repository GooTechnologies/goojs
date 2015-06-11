(function () {
	'use strict';

	function Node() {}

	Node.prototype.connect = function (that) {
		that.connectedByNode(this);
	};

	Node.prototype.disconnect = function (that) {
		that.disconnectedByNode(this);
	};

	Node.prototype.acceptsConnection = function (connection) {
		return !this.outputsTo.some(function (candidate) {
			return candidate.equals(connection);
		});
	};

	Node.prototype.addConnection = function (connection) {
		if (!this.acceptsConnection(connection)) { return; }

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
