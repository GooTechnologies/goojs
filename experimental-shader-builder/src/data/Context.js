(function () {
	'use strict';

	var Structure = shaderBits.Structure;
	var ExternalInputNode = shaderBits.ExternalInputNode;
	var ExternalOutputNode = shaderBits.ExternalOutputNode;
	var FunctionNode = shaderBits.FunctionNode;
	var InPort = shaderBits.InPort;
	var OutPort = shaderBits.OutPort;
	var DataFormatter = shaderBits.DataFormatter;

	function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}

	function generateConstructor(name, inputs, outputs, defines) {
		var constructor = function () {
			FunctionNode.apply(this, arguments);

			// add inputs/outputs
			// addNode.sum.connect(outNode.red)
			inputs.forEach(function (input) {
				var inPort = new InPort(input.name, input.type);
				inPort._node = this;
				this[input.name] = inPort;
			}, this);

			if (inputs.length === 1) {
				this.singleInPort = new InPort(inputs[0].name, inputs[0].type);
				this.singleInPort._node = this;
			}

			outputs.forEach(function (output) {
				var outPort = new OutPort(output.name, output.type);
				outPort._node = this;
				this[output.name] = outPort;
			}, this);

			if (outputs.length === 1) {
				this.singleOutPort = new OutPort(outputs[0].name, outputs[0].type);
				this.singleOutPort._node = this;
			}

			// we want errors if we're setting invalid stuff on this node
			Object.seal(this);
		};

		//constructor.name = name; // readonly, doh!
		constructor.prototype = Object.create(FunctionNode.prototype);
		constructor.prototype.constructor = constructor;

		// these can stay on the prototype
		if (defines) {
			Object.keys(defines).forEach(function (name) {
				var define = defines[name];
				Object.defineProperty(constructor.prototype, define.name, {
					get: function () {
						// convert back to number if of numeric type
						return DataFormatter.decode(this.defines[define.name], define.type);
					},
					set: function (value) {
						// stringify to whatever type is needed
						// int (floor it)
						// float (obligatory period notation)
						this.defines[define.name] = DataFormatter.encode(value, define.type);
						return value;
					}
				});
			});
		}

		return constructor;
	}

	function generateConstructors(typeDefinitions) {
		return Object.keys(typeDefinitions).reduce(function (constructors, id) {
			var typeDefinition = typeDefinitions[id];
			constructors[id] = generateConstructor(
				typeDefinition.id,
				typeDefinition.inputs,
				typeDefinition.outputs,
				typeDefinition.defines
			);
			return constructors;
		}, {});
	}

	function generateNodeCreator(type) {
		return function () {
			var node = new this.constructors[type](this.generateId(), type);
			node._context = this;

			this.structure.addNode(node);

			return node;
		};
	}

	function attachNodeCreators(target, constructors) {
		Object.keys(constructors).forEach(function (id) {
			var methodName = 'create' + capitalize(id);
			target[methodName] = generateNodeCreator(id);
		});
	}

	function Context(typeDefinitions) {
		this.typeDefinitions = typeDefinitions;
		this.constructors = generateConstructors(this.typeDefinitions);
		attachNodeCreators(this, this.constructors);

		this.structure = new Structure();
		this.structure._context = this;

		this._idCounter = 0;
	}

	Context.prototype.generateId = function () {
		this._idCounter++;
		return 'i' + this._idCounter;
	};

	Context.prototype.typesToJson = function () {
		return this.typeDefinitions.toJson();
	};

	Context.prototype.structureToJson = function () {
		return this.structure.toJson();
	};

	function externalCreator(inputType) {
		return function (name, dataType) {
			var node = new ExternalInputNode(this.generateId(), {
				name: name,
				inputType: inputType,
				dataType: dataType
			});
			node._context = this;

			this.structure.addNode(node);

			return node;
		};
	}

	Context.prototype.createUniform = externalCreator('uniform');
	Context.prototype.createAttribute = externalCreator('attribute');

	Context.prototype.createFunction = function (type) {
		var node = new this.constructors[type](this.generateId());
		node._context = this;

		this.structure.addNode(node);

		return node;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.Context = Context;
})();
