define(
	[ "goo/entities/components/Component",
	  "goo/renderer/light/PointLight"],
	/** @lends */
	function (Component, PointLight) {
	"use strict";

	/**
	 * @class Defines a light
	 * @param {Light} light Light to contain in this component (directional, spot, point)
	 */
	function LightComponent(light) {
		this.type = 'LightComponent';

		this.light = light || new PointLight();
		this.api = {
			"lightComponent" 		: this,
			"setColor" 				: this.setColor.bind( this ),
			"setIntensity" 			: this.setIntensity.bind( this ),
			"setSpecularIntensity" 	: this.setSpecularIntensity.bind( this )
		}
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.updateLight = function (transform) {
		this.light.update(transform);
	};

	LightComponent.prototype.setColor = function( rOrHex, g, b ) {
		// REVIEW: allow hex! Might be a good idea to introduce a Color-class

		this.light.color.set( rOrHex, g, b );
		this.changedColor = true;
	};

	LightComponent.prototype.setIntensity = function( value ) {
		this.light.intensity   		 = value;
		this.light.changedProperties = true;
	};

	LightComponent.prototype.setSpecularIntensity = function( value ) {
		this.light.specularIntensity = value;
		this.light.changedProperties = true;
	};


	return LightComponent;
});