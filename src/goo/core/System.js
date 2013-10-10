define( 
	[],
	function() {

		"use strict";

		function System() {
			this.goo = undefined;
		}

		System.prototype.init = function ( goo ) {
			this.goo = goo;
		};

		System.prototype.process = function ( entities, processParameters ) {
		};

		System.prototype.dispose = function () {
		};
	
		return System;
	}
);