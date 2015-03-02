define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6484);
    function CopyJointTransformAction() {
        Action.apply(this, arguments);
        __touch(6492);
        this.everyFrame = true;
        __touch(6493);
    }
    __touch(6485);
    CopyJointTransformAction.prototype = Object.create(Action.prototype);
    __touch(6486);
    CopyJointTransformAction.prototype.constructor = CopyJointTransformAction;
    __touch(6487);
    CopyJointTransformAction.external = {
        name: 'Copy Joint Transform',
        type: 'animation',
        description: 'Copies a joint\'s transform from another entity, and applies it to this entity. This entity must be a child of an entity with an animation component',
        parameters: [{
                name: 'Joint',
                key: 'jointIndex',
                type: 'int',
                control: 'jointSelector',
                'default': null,
                description: 'Joint transform to copy'
            }],
        transitions: []
    };
    __touch(6488);
    CopyJointTransformAction.prototype._run = function (fsm) {
        if (this.jointIndex === null) {
            return;
            __touch(6505);
        }
        var entity = fsm.getOwnerEntity();
        __touch(6494);
        var parent = entity.transformComponent.parent;
        __touch(6495);
        if (!parent) {
            return;
            __touch(6506);
        }
        parent = parent.entity;
        __touch(6496);
        if (!parent.animationComponent || !parent.animationComponent._skeletonPose) {
            return;
            __touch(6507);
        }
        var pose = parent.animationComponent._skeletonPose;
        __touch(6497);
        var jointTransform = pose._globalTransforms[this.jointIndex];
        __touch(6498);
        if (!jointTransform) {
            return;
            __touch(6508);
        }
        entity.transformComponent.transform.matrix.copy(jointTransform.matrix);
        __touch(6499);
        jointTransform.matrix.getTranslation(entity.transformComponent.transform.translation);
        __touch(6500);
        jointTransform.matrix.getScale(entity.transformComponent.transform.scale);
        __touch(6501);
        jointTransform.matrix.getRotation(entity.transformComponent.transform.rotation);
        __touch(6502);
        updateWorldTransform(entity.transformComponent);
        __touch(6503);
        entity.transformComponent._dirty = true;
        __touch(6504);
    };
    __touch(6489);
    function updateWorldTransform(transformComponent) {
        transformComponent.updateWorldTransform();
        __touch(6509);
        var entity = transformComponent.entity;
        __touch(6510);
        if (entity && entity.meshDataComponent && entity.meshRendererComponent) {
            entity.meshRendererComponent.updateBounds(entity.meshDataComponent.modelBound, transformComponent.worldTransform);
            __touch(6511);
        }
        for (var i = 0; i < transformComponent.children.length; i++) {
            updateWorldTransform(transformComponent.children[i]);
            __touch(6512);
        }
    }
    __touch(6490);
    return CopyJointTransformAction;
    __touch(6491);
});
__touch(6483);