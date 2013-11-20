define([
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/entities/components/Component',
	'goo/logic/LogicInterface'
],
/** @lends */
function (
	Transform,
	Vector3,
	Component,
	LogicInterface
) {
	"use strict";

	/**
	 * @class Holds the transform of an entity. It also allows for a scene graph to be created, where transforms are inherited
	 * down the tree.
	 */
	function TransformComponent() {
		Component.call(this);
		
		this.type = 'TransformComponent';

		/** Parent transformcomponent in the "scene graph"
		 * @type {TransformComponent}
		 * @default
		 */
		this.parent = null;
		/**
		 * Child transformcomponents in the "scenegraph"
		 * @type {TransformComponent[]}
		 */
		this.children = [];
		/** @type {Transform} */
		this.transform = new Transform();

		/** The entity's transform in world space.
		 * Read only. Automatically updated.
		 * @type {Transform} */
		this.worldTransform = new Transform();

		this._dirty = true;
		this._updated = false;
		
	}

	TransformComponent.prototype = Object.create(Component.prototype);
	TransformComponent.logicInterface = new LogicInterface("Transform");
	TransformComponent.inportPos = TransformComponent.logicInterface.addInputProperty("position", "Vector3", new Vector3(0,0,0));
	TransformComponent.inportRot = TransformComponent.logicInterface.addInputProperty("rotation", "Vector3", new Vector3(0,0,0));
	TransformComponent.inportScale = TransformComponent.logicInterface.addInputProperty("scale", "Vector3", new Vector3(1,1,1));
	
	TransformComponent.prototype.insertIntoLogicLayer = function(logicLayer, interfaceName) {
		this.logicInstance = logicLayer.addInterfaceInstance(TransformComponent.logicInterface, this, interfaceName, false);
	};
	
	TransformComponent.prototype.onPropertyWrite = function(portID, value) {
		if (portID === TransformComponent.inportPos) {
			this.setTranslation(value);
		} else if (portID === TransformComponent.inportRot) {
			this.setRotation(value[0], value[1], value[2]);
		} else if (portID === TransformComponent.inportScale) {
			this.setScale(value);
		}
	};

	/**
	 * Set this transform's translation.
	 * @param {Vector|Float[]|...Float} arguments Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setTranslation = function () {
		this.transform.translation.set(arguments);
		this._dirty = true;
		return this;
	};

	/**
	 * Set this transform's scale.
	 * @param {Vector|Float[]|...Float} arguments Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setScale = function () {
		this.transform.scale.set(arguments);
		this._dirty = true;
		return this;
	};

	/**
	 * Add to this transform's translation.
	 * @param {Vector|Float[]|...Float} arguments Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.addTranslation = function () {
		if(arguments.length === 3) {
			this.transform.translation.add(arguments);
		} else {
			this.transform.translation.add(arguments[0]);
		}
		this._dirty = true;
		return this;
	};

	/**
	 * Set this transform's rotation around X, Y and Z axis.
	 * The rotation is applied in XYZ order.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setRotation = function (x,y,z) {
		this.transform.rotation.fromAngles(x,y,z);
		this._dirty = true;
		return this;
	};

	/**
	 * Sets the transform to look in a specific direction.
	 * @param {Vector3} position Target position.
	 * @param {Vector3} up Up vector.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.lookAt = function (position, up) {
		this.transform.lookAt(position, up);
		this._dirty = true;
		return this;
	};

	/**
	 * Mark the component for updates of world transform
	 */
	TransformComponent.prototype.setUpdated = function () {
		this._dirty = true;
	};

	/**
	 * Attach a child transform to this component tree
	 *
	 * @param {TransformComponent} childComponent child transform component to attach
	 */
	TransformComponent.prototype.attachChild = function (childComponent) {
		var component = this;
		while(component) {
			if (component === childComponent) {
				console.warn('attachChild: An object can\'t be added as a descendant of itself.');
				return;
			}
			component = component.parent;
		}
		if (childComponent.parent) {
			childComponent.parent.detachChild(childComponent);
		}
		childComponent.parent = this;
		this.children.push(childComponent);
	};

	/**
	 * Detach a child transform from this component tree
	 *
	 * @param {TransformComponent} childComponent child transform component to detach
	 */
	TransformComponent.prototype.detachChild = function (childComponent) {
		if (childComponent === this) {
			console.warn('attachChild: An object can\'t be removed from itself.');
			return;
		}

		var index = this.children.indexOf(childComponent);
		if (index !== -1) {
			childComponent.parent = null;
			this.children.splice(index, 1);
		}
	};

	/**
	 * Update target transform contained by this component
	 */
	TransformComponent.prototype.updateTransform = function () {
		this.transform.update();
	};

	/**
	 * Update this transform components world transform (resulting transform considering parent transformations)
	 */
	TransformComponent.prototype.updateWorldTransform = function () {
		if (this.parent) {
			this.worldTransform.multiply(this.parent.worldTransform, this.transform);
		} else {
			this.worldTransform.copy(this.transform);
		}
		this._dirty = false;
		this._updated = true;
	};

	return TransformComponent;
});