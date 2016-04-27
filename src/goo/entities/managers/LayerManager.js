var Manager = require('./Manager');

/**
 * Handles all layers in the world.
 * @extends Manager
 */
function LayerManager() {

	// All the layer names
	this.layers = [];

	for (var i=0; i<32; i++) {
		var name;
		if (i === 0) {
			name = 'Default';
		} else {
			name = 'Layer ' + i;
		}
		this.layers.push(name);
	}
}
LayerManager.prototype = Object.create(Manager.prototype);
LayerManager.prototype.constructor = LayerManager;

/**
 * Returns a layer mask given an array of layers.
 * @param  {array} layers
 * @return {number}
 */
LayerManager.prototype.getMaskFromLayers = function (layers) {
	var mask = 0;
	var l = layers.length;
	while (l--) {
		mask |= layers[l];
	}
	return mask;
};

/**
 * Set the name of a layer.
 * @param {number} layer
 * @param {string} name
 */
LayerManager.prototype.setName = function (layer, name) {
	var index = Math.log2(layer);
	this.layers[index] = name;
};

/**
 * Returns a layer mask given a set of layer names.
 * @param {array} names
 * @returns {number}
 */
LayerManager.prototype.getMaskFromNames = function (names) {
	var l = names.length;
	var layers = new Array(l);
	while (l--) {
		layers[l] = this.nameToLayer(names[l]);
	}
	return this.getMaskFromLayers(layers);
};

/**
 * Returns the name of a layer.
 * @param {number} layer
 * @returns {string}
 */
LayerManager.prototype.layerToName = function (layer) {
	var index = Math.log2(layer);
	return this.layers[index];
};

/**
 * Returns the layer for the given name, or 0 if the name does not exist.
 * @param {string} name
 * @returns {number}
 */
LayerManager.prototype.nameToLayer = function (name) {
	var index = this.layers.indexOf(name);
	if (index === -1) {
		return -1;
	}
	return this.layers[index];
};

module.exports = LayerManager;