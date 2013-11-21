define(
	['goo/logic/LogicInterface'],
	/** @lends */
	function(LogicInterface) {
		"use strict";

		/**
		 * @class Base class/module for all logic boxes
		 */
		function LogicNode() {
			// Generated the same way as entities are, except different naming.
			Object.defineProperty(this, 'id', {
				value: LogicNode.instanceCount++,
				writable: false
			});

			// create default configuration.
			this.config = {
				ref: ('unconf-' + this.id)
			};

			this.name = name !== undefined ? name : 'Logic_' + this.id;

			// If instantiated in a logic layer.
			this.logicInstance = null;

			// For now this needs to be set to true in the constructor of those who wants it, or 
			// at least before addToWorldLogic is called.
			this.wantsProcessCall = false;
		}

		/**
		 * Add the logic node to the world's logic layer. This is necessary a necessary step for allowing
		 * connections. This should be called by logic node implementations.
		 *
		 * @param {world} World to add it to
		 */
		LogicNode.prototype.addToWorldLogic = function(world) {
			// Cleanup of previous; this will also remove connections so we always need to (re-) add them.
			if (this.logicInstance !== null) {
				this.logicInstance.remove();
			}

			var logicLayer = world.getSystem('LogicSystem').logicLayer;
			
			this.logicInstance = logicLayer.addInterfaceInstance(this.logicInterface, this, this.config.ref, this.wantsProcessCall);
			
			if (this.config.connections !== undefined) {
				// need to add connections every time since adding to world logic erases
				// previously stored connections (with 'obj' as source)
				for (var i = 0; i < this.config.connections.length; i++) {
					var conn = this.config.connections[i];
					logicLayer.addConnectionByName(this.logicInstance, conn.sourcePort, conn.targetRef, conn.targetPort);
				}
			}
		};

		LogicNode.prototype.configure = function(newConfig) {
			this.onConfigure(newConfig);
			this.config = newConfig;
		};

		/**
		 * Override me
		 */
		LogicNode.prototype.onConfigure = function(newConfig) {};
		LogicNode.prototype.onSystemStarted = function() {};
		LogicNode.prototype.onSystemStopped = function(stopForPause) {};
		LogicNode.prototype.onInputChanged = function(instDesc, port, nv) { console.log("onInputChanged on " + this.config.ref + " port " + port + " nv=" + nv); }
		
		LogicNode.instanceCount = 0;

		return LogicNode;
	});