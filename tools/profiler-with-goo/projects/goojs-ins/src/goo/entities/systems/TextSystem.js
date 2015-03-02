define([
    'goo/entities/systems/System',
    'goo/shapes/TextureGrid',
    'goo/entities/components/MeshDataComponent'
], function (System, TextureGrid, MeshDataComponent) {
    'use strict';
    __touch(5821);
    function TextSystem() {
        System.call(this, 'TextSystem', ['TextComponent']);
        __touch(5826);
    }
    __touch(5822);
    TextSystem.prototype = Object.create(System.prototype);
    __touch(5823);
    TextSystem.prototype.process = function (entities) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(5827);
            var textComponent = entity.textComponent;
            __touch(5828);
            if (textComponent.dirty) {
                if (entity.hasComponent('MeshDataComponent')) {
                    entity.getComponent('MeshDataComponent').meshData = TextureGrid.fromString(textComponent.text);
                    __touch(5830);
                } else {
                    var meshData = TextureGrid.fromString(textComponent.text);
                    __touch(5831);
                    var meshDataComponent = new MeshDataComponent(meshData);
                    __touch(5832);
                    entity.setComponent(meshDataComponent);
                    __touch(5833);
                }
                this.dirty = false;
                __touch(5829);
            }
        }
    };
    __touch(5824);
    return TextSystem;
    __touch(5825);
});
__touch(5820);