define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name AnimationLayer
	 * @class Animation layers are essentially independent state machines, managed by a single AnimationManager. Each maintains a set of possible
	 *        "steady states" - main states that the layer can be in. The layer can only be in one state at any given time. It may transition between
	 *        states, provided that a path is defined for transition from the current state to the desired one. *
	 * @param {String} name Name of layer
	 * @property {String} name Name of layer
	 */
	function AnimationLayer(name) {
		this.name = name;

		this.steadyStates = {};
		this.currentState = null;
		this.manager = null;
		this.layerBlender = null;
		this.transitions = {};
	}

	AnimationLayer.BASE_LAYER_NAME = '-BASE_LAYER-';

	return AnimationLayer;
});