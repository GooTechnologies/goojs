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
	 * Only reflows * types
	 * @param startNode
	 * @param connection
	 * @private
	 */
	Structure.prototype._reflowTypes = function (startNode, connection) {
		var typeDefinitions = this._context.typeDefinitions;
		var nodes = this.nodes;

		function resolveType(node, inputType, resolvedType) {
			if (node.resolvedTypes.has(inputType)) {
				// throw exceptions on mismatch
				// same node may have the generic type already resolved by some other input
				var alreadyResolvedType = node.resolvedTypes.get(inputType);
				if (alreadyResolvedType.type !== resolvedType) {
					throw new Error(
						'could not match ' + resolvedType +
						' with already resolved generic type ' + inputType + ' of ' + alreadyResolvedType.type
					);
				} else {
					alreadyResolvedType.count++;
				}
			} else {
				node.resolvedTypes.set(inputType, {
					type: resolvedType,
					count: 1
				});
			}

			// propagate if there are outputs with the same generic type
			var outputs = typeDefinitions[node.type].outputs.filter(function (output) {
				return output.generic && output.type === inputType;
			}).map(function (output) {
				return output.name;
			});

			// and any connections starting from those inputs
			node.outputsTo.forEach(function (outputTo) {
				if (outputs.indexOf(outputTo.output) !== -1) {
					propagate(node, outputTo);
				}
			});
		}


		function propagate(startNode, connection) {
			var outputDefinitions = typeDefinitions[startNode.type].outputs;
			var outputDefinition = _(outputDefinitions).find(function (output) {
				return output.name === connection.output;
			});


			var targetNode = nodes[connection.to];
			var inputsDefinition = typeDefinitions[targetNode.type].inputs;
			var inputDefinition = _(inputsDefinition).find(function (input) {
				return input.name === connection.input;
			});


			var outputType;
			if (outputDefinition.generic && startNode.resolvedTypes.has(outputDefinition.type)) {
				outputType = startNode.resolvedTypes.get(outputDefinition.type).type;
			} else if (!outputDefinition.generic) {
				outputType = outputDefinition.type;
			} else {
				return;
			}


			if (inputDefinition.generic) {
				resolveType(targetNode, inputDefinition.type, outputType);
			} else {
				if (outputType !== inputDefinition.type) {
					throw new Error(
						'could not match type ' + outputType +
						' with type ' + inputDefinition.type
					);
				}
			}
		}

		propagate(startNode, connection);
	};

	Structure.prototype._unflowTypes = function (startNode, connection) {
		var typeDefinitions = this._context.typeDefinitions;
		var nodes = this.nodes;

		function unresolveType(node, inputType) {
			var entry = node.resolvedTypes.get(inputType);
			entry.count--;
			if (entry.count === 0) {
				node.resolvedTypes.delete(inputType);

				// propagate if there are outputs with the same generic type
				var outputs = typeDefinitions[node.type].outputs.filter(function (output) {
					return output.generic && output.type === inputType;
				}).map(function (output) {
					return output.name;
				});

				// and any connections starting from those inputs
				node.outputsTo.forEach(function (outputTo) {
					if (outputs.indexOf(outputTo.output) !== -1) {
						propagate(node, outputTo);
					}
				});
			}
		}

		function propagate(node, connection) {
			var outputDefinitions = typeDefinitions[startNode.type].outputs;
			var outputDefinition = _(outputDefinitions).find(function (output) {
				return output.name === connection.output;
			});


			var targetNode = nodes[connection.to];
			var inputsDefinition = typeDefinitions[targetNode.type].inputs;
			var inputDefinition = _(inputsDefinition).find(function (input) {
				return input.name === connection.input;
			});


			// check ot see if there is any "unresolveness" that can be propagated
			if (
				(!outputDefinition.generic || node.resolvedTypes.has(outputDefinition.type)) &&
				inputDefinition.generic &&
				targetNode.resolvedTypes.has(inputDefinition.type)
			) {
				unresolveType(targetNode, inputDefinition.type);
			}
		}

		propagate(startNode, connection);
	};

	/**
	 * Checks if connections from this node eventually arrive at itself
	 * @param startNode
	 * @param connection
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

		if (targetNode.incomingConnections.has(connection.input)) {
			return {
				result: false,
				reason: 'input "' + connection.input + '" is already occupied'
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
	// because they can verify the validity of the graph
	// while the node alone cannot do that
	Structure.prototype.addConnection = function (node, connection) {
		var accepts = this.acceptsConnection(node, connection);
		if (!accepts.result) {
			throw new Error(
				'could not connect ' + node.id + '[' + connection.output + '] to ' +
				connection.to + '[' + connection.input + ']; ' + accepts.reason
			);
		}

		this._reflowTypes(node, connection);

		node.addConnection(connection);

		// occupy input
		var targetNode = this.nodes[connection.to];
		targetNode.incomingConnections.add(connection.input);

		return this;
	};

	Structure.prototype.removeConnection = function (node, connection) {
		this._unflowTypes(node, connection);
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