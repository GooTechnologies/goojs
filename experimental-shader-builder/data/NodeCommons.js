(function () {
	'use strict';

	var NodeCommons = {};

	NodeCommons.addConnection = function (connection) {
		var exists = this.outputsTo.some(function (candidate) {
			return candidate.equals(connection);
		});
		if (!exists) {
			this.outputsTo.push(connection);
		}
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
})();
