(function () {
	'use strict';

	var Node = shaderBits.Node;
	var Connection = shaderBits.Connection;

	function extractResolvedTypes(map) {
		var obj = {};
		map.forEach(function (enty, key) {
			obj[key] = enty.type;
		});
		return obj;
	}

	function FunctionNode(id, type) {
		Node.call(this, id);

		this.type = type;
		this.outputsTo = [];
		this.defines = {};
		this._context = null;
	}

	FunctionNode.prototype = Object.create(Node.prototype);
	FunctionNode.prototype.constructor = FunctionNode;

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
			defines: _.clone(this.defines),
			resolvedTypes: extractResolvedTypes(this.resolvedTypes)
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