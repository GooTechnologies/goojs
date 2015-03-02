define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(4734);
    function HtmlComponent(domElement) {
        Component.call(this);
        __touch(4739);
        this.type = 'HtmlComponent';
        __touch(4740);
        this.domElement = domElement;
        __touch(4741);
        this.hidden = false;
        __touch(4742);
        this.useTransformComponent = true;
        __touch(4743);
    }
    __touch(4735);
    HtmlComponent.prototype = Object.create(Component.prototype);
    __touch(4736);
    HtmlComponent.prototype.constructor = HtmlComponent;
    __touch(4737);
    return HtmlComponent;
    __touch(4738);
});
__touch(4733);