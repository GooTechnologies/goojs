define([
    'goo/scripts/Scripts',
    'goo/util/gizmopack/Gizmo',
    'goo/util/gizmopack/GizmoRenderSystem',
    'goo/util/gizmopack/TranslationGizmo',
    'goo/util/gizmopack/RotationGizmo',
    'goo/util/gizmopack/ScaleGizmo'
], function (Scripts) {
    'use strict';
    __touch(22900);
    var defines = [
        'goo/scripts/Scripts',
        'goo/util/gizmopack/Gizmo',
        'goo/util/gizmopack/GizmoRenderSystem',
        'goo/util/gizmopack/TranslationGizmo',
        'goo/util/gizmopack/RotationGizmo',
        'goo/util/gizmopack/ScaleGizmo'
    ];
    __touch(22901);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(22902);
        Scripts.addClass(name, arguments[i]);
        __touch(22903);
    }
});
__touch(22899);