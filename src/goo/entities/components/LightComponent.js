define(
	[ "goo/entities/components/Component",
	  "goo/renderer/light/PointLight",
	  "goo/renderer/light/DirectionalLight",
	  "goo/renderer/light/SpotLight",
	  "goo/math/Vector3"],
	/** @lends */
	function (Component, PointLight, DirectionalLight, SpotLight, Vector3) {
	"use strict";

	/**
	 * @class Defines a light
	 * @param {Light|Object} light Light to contain in this component (directional, spot, point) or an object with parameters for a point light. Supported parameters are color, intensity, specular intensit and range 
 	 */
	function LightComponent(light) {
		this.type = 'LightComponent';

		light = light || new PointLight;

		if( light instanceof PointLight ||
			light instanceof DirectionalLight ||
			light instanceof SpotLight ) {
			this.light = light;
		} else {
			this.light = new PointLight();
			if( light.color !== undefined ) {
				if( light.color instanceof Vector3 ) {
					this.light.color.setv( light.color );
				} else {
					this.light.color.seta( light.color );
				}
			}

			this.light.intensity         = light.intensity         !== undefined ? light.intensity         : 1;
			this.light.specularIntensity = light.specularIntensity !== undefined ? light.specularIntensity : 1;
			this.light.range             = light.range             !== undefined ? light.range             : 1000;
		}

		this.api = {
			"lightComponent" 		: this,
			"setColor" 				: this.setColor.bind( this ),
			"setIntensity" 			: this.setIntensity.bind( this ),
			"setSpecularIntensity" 	: this.setSpecularIntensity.bind( this )
		}
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.componentInit = Component.prototype.init;
	LightComponent.prototype.init = function( enitiy ) {
		this.componentInit( enitiy );
		this.entity.addAttribute( "@light" );
	};

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