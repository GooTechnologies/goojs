(function () {
	'use strict';

	function FunctionNode(id, type) {
		this.id = id;
		this.type = type;
		this.outputsTo = [];
		this.defines = {};
	}

	FunctionNode.prototype.addConnection = NodeCommons.addConnection;
	FunctionNode.prototype.removeConnection = NodeCommons.removeConnection;

	FunctionNode.prototype.toJSON = function () {
		return {
			id: this.id,
			type: this.type,
			outputsTo: this.outputsTo.map(function (outputTo) {
				return outputTo.toJSON();
			}),
			defines: _.clone(this.defines)
		};
	};

	FunctionNode.fromJSON = function (config) {
		var node = new FunctionNode(config.id, config.type);
		config.outputsTo.forEach(function (outputTo) {
			node.addConnection(Connection.fromJSON(outputTo));
		});
		node.defines = _.clone(config.defines);
		return node;
	};
})();