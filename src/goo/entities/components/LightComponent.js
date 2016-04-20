var Component = require('../../entities/components/Component');
var Light = require('../../renderer/light/Light');

/**
 * Defines a light<br>
 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example
 * @param {Light} light Light to contain in this component (directional, spot, point)
 * @extends Component
 */
function LightComponent(light) {
	Component.apply(this, arguments);

	this.type = 'LightComponent';

	/**
     * Light contained in this component.
     */
	this.light = light;

	/**
	 * @type {boolean}
	 * @default
	 */
	this.hidden = false;

	this._transformDirty = true;
	this._transformUpdatedListener = null;

	// @ifdef DEBUG
	Object.seal(this);
	// @endif
}

LightComponent.type = 'LightComponent';

LightComponent.prototype = Object.create(Component.prototype);
LightComponent.prototype.constructor = LightComponent;

LightComponent.prototype.attached = function () {
	var that = this;
	this.entity.on('transformUpdated', this._transformUpdatedListener = function () {
		that._transformDirty = true;
	});
};

LightComponent.prototype.detached = function () {
	this.entity.off('transformUpdated', this._transformUpdatedListener);
	this._transformUpdatedListener = null;
};

LightComponent.prototype.updateLight = function (transform) {
	this.light.update(transform);
};

LightComponent.prototype.copy = function (source) {
	// has to be the same sort of light
	this.light.copy(source);

	// the status depends on the entity and its ancestors
	this.hidden = source.hidden;

	return this;
};

LightComponent.prototype.clone = function () {
	var clone = new LightComponent(this.light.clone());

	// this status needs updating
	clone.hidden = this.hidden;
	return clone;
};

LightComponent.applyOnEntity = function (obj, entity) {
	if (obj instanceof Light) {
		var lightComponent = new LightComponent(obj);
		entity.setComponent(lightComponent);
		return true;
	}
};

module.exports = LightComponent;