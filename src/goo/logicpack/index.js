import LogicInterface from './logic/LogicInterface';
import LogicLayer from './logic/LogicLayer';
import LogicNode from './logic/LogicNode';
import LogicNodeAdd from './logic/LogicNodeAdd';
import LogicNodeApplyMatrix from './logic/LogicNodeApplyMatrix';
import LogicNodeConstVec3 from './logic/LogicNodeConstVec3';
import LogicNodeDebug from './logic/LogicNodeDebug';
import LogicNodeEntityProxy from './logic/LogicNodeEntityProxy';
import LogicNodeFloat from './logic/LogicNodeFloat';
import LogicNodeInput from './logic/LogicNodeInput';
import LogicNodeInt from './logic/LogicNodeInt';
import LogicNodeLightComponent from './logic/LogicNodeLightComponent';
import LogicNodeMax from './logic/LogicNodeMax';
import LogicNodeMeshRendererComponent from './logic/LogicNodeMeshRendererComponent';
import LogicNodeMouse from './logic/LogicNodeMouse';
import LogicNodeMultiply from './logic/LogicNodeMultiply';
import LogicNodeMultiplyFloat from './logic/LogicNodeMultiplyFloat';
import LogicNodeOutput from './logic/LogicNodeOutput';
import LogicNodeRandom from './logic/LogicNodeRandom';
import LogicNodeRotationMatrix from './logic/LogicNodeRotationMatrix';
import LogicNodes from './logic/LogicNodes';
import LogicNodeSine from './logic/LogicNodeSine';
import LogicNodeSub from './logic/LogicNodeSub';
import LogicNodeTime from './logic/LogicNodeTime';
import LogicNodeTransformComponent from './logic/LogicNodeTransformComponent';
import LogicNodeVec3 from './logic/LogicNodeVec3';
import LogicNodeVec3Add from './logic/LogicNodeVec3Add';
import LogicNodeWASD from './logic/LogicNodeWASD';
import LogicNodeWASD2 from './logic/LogicNodeWASD2';
import LogicComponent from './LogicComponent';
import LogicComponentHandler from './LogicComponentHandler';
import LogicSystem from './LogicSystem';

module.exports = {
	LogicInterface,
	LogicLayer,
	LogicNode,
	LogicNodeAdd,
	LogicNodeApplyMatrix,
	LogicNodeConstVec3,
	LogicNodeDebug,
	LogicNodeEntityProxy,
	LogicNodeFloat,
	LogicNodeInput,
	LogicNodeInt,
	LogicNodeLightComponent,
	LogicNodeMax,
	LogicNodeMeshRendererComponent,
	LogicNodeMouse,
	LogicNodeMultiply,
	LogicNodeMultiplyFloat,
	LogicNodeOutput,
	LogicNodeRandom,
	LogicNodeRotationMatrix,
	LogicNodes,
	LogicNodeSine,
	LogicNodeSub,
	LogicNodeTime,
	LogicNodeTransformComponent,
	LogicNodeVec3,
	LogicNodeVec3Add,
	LogicNodeWASD,
	LogicNodeWASD2,
	LogicComponent,
	LogicComponentHandler,
	LogicSystem
};

import ObjectUtils from './../util/ObjectUtils';

if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}