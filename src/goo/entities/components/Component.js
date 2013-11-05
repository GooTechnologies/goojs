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
		this.propertyOutputs = {};
		this.propertyInputs = {};
		this.eventOutputs = {};
		this.eventInputs = {};
	}
	
	Component.prototype.makeConnectionName = function(name) {
		return this.type + "." + name;
	}
	
	Component.prototype.getInputWriterIfExists = function(fullName) {
	
		if (this.propertyInputs[fullName] !== undefined)
		{
			var propDef = this.propertyInputs[fullName];
			return function(nv) {
				console.log("My value has been updated " + propDef.value + " => " + nv);
				propDef.value = nv;
			};
		}
		else
		{
			return undefined;
		}
	}
	
	Component.prototype.addInputProperty = function(name, type, defaultValue, onChanged) {
	
		// 
		var propDef = {};
		
		propDef.name = this.makeConnectionName(name);
		propDef.type = type;
		propDef.value = defaultValue;
		propDef.onChanged = onChanged;
		
		propDef.reader = function() { 
			return propDef.value;
		};
		 
		this.propertyInputs[propDef.name] = propDef;
		return propDef.reader;
	}
	
	
	// returns a writer
	Component.prototype.addOutputProperty = function(name, type) {

		var fullName = this.makeConnectionName(name);
		
		var newDef = {};
		newDef.value = undefined;
		newDef.receivers = [];
		newDef.writeFn = function(nv) {
			newDef.value = nv;
			for (var i=0;i<newDef.receivers.length;i++)
			{
				if (newDef.receivers[i].onChanged !== undefined)
					newDef.receivers[i].onChanged(nv);
			}
		};
		
		this.propertyOutputs[fullName] = newDef;
		return newDef.writeFn;
	}

	Component.prototype.connect = function(portFullName, targetEntity, targetPortFullName)
	{
		// Check if this component exposes the output port in portFullName, if so connect according to the connection details.
		// There should be one matching component in the targetEntity which exposes the input port with name targetPortFullName
		var def = this.propertyOutputs[portFullName];
		if (def !== undefined)
		{
			// this relies on the component in the target being fully set up
			var success = false;
			targetEntity.forEachComponent(function(comp) {
				// if this is the component with a matching input port, write the current value
				// and add it to the receivers list.
				if (comp.propertyInputs == undefined)
					return;
					
				var receiver = comp.propertyInputs[targetPortFullName];
				if (receiver !== undefined)
				{
					if (receiver.onChanged !== undefined && def.value !== undefined)
						receiver.onChanged(def.value);
					def.receivers.push(receiver);
					success = true;
				}
			});
			
			if (!success)
			{
				// Ending up here means the target entity did not contain a component existing that port.
				console.warn("Attempted to make connection to target entity with port " + targetPortFullName + " which did not exist.");
			}
		}
		return success;
	}
	
	
	return Component;
});