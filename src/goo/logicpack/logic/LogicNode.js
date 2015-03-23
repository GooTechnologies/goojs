define(

	function() {
		'use strict';

		/**
		 * Base class/module for all logic boxes
		 * @private
		 */
		function LogicNode() {
			// Generated the same way as entities are, except different naming.
			Object.defineProperty(this, 'id', {
				value: LogicNode._instanceCount++,
				writable: false
			});

			// create default configuration.
			this.config = {
				ref: 'unconf-' + this.id
			};

			this.name = name !== undefined ? name : 'Logic_' + this.id;

			// If instantiated in a logic layer.
			this.logicInstance = null;

			// For now this needs to be set to true in the constructor of those who wants it, or 
			// at least before addToWorldLogic is called.
			this.wantsProcessCall = false;
		}

		/**
		 * Add the logic node to the world's logic layer. This is a necessary step for allowing
		 * connections. This should be called by logic node implementations.
		 *
		 * @param {world} World to add it to
		 */
		LogicNode.prototype.addToLogicLayer = function(logicLayer, withId) {
			// Cleanup of previous; this will also remove connections so we always need to (re-) add them.
			if (this.logicInstance !== null) {
				this.logicInstance.remove();
			}

			this.logicInstance = logicLayer.addInterfaceInstance(this.logicInterface, this, withId, this.wantsProcessCall);

			if (this.connections !== undefined) {
				// data comes from configure call.
				for (var i = 0; i < this.connections.length; i++) {
					var conn = this.connections[i];
					logicLayer.addConnectionByName(this.logicInstance, conn.sourcePort, conn.targetRef, conn.targetPort);
				}

				// this prevents duplicate adding.
				delete this.connections;
			}
		};

		LogicNode.prototype.configure = function(nodeData) {
			var c = (nodeData.config !== undefined) ? nodeData.config : {};
			this.onConfigure(c);
			this.config = c;
			this.connections = nodeData.connections;
		};

		/**
		 * Called after getting new configuration data; before getting added to world. Override
		 * this function and not configure.
		 * @param newConfig The new configuration data.
		 */
		LogicNode.prototype.onConfigure = function() {};

		/**
		 * When logic system is started.
		 */
		LogicNode.prototype.onSystemStarted = function() {};

		/**
		 * Called when system is stopped.
		 * @param stopForPause If true, world has been paused. Otherwise stopped & reset.
		 */
		LogicNode.prototype.onSystemStopped = function() {};

		/**
		 * Called when node receives an input value.
		 * @param instDesc Instance description
		 * @param port Port ID
		 * @param nv New value on that particular port.
		 */
		LogicNode.prototype.onInputChanged = function() {};

		LogicNode._instanceCount = 0;

		return LogicNode;
	});