(function () {
	'use strict';

	var NodeCommons = shaderBits.NodeCommons;
	var Connection = shaderBits.Connection;

	function FunctionNode(id, type) {
		this.id = id;
		this.type = type;
		this.outputsTo = [];
		this.defines = {};
		this._context = null;
	}

	FunctionNode.prototype.canConnect = NodeCommons.canConnect;
	FunctionNode.prototype.connect = NodeCommons.connect;
	FunctionNode.prototype.disconnect = NodeCommons.disconnect;

	FunctionNode.prototype.setDefine = function (name, value) {
		this.defines[name] = value;
	};

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

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.FunctionNode = FunctionNode;
})();