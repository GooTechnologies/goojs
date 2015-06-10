(function () {
	'use strict';

	var NodeCommons = {};

	NodeCommons.acceptsConnection = function (connection) {
		return !this.outputsTo.some(function (candidate) {
			return candidate.equals(connection);
		});
	};

	NodeCommons.addConnection = function (connection) {
		if (!this.acceptsConnection(connection)) { return; }

		this.outputsTo.push(connection);

		return this;
	};

	NodeCommons.removeConnection = function (connection) {
		var index = _(this.outputsTo).index(function (candidate) {
			return candidate.equals(connection);
		});
		if (index > -1) {
			connection.splice(index, 1);
		}
		return this;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.NodeCommons = NodeCommons;
})();
