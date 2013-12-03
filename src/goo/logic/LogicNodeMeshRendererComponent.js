define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/entities/components/MeshRendererComponent',
		'goo/math/Vector3',
		'goo/math/Matrix3x3'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, MeshRendererComponent, Vector3, Matrix3x3) {
		"use strict";

		/**
		 * @class Logic node that calculates sine
		 */
		function LogicNodeMeshRendererComponent() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeMeshRendererComponent.logicInterface;
			this.type = "MeshRendererComponent";
			this.entity = null;
		}

		LogicNodeMeshRendererComponent.prototype = Object.create(LogicNode.prototype);
		LogicNodeMeshRendererComponent.editorName = "MeshRendererComponent";

		LogicNodeMeshRendererComponent.prototype.insertIntoLogicLayer = function(logicLayer, interfaceName) {
			this.logicInstance = logicLayer.addInterfaceInstance(LogicNodeMeshRendererComponent.logicInterface, this, interfaceName, false);
		};
		
		LogicNodeMeshRendererComponent.prototype.onConfigure = function(config) {
			this.entityRef = config.config.entityRef;
		};

		MeshRendererComponent.logicInterface = new LogicInterface("Material");
		MeshRendererComponent.inportShadows = MeshRendererComponent.logicInterface.addInputEvent("toggle-shadows");
		MeshRendererComponent.inportHidden = MeshRendererComponent.logicInterface.addInputEvent("toggle-hidden");
		MeshRendererComponent.inportAmbient = MeshRendererComponent.logicInterface.addInputProperty("ambient", "Vector3", new Vector3(0.5,0.0,0.0));

		MeshRendererComponent.prototype.insertIntoLogicLayer = function(logicLayer, interfaceName) {
			this.logicInstance = logicLayer.addInterfaceInstance(MeshRendererComponent.logicInterface, this, interfaceName, false);
		};

		MeshRendererComponent.prototype.onInputChanged = function(instDesc, portID, value) {
			var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
			var comp = entity.meshRendererComponent;
			
			if (portID === MeshRendererComponent.inportAmbient && comp.materials.length > 0) {
				comp.meshRendererComponent.materials[0].uniforms.materialAmbient[0] = value[0];
				comp.materials[0].uniforms.materialAmbient[1] = value[1];
				comp.materials[0].uniforms.materialAmbient[2] = value[2];
			}
		};

		MeshRendererComponent.prototype.onEvent = function(event) {
			var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
			var comp = entity.meshRendererComponent;

			if (event === MeshRendererComponent.inportShadows) {
				comp.castShadows = !comp.castShadows;
			} else if (event === MeshRendererComponent.inportHidden) {
				comp.hidden = !comp.hidden;
			}
		};

		LogicNodes.registerType("MeshRendererComponent", LogicNodeMeshRendererComponent);

		return LogicNodeMeshRendererComponent;
	});