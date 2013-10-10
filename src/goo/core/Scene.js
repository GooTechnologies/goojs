define(
	[],
	function() {
		"use strict";

		function Scene( parameters ) {
			this.systems  = [];
			this.entities = [];
		}

		Scene.prototype.init = function( goo ) {
			this.goo = goo;

			// setup systems
		};

		// general purpuse add/get/has

		Scene.prototype.add = function() {
		};

		Scene.prototype.get = function() {
		};

		Scene.prototype.has = function() {
		};

		Scene.prototype.remove = function() {
		};

		// system methods

		Scene.prototype.addSystem = function() {
		};

		Scene.prototype.getSystem = function() {
		};

		Scene.prototype.hasSystem = function() {
		};

		Scene.prototype.removeSystem = function() {
		};

		// entity methods

		Scene.prototype.addEntitiy = function( entity ) {
			entity.scene = this;
		};

		Scene.prototype.getEntity = function() {
		};

		Scene.prototype.hasEntity = function() {
		};

		Scene.prototype.removeEntity = function() {
		};

		// process

		Scene.prototype.process = function( processParameters ) {
			var system, systems = this.systems;
			var s, sl = systems.length;

			for( s = 0; s < sl; s++ ) {
				system = systems[ s ];
				if( systems.enabled ) {
					systems.process();
				}
			}
		};

		return Scene;
	}
);