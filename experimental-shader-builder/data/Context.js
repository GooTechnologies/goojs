(function () {
	'use strict';

	var Structure = shaderBits.Structure;
	var ExternalNode = shaderBits.ExternalNode;
	var FunctionNode = shaderBits.FunctionNode;

	function generateConstructor(name, inputs, outputs, defines) {
		var constructor = function () {
			FunctionNode.apply(this, arguments);

			// add outputs
			// addNode.sum.connect(outNode.red)
			outputs.forEach(function (output) {
				this[output.name] = new OutPort(output.name, outputs.type, this.id);
			}, this);
		};

		constructor.name = name; // non-standard in ES5
		constructor.prototype = Object.create(FunctionNode);
		constructor.prototype.constructor = constructor;

		defines.forEach(function (define) {
			Object.defineProperty(constructor.prototype, define.name, {
				get: function () {
					return this.defines[define.name];
				}, // convert back to number if of numeric type
				set: function (value) {
					this.defines[define.name] = value;
					return value;
				} // stringify to whatever type is needed int, float (obligatory period notation)
			});
		});

		return constructor;
	}

	function generateConstructors(typeDefintions) {
		return Object.keys(typeDefintions).reduce(function (constructors, typeDefinition) {
			constructors[typeDefinition] = generateConstructor(typeDefinition.name);
		}, {});
	}

	function Context(typeDefinitions) {
		this.typeDefinitions = typeDefinitions;
		this.constructors = generateConstructors(this.typeDefinitions);
		this.structure = new Structure();

		// should context come with a fixed `out` node?

		this.idCounter = 0;
	}

	Context.prototype.generateId = function () {
		this.idCounter++;
		return 'i' + this.idCounter;
	};

	Context.prototype.typesToJSON = function () {
		return this.typeDefinitions.toJSON();
	};

	Context.prototype.structureToJSON = function () {
		return this.structure.toJSON();
	};

	function externalCreator(inputType) {
		return function (name, dataType) {
			var node = new ExternalNode(this.generateId());
			node._context = this;

			node.external.inputType = inputType;
			node.external.name = name;
			node.external.dataType = dataType;

			this.structure.addNode(node);

			return node;
		};
	}

	Context.prototype.createUniform = externalCreator('uniform');
	Context.prototype.createAttribute = externalCreator('attribute');
	Context.prototype.createVarying = externalCreator('varying');

	Context.prototype.createFunction = function (type) {
		var node = new ExternalNode(this.generateId(), type);
		node._context = this;

		this.structure.addNode(node);

		return node;
	};
})();
