(function () {
	'use strict';

	var Structure = shaderBits.Structure;
	var ExternalNode = shaderBits.ExternalNode;
	var FunctionNode = shaderBits.FunctionNode;
	var InPort = shaderBits.InPort;
	var OutPort = shaderBits.OutPort;

	function generateConstructor(name, inputs, outputs, defines) {
		var constructor = function () {
			FunctionNode.apply(this, arguments);

			// add inputs/outputs
			// addNode.sum.connect(outNode.red)
			inputs.forEach(function (input) {
				this[input.name] = new InPort(input.name, input.type, this.id);
			}, this);

			outputs.forEach(function (output) {
				var outPort = new OutPort(output.name, output.type);
				outPort._node = this;
				this[output.name] = outPort;
			}, this);

			// we want errors if we're setting invalid stuff on this node
			Object.seal(this);
		};

		//constructor.name = name; // readonly, doh!
		constructor.prototype = Object.create(FunctionNode.prototype);
		constructor.prototype.constructor = constructor;

		// these can stay on the prototype
		Object.keys(defines).forEach(function (name) {
			var define = defines[name];
			Object.defineProperty(constructor.prototype, define.name, {
				get: function () {
					// convert back to number if of numeric type
					return this.defines[define.name];
				},
				set: function (value) {
					// stringify to whatever type is needed int, float (obligatory period notation)
					this.defines[define.name] = value;
					return value;
				}
			});
		});

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
			var methodName = 'create' + goo.StringUtil.capitalize(id);
			target[methodName] = generateNodeCreator(id);
		});
	}

	function Context(typeDefinitions) {
		this.typeDefinitions = typeDefinitions;
		this.constructors = generateConstructors(this.typeDefinitions);
		attachNodeCreators(this, this.constructors);
		this.structure = new Structure();

		// every typeDefinitions have to have an Out, right?
		this.out = this.createOut();


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
		var node = new this.constructors[type](this.generateId());
		node._context = this;

		this.structure.addNode(node);

		return node;
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.Context = Context;
})();
