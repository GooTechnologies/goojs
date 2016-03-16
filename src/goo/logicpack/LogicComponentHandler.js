import ComponentHandler from '../loaders/handlers/ComponentHandler';
import LogicComponent from './LogicComponent';
import RSVP from '../util/rsvp';
import PromiseUtils from '../util/PromiseUtils';
import LogicNodeEntityProxy from './logic/LogicNodeEntityProxy';
import LogicNodeTransformComponent from './logic/LogicNodeTransformComponent';
import LogicNodeMeshRendererComponent from './logic/LogicNodeMeshRendererComponent';
import LogicNodeLightComponent from './logic/LogicNodeLightComponent';
import LogicNodeDebug from './logic/LogicNodeDebug';
import LogicNodeRandom from './logic/LogicNodeRandom';
import LogicNodeTime from './logic/LogicNodeTime';
import LogicNodeSine from './logic/LogicNodeSine';
import LogicNodeVec3 from './logic/LogicNodeVec3';
import LogicNodeMultiply from './logic/LogicNodeMultiply';
import LogicNodeWASD from './logic/LogicNodeWASD';
import LogicNodeWASD2 from './logic/LogicNodeWASD2';
import LogicNodeMouse from './logic/LogicNodeMouse';
import LogicNodeAdd from './logic/LogicNodeAdd';
import LogicNodeSub from './logic/LogicNodeSub';
import LogicNodeFloat from './logic/LogicNodeFloat';
import LogicNodeApplyMatrix from './logic/LogicNodeApplyMatrix';
import LogicNodeConstVec3 from './logic/LogicNodeConstVec3';
import LogicNodeVec3Add from './logic/LogicNodeVec3Add';
import LogicNodeRotationMatrix from './logic/LogicNodeRotationMatrix';
import LogicNodeMultiplyFloat from './logic/LogicNodeMultiplyFloat';
import LogicNodeMax from './logic/LogicNodeMax';
import LogicNodeInt from './logic/LogicNodeInt';
import LogicNodeInput from './logic/LogicNodeInput';
import LogicNodeOutput from './logic/LogicNodeOutput';

/**
* 	* @private
*/
function LogicComponentHandler() {
	ComponentHandler.apply(this, arguments);
}

LogicComponentHandler.prototype = Object.create(ComponentHandler.prototype);
LogicComponentHandler.prototype.constructor = LogicComponentHandler;
ComponentHandler._registerClass('logic', LogicComponentHandler);

LogicComponentHandler.prototype._create = function (entity, config) {
	var c = new LogicComponent(entity);
	c.configure(config);
	entity.setComponent(c);
	return c;
};

LogicComponentHandler.prototype.update = function (entity, config) {
	var component = ComponentHandler.prototype.update.call(this, entity, config);
	component.configure(config);
	return PromiseUtils.resolve(component);
};

export default LogicComponentHandler;
