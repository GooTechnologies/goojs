define([
    'goo/entities/components/Component',
    'goo/shapes/TextureGrid',
    'goo/entities/components/MeshDataComponent'
], function (Component) {
    'use strict';
    __touch(5011);
    function TextComponent(text) {
        this.type = 'TextComponent';
        __touch(5017);
        this.text = text || '';
        __touch(5018);
        this.dirty = true;
        __touch(5019);
    }
    __touch(5012);
    TextComponent.prototype = Object.create(Component.prototype);
    __touch(5013);
    TextComponent.prototype.constructor = TextComponent;
    __touch(5014);
    TextComponent.prototype.setText = function (text) {
        this.text = text;
        __touch(5020);
        this.dirty = true;
        __touch(5021);
        return this;
        __touch(5022);
    };
    __touch(5015);
    return TextComponent;
    __touch(5016);
});
__touch(5010);