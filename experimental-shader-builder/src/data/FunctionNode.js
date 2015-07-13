define([
	'shader-bits/data/Node',
	'shader-bits/data/Connection'
], function (
	Node,
	Connection
) {
	'use strict';

	function extractResolvedTypes(map) {
		var obj = {};
		map.forEach(function (enty, key) {
			obj[key] = enty.type;
		});
		return obj;
	}

	/**
	 * Wrapper for nodes that are functions (+, -, *, sin, etc... - neither inputs not outputs)
	 * @param id
	 * @param type
	 */
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

	FunctionNode.prototype.toJson = function () {
		return {
			id: this.id,
			type: this.type,
			outputsTo: this.outputsTo.map(function (outputTo) {
				return outputTo.toJson();
			}),
			defines: _.clone(this.defines),
			resolvedTypes: extractResolvedTypes(this.resolvedTypes)
		};
	};

	FunctionNode.fromJson = function (config) {
		var node = new FunctionNode(config.id, config.type);
		config.outputsTo.forEach(function (outputTo) {
			node.addConnection(Connection.fromJson(outputTo));
		});
		node.defines = _.clone(config.defines);
		return node;
	};

	return FunctionNode;
});