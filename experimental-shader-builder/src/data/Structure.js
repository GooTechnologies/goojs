(function () {
	'use strict';

	function Structure() {
		this.nodes = {};
		this._context = null;
	}

	Structure.prototype.addNode = function (node) {
		this.nodes[node.id] = node;
		return this;
	};

	Structure.prototype.removeNode = function (node) {
		// remove connections to the node
		delete this.nodes[node.id];
		return this;
	};

	/**
	 * Checks if connections from this node eventually arrive at itself
	 * @param startNode
	 * @returns {boolean}
	 * @private
	 */
	Structure.prototype._returnsTo = function (startNode, connection) {
		var visited = new Set();

		function df(node) {
			if (node === startNode) {
				return true;
			}

			if (visited.has(node)) {
				return false;
			} else {
				visited.add(node);
			}

			return node.outputsTo.map(function (outputTo) {
				return this.nodes[outputTo.to];
			}, this).some(df, this);
		}

		return df.call(this, this.nodes[connection.to]);
	};

	Structure.prototype.acceptsConnection = function (node, connection) {
		var targetNode = this.nodes[connection.to];

		if (targetNode.incomingConnections[connection.input]) {
			return {
				result: false,
				reason: 'input "' + connection.input + '" is already occupied'
			};
		}


		var sourceType = this.nodes[node.id].type;
		var outputDefinitions = this._context.typeDefinitions[sourceType].outputs;
		var outputType = _(outputDefinitions).find(function (outputDefinition) {
			return outputDefinition.name === connection.output;
		}).type;

		var targetType = this.nodes[connection.to].type;
		var inputDefinitions = this._context.typeDefinitions[targetType].inputs;
		var inputType = _(inputDefinitions).find(function (inputDefinition) {
			return inputDefinition.name === connection.input;
		}).type;

		if (inputType !== outputType) {
			return {
				result: false,
				reason: 'could not match output "' + connection.output +
					'" of type ' + outputType + ' with input "' + connection.input +
					'" of type ' + inputType
			};
		}


		if (this._returnsTo(node, connection)) {
			return {
				result: false,
				reason: 'cannot have cycles'
			}
		}

		return {
			result: true
		};
	};

	// why proxy these operations?
	// because they'll verify the validity of the graph
	// the node alone cannot do that
	Structure.prototype.addConnection = function (node, connection) {
		var accepts = this.acceptsConnection(node, connection);
		if (!accepts.result) {
			throw new Error(
				'could not connect ' + node.id + '[' + connection.output + '] to ' +
				connection.to + '[' + connection.input + ']; ' + accepts.reason
			);
		}

		node.addConnection(connection);

		// occupy input
		var targetNode = this.nodes[connection.to];
		targetNode.incomingConnections[connection.input] = true;

		return this;
	};

	Structure.prototype.removeConnection = function (node, connection) {
		node.removeConnection(connection);
		return this;
	};

	Structure.prototype.toJSON = function () {
		return _(this.nodes).map(function (node) {
			return node.toJSON();
		});
	};

	Structure.fromJSON = function (json) {
		var structure = new Structure();
		_(json).forEach(function (nodeConfig) {
			var node = (nodeConfig.type === 'external' ? ExternalNode : FunctionNode).fromJSON(nodeConfig);
			structure.addNode(node);
		});
		return structure;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.Structure = Structure;
})();