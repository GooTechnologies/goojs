(function () {
	'use strict';

	var NodeCommons = {};

	NodeCommons.canConnect = function (connection) {
		return !this.outputsTo.some(function (candidate) {
			return candidate.equals(connection);
		});
	};

	NodeCommons.connect = function (connection) {
		if (!this.canConnect(connection)) { return; }

		this.outputsTo.push(connection);

		return this;
	};

	NodeCommons.disconnect = function (connection) {
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
