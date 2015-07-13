define([
	'shader-bits/data/Node',
	'shader-bits/data/Connection',
	'shader-bits/data/InPort'
], function (
	Node,
	Connection,
	InPort
) {
	'use strict';

	/**
	 * Wrapper for external outputs (varying in the vertex context).
	 * These nodes have no outputs and can only take inputs.
	 * @param id
	 * @param config
	 * @constructor
	 */
	function ExternalOutputNode(id, config) {
		Node.call(this, id);

		this.type = 'external-output';
		this.external = {
			name: config.name,
			inputType: config.inputType,
			dataType: config.dataType
		};
		this.singleInPort = new InPort('value', config.dataType);
		this.singleInPort._node = this;
		this._context = null;
		Object.seal(this);
	}

	ExternalOutputNode.prototype = Object.create(Node.prototype);
	ExternalOutputNode.prototype.constructor = ExternalOutputNode;

	ExternalOutputNode.prototype.toJson = function () {
		return {
			id: this.id,
			type: this.type,
			external: {
				name: this.external.name,
				inputType: this.external.inputType,
				dataType: this.external.dataType
			},
			outputsTo: []
		};
	};

	ExternalOutputNode.fromJson = function (config) {
		var node = new ExternalOutputNode(config.id, config.external);

		config.outputsTo.forEach(function (outputTo) {
			node.addConnection(Connection.fromJson(outputTo));
		});

		return node;
	};

	return ExternalOutputNode;
});