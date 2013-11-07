define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Base class/module for all components
	 */
	function Component() {
		/** If the component should be processed for containing entities
		 * @type {boolean}
		 * @default
		 */
		this.enabled = true;
		this.entity  = undefined;
		this.api     = {};
		this.type    = "Component";
	}

	Component.prototype.init = function( entity ) {
		this.entity = entity;
		this.applyAPI();
	};

	Component.prototype.applyAPI = function() {
		if( this.entity ) {
			var key;
			var api    = this.api;
			var entity = this.entity;

			for( key in api ) {
				if( entity[ key ] === undefined ) {
					entity[ key ] = api[ key ];
				} else {
					console.error( "Component.applyAPI: " + key + " is already taken, please see to that you don't have a duplicate or don't use the api." );
					return;
				}
			}
		}
	};

	Component.prototype.process = function( processParameters ) {
	};

	Component.prototype.clone = function() {
		var component = new Component();
		component.enabled = this.enabled;
		return component;
	};

	Component.prototype.dispose = function() {
	};

	return Component;
});
