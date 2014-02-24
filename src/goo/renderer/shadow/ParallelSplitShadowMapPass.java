/**
 * Copyright (c) 2008-2012 Ardor Labs, Inc.
 *
 * This file is part of Ardor3D.
 *
 * Ardor3D is free software: you can redistribute it and/or modify it 
 * under the terms of its license which may be found in the accompanying
 * LICENSE file or at <http://www.ardor3d.com/LICENSE>.
 */

package com.ardor3d.extension.shadow.map;

import java.io.IOException;
import java.nio.FloatBuffer;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ardor3d.bounding.BoundingBox;
import com.ardor3d.bounding.BoundingSphere;
import com.ardor3d.bounding.BoundingVolume;
import com.ardor3d.bounding.OrientedBoundingBox;
import com.ardor3d.image.Texture;
import com.ardor3d.image.Texture.DepthTextureCompareFunc;
import com.ardor3d.image.Texture.DepthTextureCompareMode;
import com.ardor3d.image.Texture.DepthTextureMode;
import com.ardor3d.image.Texture2D;
import com.ardor3d.image.TextureStoreFormat;
import com.ardor3d.light.DirectionalLight;
import com.ardor3d.light.Light;
import com.ardor3d.light.PointLight;
import com.ardor3d.math.ColorRGBA;
import com.ardor3d.math.Matrix4;
import com.ardor3d.math.Quaternion;
import com.ardor3d.math.Vector3;
import com.ardor3d.math.Vector4;
import com.ardor3d.math.type.ReadOnlyColorRGBA;
import com.ardor3d.math.type.ReadOnlyMatrix4;
import com.ardor3d.math.type.ReadOnlyVector3;
import com.ardor3d.renderer.Camera;
import com.ardor3d.renderer.Camera.ProjectionMode;
import com.ardor3d.renderer.ContextCapabilities;
import com.ardor3d.renderer.ContextManager;
import com.ardor3d.renderer.IndexMode;
import com.ardor3d.renderer.RenderLogic;
import com.ardor3d.renderer.Renderer;
import com.ardor3d.renderer.TextureRenderer;
import com.ardor3d.renderer.TextureRendererFactory;
import com.ardor3d.renderer.pass.Pass;
import com.ardor3d.renderer.queue.RenderBucketType;
import com.ardor3d.renderer.state.BlendState;
import com.ardor3d.renderer.state.ClipState;
import com.ardor3d.renderer.state.ColorMaskState;
import com.ardor3d.renderer.state.CullState;
import com.ardor3d.renderer.state.CullState.Face;
import com.ardor3d.renderer.state.GLSLShaderObjectsState;
import com.ardor3d.renderer.state.LightState;
import com.ardor3d.renderer.state.OffsetState;
import com.ardor3d.renderer.state.OffsetState.OffsetType;
import com.ardor3d.renderer.state.RenderState;
import com.ardor3d.renderer.state.RenderState.StateType;
import com.ardor3d.renderer.state.ShadingState;
import com.ardor3d.renderer.state.ShadingState.ShadingMode;
import com.ardor3d.renderer.state.TextureState;
import com.ardor3d.renderer.state.WireframeState;
import com.ardor3d.renderer.state.ZBufferState;
import com.ardor3d.scenegraph.Line;
import com.ardor3d.scenegraph.Mesh;
import com.ardor3d.scenegraph.Renderable;
import com.ardor3d.scenegraph.Spatial;
import com.ardor3d.scenegraph.hint.LightCombineMode;
import com.ardor3d.scenegraph.shape.Sphere;
import com.ardor3d.util.geom.BufferUtils;
import com.ardor3d.util.resource.ResourceLocatorTool;
import com.google.common.collect.Lists;

/**
 * A pass providing a parallel split shadow mapping (PSSM) layer across the top of an existing scene.
 */
public class ParallelSplitShadowMapPass extends Pass {

    /** The Constant logger. */
    private static final Logger logger = Logger.getLogger(ParallelSplitShadowMapPass.class.getName());

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 1L;

    /** Bias matrix from [-1, 1] to [0, 1]. */
    public static final ReadOnlyMatrix4 SCALE_BIAS_MATRIX = new Matrix4( //
            0.5, 0.0, 0.0, 0.0, //
            0.0, 0.5, 0.0, 0.0, //
            0.0, 0.0, 0.5, 0.0, //
            0.5, 0.5, 0.5, 1.0);//

    /** The renderer used to produce the shadow map. */
    private TextureRenderer _shadowMapRenderer;

    /** The textures storing the shadow maps. */
    private Texture2D _shadowMapTexture[];

    /** The list of occluding nodes. */
    private final List<Spatial> _occluderNodes = Lists.newArrayList();

    /** Extra bounds receivers, when rendering shadows other ways than through overlay */
    private final List<Spatial> _boundsReceiver = Lists.newArrayList();

    // Various optimizations for rendering shadow maps...
    /** Culling front faces when rendering shadow maps. */
    private final CullState _cullFrontFace;

    /** Turn off textures when rendering shadow maps. */
    private final TextureState _noTexture;

    /** Turn off lighting when rendering shadow maps. */
    private final LightState _noLights;

    /** set flat shading when rendering shadow maps. */
    private final ShadingState _flat;

    // Important pieces for rendering shadow maps
    /** Turn off colors when rendering shadow maps. */
    private final ColorMaskState _colorDisabled;

    /** The state applying the depth offset for the shadow. */
    private final OffsetState _shadowOffsetState;

    /**
     * The blending to both discard the fragments that have been determined to be free of shadows and to blend into the
     * background scene.
     */
    private final BlendState _discardShadowFragments;

    /** The state applying the shadow map. */
    private final TextureState _shadowTextureState;

    /** Don't perform any plane clipping when rendering the shadowed scene. */
    private final ClipState _noClip;

    /** True once the pass has been initialized. */
    protected boolean _initialised = false;

    /** Flag for updating texture splits when number of splits changed. */
    protected boolean _reinitSplitsDirty = true;

    /** Flag for updating texture renderer when texture size changed. */
    protected boolean _reinitTextureSizeDirty = true;

    /** The size of the shadow map texture. */
    private int _shadowMapSize;

    /** Minimum number of splits allowed */
    public static final int _MIN_SPLITS = 1;

    /** Maximum number of splits allowed */
    public static final int _MAX_SPLITS = 4;

    /** Number of splits used. */
    protected int _numOfSplits;

    /** Minimum light z distance from target. */
    private double _minimumLightDistance = 1000.0;

    /** Shadow color and transparency. */
    private final ColorRGBA _shadowColor = new ColorRGBA(0.0f, 0.0f, 0.0f, 0.5f);

    /** Light -> Camera transformation matrix. */
    private final Matrix4 _shadowMatrix = new Matrix4();

    /** Bounding of scene for packing frustum. */
    protected BoundingBox _receiverBounds = new BoundingBox();

    /** Indicates if we have any valid reciever bounds to use for frustum packing */
    protected boolean hasValidBounds = false;

    /** Special camera with functionality for packing frustum etc. */
    protected PSSMCamera _pssmCam;

    /** Light that casts the shadow. */
    protected Light _light;

    /** Shader for rendering pssm shadows in one pass. */
    private GLSLShaderObjectsState _pssmShader;

    /** Might need to keep main shader when doing both multitexturing shadows and overlays */
    private GLSLShaderObjectsState _mainShader;

    /** Shader for debugging pssm shadows drawing splits in different colors. */
    private GLSLShaderObjectsState _pssmDebugShader;

    /** Debug for stopping camera update. */
    private boolean _updateMainCamera = true;

    /** Debug drawing frustums. */
    private boolean _drawDebug = false;

    /** Debug drawing shader. */
    private boolean _drawShaderDebug = false;

    /** Do we want to keep the main shader to do both multitexturing shadows and overlays? */
    private boolean _keepMainShader = false;

    /**
     * True if we want to factor in texturing to shadows; useful for casting shadows against alpha-tested textures.
     * Default is false.
     */
    private boolean _useSceneTexturing = false;

    /**
     * True if we want to use the culling set on the objects instead of always culling front face (which is done for
     * shadow precision). Default is false.
     */
    private boolean _useObjectCullFace = false;

    /**
     * When true (the default) the generated shadow map textures are drawn over the scene in a separate blend pass. If
     * false, the shadows are generated, but not applied.
     */
    private boolean _renderShadowedScene = true;

    /** Store format to use for the shadow textures. */
    protected TextureStoreFormat _shadowTextureStoreFormat = TextureStoreFormat.Depth16;

    /** Shadow filter techniques */
    public enum Filter {
        None, Pcf
    }

    private Filter filter = Filter.None;

    private ShadowRenderCallback shadowRenderCallback;

    /**
     * Create a pssm shadow map pass casting shadows from a light with the direction given.
     * 
     * @param shadowMapSize
     *            The size of the shadow map texture
     * @param numOfSplits
     *            the num of splits
     */
    public ParallelSplitShadowMapPass(final Light light, final int shadowMapSize, final int numOfSplits) {
        _light = light;
        _shadowMapSize = shadowMapSize;
        setNumOfSplits(numOfSplits);
        _pssmCam = new PSSMCamera();

        _noClip = new ClipState();
        _noClip.setEnabled(false);
        _noTexture = new TextureState();
        _noTexture.setEnabled(false);
        _colorDisabled = new ColorMaskState();
        _colorDisabled.setAll(false);
        _cullFrontFace = new CullState();
        _cullFrontFace.setEnabled(true);
        _cullFrontFace.setCullFace(CullState.Face.Front);
        _noLights = new LightState();
        _noLights.setEnabled(false);

        _shadowOffsetState = new OffsetState();
        _shadowOffsetState.setEnabled(true);
        _shadowOffsetState.setTypeEnabled(OffsetType.Fill, true);
        _shadowOffsetState.setFactor(1.1f);
        _shadowOffsetState.setUnits(4.0f);

        _flat = new ShadingState();
        _flat.setShadingMode(ShadingMode.Flat);

        // When rendering and comparing the shadow map with the current depth, the result will be set to alpha 1 if in
        // shadow and to 0 if not in shadow.
        _discardShadowFragments = new BlendState();
        _discardShadowFragments.setEnabled(true);
        _discardShadowFragments.setBlendEnabled(true);
        _discardShadowFragments.setTestEnabled(true);
        _discardShadowFragments.setSourceFunction(BlendState.SourceFunction.SourceAlpha);
        _discardShadowFragments.setDestinationFunction(BlendState.DestinationFunction.OneMinusSourceAlpha);

        _shadowTextureState = new TextureState();
    }

    /**
     * Add a spatial that will occlude light and hence cast a shadow.
     * 
     * @param occluder
     *            The spatial to add as an occluder
     */
    public void addOccluder(final Spatial occluder) {
        if (!_occluderNodes.contains(occluder)) {
            _occluderNodes.add(occluder);
        }
    }

    /**
     * Remove a spatial from the list of occluders.
     * 
     * @param occluder
     *            The spatial to remove from the occluderlist
     */
    public void removeOccluder(final Spatial occluder) {
        _occluderNodes.remove(occluder);
    }

    /**
     * Initialize the pass render states.
     * 
     * @param r
     *            the r
     */
    public void init(final Renderer r) {
        if (_initialised) {
            return;
        }

        _initialised = true; // now it's initialized

        // render states to use when rendering into the shadow map, no textures or colors are required since we're only
        // interested in recording depth. Also only need back faces when rendering the shadow maps

        // Load PSSM shader.
        final ContextCapabilities caps = ContextManager.getCurrentContext().getCapabilities();
        if (caps.isGLSLSupported()) {
            _pssmShader = new GLSLShaderObjectsState();
            try {
                _pssmShader.setVertexShader(ResourceLocatorTool.getClassPathResourceAsStream(
                        ParallelSplitShadowMapPass.class, "com/ardor3d/extension/shadow/map/pssm.vert"));
                if (filter == Filter.None) {
                    _pssmShader.setFragmentShader(ResourceLocatorTool.getClassPathResourceAsStream(
                            ParallelSplitShadowMapPass.class, "com/ardor3d/extension/shadow/map/pssm.frag"));
                } else if (filter == Filter.Pcf) {
                    _pssmShader.setFragmentShader(ResourceLocatorTool.getClassPathResourceAsStream(
                            ParallelSplitShadowMapPass.class, "com/ardor3d/extension/shadow/map/pssmPCF.frag"));
                }
            } catch (final IOException ex) {
                logger.logp(Level.SEVERE, getClass().getName(), "init(Renderer)", "Could not load shaders.", ex);
            }
            _mainShader = _pssmShader;

            _pssmDebugShader = new GLSLShaderObjectsState();
            try {
                _pssmDebugShader.setVertexShader(ResourceLocatorTool.getClassPathResourceAsStream(
                        ParallelSplitShadowMapPass.class, "com/ardor3d/extension/shadow/map/pssmDebug.vert"));
                _pssmDebugShader.setFragmentShader(ResourceLocatorTool.getClassPathResourceAsStream(
                        ParallelSplitShadowMapPass.class, "com/ardor3d/extension/shadow/map/pssmDebug.frag"));
            } catch (final IOException ex) {
                logger.logp(Level.SEVERE, getClass().getName(), "init(Renderer)", "Could not load shaders.", ex);
            }
        }

        // Setup texture renderer.
        reinitTextureSize(r);

        // Setup textures and shader for all splits
        reinitSplits();
    }

    public void reinit(final Renderer r) {
        reinitTextureSize(r);
        reinitSplits();
    }

    /**
     * Reinit texture size. Sets up texture renderer.
     * 
     * @param r
     *            the Renderer
     */
    private void reinitTextureSize(final Renderer r) {
        if (!_reinitTextureSizeDirty) {
            return;
        }

        _reinitTextureSizeDirty = false;

        final ContextCapabilities caps = ContextManager.getCurrentContext().getCapabilities();

        // Create texture renderer
        _shadowMapRenderer = TextureRendererFactory.INSTANCE.createTextureRenderer(_shadowMapSize, _shadowMapSize, r,
                caps);

        // Enforce performance enhancing states on the renderer.
        _shadowMapRenderer.enforceState(_noClip);
        _shadowMapRenderer.enforceState(_colorDisabled);
        if (!_useObjectCullFace) {
            _shadowMapRenderer.enforceState(_cullFrontFace);
        } else {
            _shadowMapRenderer.clearEnforcedState(StateType.Cull);
        }
        _shadowMapRenderer.enforceState(_noLights);
        _shadowMapRenderer.enforceState(_flat);
        _shadowMapRenderer.enforceState(_shadowOffsetState);
        if (!_useSceneTexturing) {
            _shadowMapRenderer.enforceState(_noTexture);
        } else {
            _shadowMapRenderer.clearEnforcedState(RenderState.StateType.Texture);
        }

        if (_light instanceof DirectionalLight) {
            _shadowMapRenderer.getCamera().setProjectionMode(ProjectionMode.Parallel);
        }
    }

    /**
     * Reinit splits. Setup textures and shader for all splits
     */
    private void reinitSplits() {
        if (!_reinitSplitsDirty) {
            return;
        }

        _reinitSplitsDirty = false;

        // render state to apply the shadow map texture
        _shadowMapTexture = new Texture2D[_numOfSplits];
        for (int i = 0; i < _numOfSplits; i++) {
            _shadowMapTexture[i] = new Texture2D();
            _shadowMapTexture[i].setWrap(Texture.WrapMode.BorderClamp);
            _shadowMapTexture[i].setMinificationFilter(Texture.MinificationFilter.BilinearNoMipMaps);
            _shadowMapTexture[i].setMagnificationFilter(Texture.MagnificationFilter.Bilinear);
            _shadowMapTexture[i].setBorderColor(ColorRGBA.WHITE);

            _shadowMapTexture[i].setEnvironmentalMapMode(Texture.EnvironmentalMapMode.EyeLinear);

            _shadowMapTexture[i].setTextureStoreFormat(_shadowTextureStoreFormat);
            _shadowMapTexture[i].setDepthCompareMode(DepthTextureCompareMode.RtoTexture);
            _shadowMapTexture[i].setDepthCompareFunc(DepthTextureCompareFunc.GreaterThanEqual);
            _shadowMapTexture[i].setDepthMode(DepthTextureMode.Intensity);

            _shadowMapRenderer.setupTexture(_shadowMapTexture[i]);
            _shadowTextureState.setTexture(_shadowMapTexture[i], i);
        }
        if (_pssmShader != null) {
            for (int i = 0; i < _MAX_SPLITS; i++) {
                _pssmShader.setUniform("shadowMap" + i, i);
                _pssmDebugShader.setUniform("shadowMap" + i, i);
                _mainShader.setUniform("shadowMap" + i, i);
            }
        }
    }

    /**
     * Render the pass.
     * 
     * @param r
     *            the Renderer
     */
    @Override
    protected void doRender(final Renderer r) {
        updateShadowMaps(r);

        if (_renderShadowedScene) {
            // Render overlay scene
            renderShadowedScene(r);
        }
    }

    public void updateShadowMaps(final Renderer r) {
        init(r);
        reinitTextureSize(r);
        reinitSplits();

        // Update receiving scene bounds to prepare for frustum packing
        updateReceiverBounds();

        // If updating camera is true (can be turned off for debugging), copy from main
        // camera and pack frustum.
        if (_updateMainCamera) {
            // Copy our active camera to our working pssm camera.
            final Camera cam = ContextManager.getCurrentContext().getCurrentCamera();
            _pssmCam.set(cam);

            // Calculate the closest fitting near and far planes.
            if (hasValidBounds) {
                _pssmCam.pack(_receiverBounds);
            } else {
                _pssmCam.updateMaxCameraFar();
            }
        }

        // Calculate the split distances
        _pssmCam.calculateSplitDistances(_numOfSplits);

        // Render our scene in sections.
        // For each part...
        for (int iSplit = 0; iSplit < _numOfSplits; iSplit++) {
            // Figure out the appropriate frustum.
            final double fNear = _pssmCam.getSplitDistances()[iSplit];
            final double fFar = _pssmCam.getSplitDistances()[iSplit + 1];

            // Calculate the frustum corners for the current split
            _pssmCam.calculateFrustum(fNear, fFar);

            // Debug draw main camera frustum for current split
            if (_drawDebug) {
                drawFrustum(r, _pssmCam, fNear, fFar, new ColorRGBA(0, 1, (float) (iSplit + 1) / _numOfSplits, 1),
                        (short) 0xF000, iSplit == 0);
            }

            // Calculate the appropriate lightview and projection matrices for the current split
            if (_light instanceof DirectionalLight) {
                calculateOptimalLightFrustum(_pssmCam._corners, _pssmCam._center);

                if (_drawDebug) {
                    boundingSphere
                            .setData(frustumBoundingSphere.getCenter(), 10, 10, frustumBoundingSphere.getRadius());
                    boundingSphere.draw(r);
                }
            } else if (_light instanceof PointLight) {
                calculateOptimalLightFrustumOld(_pssmCam._corners, _pssmCam._center);
            }

            // Debug draw light frustum for current split
            if (_drawDebug) {
                drawFrustum(r, _shadowMapRenderer.getCamera(), new ColorRGBA(1, 1, (iSplit + 1) / (float) _numOfSplits,
                        1), (short) 0xFFFF, true);
            }

            // Render shadowmap from light view for current split
            updateShadowMap(iSplit, r);

            // Update texture matrix for shadowmap
            updateTextureMatrix(iSplit);
        }

        updateShaderVariables();
    }

    private void updateShaderVariables() {
        if (_pssmShader != null && ContextManager.getCurrentContext().getCapabilities().isGLSLSupported()) {
            final float split1 = (float) _pssmCam.getSplitDistances()[1];
            final float split2 = (float) (_pssmCam.getSplitDistances().length > 2 ? _pssmCam.getSplitDistances()[2]
                    : 0f);
            final float split3 = (float) (_pssmCam.getSplitDistances().length > 3 ? _pssmCam.getSplitDistances()[3]
                    : 0f);
            final float split4 = (float) (_pssmCam.getSplitDistances().length > 4 ? _pssmCam.getSplitDistances()[4]
                    : 0f);

            GLSLShaderObjectsState currentShader = _drawShaderDebug ? _pssmDebugShader : _pssmShader;
            if (_drawShaderDebug) {
                currentShader = _pssmDebugShader;
            }

            currentShader.setUniform("sampleDist", split1, split2, split3, split4);
            if (filter == Filter.Pcf) {
                // TODO
                // currentShader.setUniform("_shadowSize", 1f / _shadowMapSize);
            }

            if (!_drawShaderDebug) {
                currentShader.setUniform("shadowColor", _shadowColor);
            }

            if (_keepMainShader) {
                _mainShader.setUniform("sampleDist", split1, split2, split3, split4);
                if (filter == Filter.Pcf) {
                    // TODO
                    // _mainShader.setUniform("_shadowSize", 1f / _shadowMapSize);
                }

                if (!_drawShaderDebug) {
                    _mainShader.setUniform("shadowColor", _shadowColor);
                }
            }
        }
    }

    // TODO
    final FloatBuffer frustumBoundingBuffer = BufferUtils.createVector3Buffer(8);
    final BoundingSphere frustumBoundingSphere = new BoundingSphere();

    /**
     * Calculate optimal light frustum perspective.
     * 
     * @param frustumCorners
     *            the frustum corners
     * @param center
     *            the center
     */
    private void calculateOptimalLightFrustum(final Vector3[] frustumCorners, final ReadOnlyVector3 centerFrustum) {
        for (int i = 0; i < 8; i++) {
            BufferUtils.setInBuffer(frustumCorners[i], frustumBoundingBuffer, i);
        }
        frustumBoundingSphere.computeFromPoints(frustumBoundingBuffer);

        final Camera shadowCam = _shadowMapRenderer.getCamera();

        final ReadOnlyVector3 center = frustumBoundingSphere.getCenter();
        final double radius = frustumBoundingSphere.getRadius();

        Vector3 direction = new Vector3();
        final DirectionalLight dl = (DirectionalLight) _light;
        direction = direction.set(dl.getDirection());
        final double distance = Math.max(radius, _minimumLightDistance);

        final Vector3 tmpVec = Vector3.fetchTempInstance();
        tmpVec.set(direction);
        tmpVec.negateLocal();
        tmpVec.multiplyLocal(distance);
        tmpVec.addLocal(center);

        // temporary location
        shadowCam.setLocation(tmpVec);
        shadowCam.lookAt(center, Vector3.UNIT_Y);

        {
            // determine
            final double texelSizeW = (2 * radius) / _shadowMapRenderer.getWidth();
            final double texelSizeH = (2 * radius) / _shadowMapRenderer.getHeight();

            // build a Quaternion from camera axes to move
            final Quaternion q = Quaternion.fetchTempInstance();
            q.fromAxes(shadowCam.getLeft(), shadowCam.getUp(), shadowCam.getDirection());

            // invert to calculate in light space
            final Vector3 lightSpace = q.invert(null).apply(tmpVec, Vector3.fetchTempInstance());

            // snap to nearest texel
            lightSpace.setX(lightSpace.getX() - (lightSpace.getX() % texelSizeW));
            lightSpace.setY(lightSpace.getY() - (lightSpace.getY() % texelSizeH));

            // convert back
            q.apply(lightSpace, tmpVec);
            Vector3.releaseTempInstance(lightSpace);

            Quaternion.releaseTempInstance(q);
        }

        // updated location
        final double x = tmpVec.getX();
        final double y = tmpVec.getY();
        final double z = tmpVec.getZ();
        final double farZ = tmpVec.subtractLocal(center).length() + radius;
        Vector3.releaseTempInstance(tmpVec);

        // set frustum, then location
        shadowCam.setFrustum(1, farZ, -radius, radius, radius, -radius);
        shadowCam.setLocation(x, y, z);
    }

    /**
     * Saving this around until we fully support a good solution for non-directional lights. Like dual paraboloid shadow
     * maps...
     * 
     * @param frustumCorners
     * @param center
     */
    private void calculateOptimalLightFrustumOld(final Vector3[] frustumCorners, final ReadOnlyVector3 center) {
        final Camera shadowCam = _shadowMapRenderer.getCamera();

        double distance = _minimumLightDistance;

        final Vector3 tmpVec = Vector3.fetchTempInstance();

        // Update shadow camera from light
        final PointLight pl = (PointLight) _light;

        shadowCam.setLocation(pl.getLocation());

        // Point light at split center
        shadowCam.lookAt(center, Vector3.UNIT_Y);

        // Reset frustum
        distance = center.subtract(shadowCam.getLocation(), tmpVec).length();
        shadowCam.setFrustum(1, distance, -1, 1, 1, -1);

        double fMinX = Double.POSITIVE_INFINITY;
        double fMaxX = Double.NEGATIVE_INFINITY;
        double fMinY = Double.POSITIVE_INFINITY;
        double fMaxY = Double.NEGATIVE_INFINITY;
        double fMinZ = Double.POSITIVE_INFINITY;
        double fMaxZ = Double.NEGATIVE_INFINITY;

        final ReadOnlyMatrix4 lightviewproj = shadowCam.getModelViewProjectionMatrix();

        final Vector4 position = Vector4.fetchTempInstance();
        for (final Vector3 frustumCorner : frustumCorners) {
            position.set(frustumCorner.getX(), frustumCorner.getY(), frustumCorner.getZ(), 1);
            lightviewproj.applyPre(position, position);

            position.setX(position.getX() / position.getW());
            position.setY(position.getY() / position.getW());
            position.setZ(position.getZ());

            fMinX = Math.min(position.getX(), fMinX);
            fMaxX = Math.max(position.getX(), fMaxX);

            fMinY = Math.min(position.getY(), fMinY);
            fMaxY = Math.max(position.getY(), fMaxY);

            fMinZ = Math.min(position.getZ(), fMinZ);
            fMaxZ = Math.max(position.getZ(), fMaxZ);
        }

        double width = 0;
        double height = 0;
        fMinX = clamp(fMinX, -1.0, 1.0);
        fMaxX = clamp(fMaxX, -1.0, 1.0);
        fMinY = clamp(fMinY, -1.0, 1.0);
        fMaxY = clamp(fMaxY, -1.0, 1.0);

        // Make sure the minimum z is at least a specified distance from
        // the target.
        fMinZ = Math.min(fMinZ, distance - _minimumLightDistance);
        fMinZ = Math.max(10.0, fMinZ);

        width = fMinZ * (fMaxX - fMinX) * 0.5;
        height = fMinZ * (fMaxY - fMinY) * 0.5;

        final Vector3 newCenter = Vector3.fetchTempInstance();
        position.set((fMinX + fMaxX) * 0.5, (fMinY + fMaxY) * 0.5, 1.0, 1);
        shadowCam.getModelViewProjectionInverseMatrix().applyPre(position, position);
        position.divideLocal(position.getW());
        newCenter.set(position.getX(), position.getY(), position.getZ());

        shadowCam.lookAt(newCenter, Vector3.UNIT_Y);

        Vector3.releaseTempInstance(newCenter);
        Vector4.releaseTempInstance(position);

        shadowCam.setFrustum(fMinZ, fMaxZ, -width, width, height, -height);
        shadowCam.update();
    }

    /**
     * Render the overlay scene with shadows.
     * 
     * @param r
     *            The renderer to use
     */
    public void renderShadowedScene(final Renderer r) {
        boolean reset = false;
        if (_context == null) {
            _context = ContextManager.getCurrentContext();
            reset = true;
        }

        _context.pushEnforcedStates();
        _context.enforceState(_shadowTextureState);
        _context.enforceState(_discardShadowFragments);

        if (_pssmShader != null && _context.getCapabilities().isGLSLSupported()) {
            GLSLShaderObjectsState currentShader = _drawShaderDebug ? _pssmDebugShader : _pssmShader;
            if (_drawShaderDebug) {
                currentShader = _pssmDebugShader;
            }
            if (_keepMainShader) {
                currentShader = _mainShader;
            }
            _context.enforceState(currentShader);
        }

        for (final Spatial spat : _spatials) {
            spat.onDraw(r);
        }
        r.renderBuckets();

        _context.popEnforcedStates();

        if (reset) {
            // _context = null;
        }
    }

    private static RenderLogic logic = new RenderLogic() {
        private CullState cullState;
        private Face cullFace;
        private boolean isVisible;

        public void apply(final Renderable renderable) {
            if (renderable instanceof Mesh) {
                final Mesh mesh = (Mesh) renderable;

                isVisible = mesh.isVisible();
                if (!mesh.getSceneHints().isCastsShadows()) {
                    mesh.setVisible(false);
                }

                cullState = (CullState) mesh.getWorldRenderState(StateType.Cull);
                if (cullState != null) {
                    cullFace = cullState.getCullFace();
                    if (cullFace != Face.None) {
                        cullState.setCullFace(Face.Front);
                    }
                }
            }
        }

        public void restore(final Renderable renderable) {
            if (renderable instanceof Mesh) {
                final Mesh mesh = (Mesh) renderable;

                mesh.setVisible(isVisible);

                if (cullState != null) {
                    cullState.setCullFace(cullFace);
                }
            }
        }
    };

    /**
     * Update the shadow map.
     * 
     * @param index
     *            shadow map texture index to update
     */
    private void updateShadowMap(final int index, final Renderer r) {

        if (shadowRenderCallback != null) {
            shadowRenderCallback.onRender(index, r, this, _shadowMapRenderer.getCamera());
        }

        r.setRenderLogic(logic);
        if (!_useSceneTexturing) {
            Mesh.RENDER_VERTEX_ONLY = true;
        }
        _shadowMapRenderer.render(_occluderNodes, _shadowMapTexture[index], Renderer.BUFFER_COLOR_AND_DEPTH);
        if (!_useSceneTexturing) {
            Mesh.RENDER_VERTEX_ONLY = false;
        }
        r.setRenderLogic(null);
    }

    /**
     * Update texture matrix.
     * 
     * @param index
     *            the index
     */
    private void updateTextureMatrix(final int index) {
        // Create a matrix going from light to camera space
        final Camera cam = ContextManager.getCurrentContext().getCurrentCamera();
        _shadowMatrix.set(cam.getModelViewMatrix()).invertLocal();
        _shadowMatrix.multiplyLocal(_shadowMapRenderer.getCamera().getModelViewProjectionMatrix()).multiplyLocal(
                SCALE_BIAS_MATRIX);
        _shadowMapTexture[index].setTextureMatrix(_shadowMatrix);
    }

    /**
     * Checks if this pass is initialized.
     * 
     * @return true, if is initialized
     */
    public boolean isInitialised() {
        return _initialised;
    }

    /**
     * 
     * @return the offset state used for drawing the shadow textures.
     */
    public OffsetState getShadowOffsetState() {
        return _shadowOffsetState;
    }

    /**
     * Update receiver bounds.
     */
    private void updateReceiverBounds() {
        hasValidBounds = false;
        boolean firstRun = true;

        for (int i = 0, cSize = _boundsReceiver.size(); i < cSize; i++) {
            final Spatial child = _boundsReceiver.get(i);
            if (child != null && child.getWorldBound() != null && boundIsValid(child.getWorldBound())) {
                if (firstRun) {
                    _receiverBounds.setCenter(child.getWorldBound().getCenter());
                    _receiverBounds.setXExtent(0);
                    _receiverBounds.setYExtent(0);
                    _receiverBounds.setZExtent(0);
                    firstRun = false;
                }
                _receiverBounds.mergeLocal(child.getWorldBound());
                hasValidBounds = true;
            }
        }

        for (int i = 0, cSize = _spatials.size(); i < cSize; i++) {
            final Spatial child = _spatials.get(i);
            if (child != null && child.getWorldBound() != null && boundIsValid(child.getWorldBound())) {
                if (firstRun) {
                    _receiverBounds.setCenter(child.getWorldBound().getCenter());
                    _receiverBounds.setXExtent(0);
                    _receiverBounds.setYExtent(0);
                    _receiverBounds.setZExtent(0);
                    firstRun = false;
                }
                _receiverBounds.mergeLocal(child.getWorldBound());
                hasValidBounds = true;
            }
        }
    }

    /**
     * Checks if a bounding volume is valid.
     * 
     * @param volume
     * @return
     */
    private boolean boundIsValid(final BoundingVolume volume) {
        if (!Vector3.isValid(volume.getCenter())) {
            return false;
        }
        switch (volume.getType()) {
            case AABB: {
                final BoundingBox vBox = (BoundingBox) volume;
                return !(Double.isInfinite(vBox.getXExtent()) || Double.isInfinite(vBox.getYExtent())
                        || Double.isInfinite(vBox.getZExtent()) || Double.isNaN(vBox.getXExtent())
                        || Double.isNaN(vBox.getYExtent()) || Double.isNaN(vBox.getZExtent()));
            }

            case Sphere: {
                final BoundingSphere vSphere = (BoundingSphere) volume;
                return !(Double.isInfinite(vSphere.getRadius()) || Double.isNaN(vSphere.getRadius()));
            }

            case OBB: {
                final OrientedBoundingBox obb = (OrientedBoundingBox) volume;
                return Vector3.isValid(obb.getExtent());
            }

            default:
                return true;
        }
    }

    /**
     * Gets the shadow map texture.
     * 
     * @param index
     *            the index
     * 
     * @return the shadow map texture
     */
    public Texture2D getShadowMapTexture(final int index) {
        return _shadowMapTexture[index];
    }

    /**
     * Gets the number of splits.
     * 
     * @return the number of splits
     */
    public int getNumOfSplits() {
        return _numOfSplits;
    }

    /**
     * Sets the number of frustum splits and thus the number of shadow textures created by this pass. More splits
     * creates crisper shadows at the cost of increased texture memory.
     * 
     * @param numOfSplits
     *            the new number of splits
     */
    public void setNumOfSplits(final int numOfSplits) {
        _numOfSplits = Math.min(Math.max(_MIN_SPLITS, numOfSplits), _MAX_SPLITS);
        _reinitSplitsDirty = true;

        if (_numOfSplits != numOfSplits) {
            logger.warning("Valid range for number of splits is " + _MIN_SPLITS + " to " + _MAX_SPLITS
                    + ". Tried to set it to " + numOfSplits);
        }
    }

    /**
     * Gets the shadow map size.
     * 
     * @return the shadow map size
     */
    public int getShadowMapSize() {
        return _shadowMapSize;
    }

    /**
     * Sets the shadow map size.
     * 
     * @param shadowMapSize
     *            the new shadow map size
     */
    public void setShadowMapSize(final int shadowMapSize) {
        _shadowMapSize = shadowMapSize;
        _reinitTextureSizeDirty = true;
        _reinitSplitsDirty = true;
    }

    /**
     * Gets the maximum distance for shadowing.
     * 
     * @return max distance
     * @see com.ardor3d.extension.shadow.map.PSSMCamera#getMaxFarPlaneDistance()
     */
    public double getMaxShadowDistance() {
        return _pssmCam.getMaxFarPlaneDistance();
    }

    /**
     * Sets the maximum distance for shadowing.
     * 
     * @param maxShadowDistance
     *            distance to set
     * @see com.ardor3d.extension.shadow.map.PSSMCamera#setMaxFarPlaneDistance(double)
     */
    public void setMaxShadowDistance(final double maxShadowDistance) {
        _pssmCam.setMaxFarPlaneDistance(maxShadowDistance);
    }

    /**
     * Gets the minimum z distance for the light.
     * 
     * @return the minimumLightDistance
     */
    public double getMinimumLightDistance() {
        return _minimumLightDistance;
    }

    /**
     * Sets the minimum z distance for the light.
     * 
     * @param minimumLightDistance
     *            the minimumLightDistance to set
     */
    public void setMinimumLightDistance(final double minimumLightDistance) {
        _minimumLightDistance = minimumLightDistance;
    }

    /**
     * Gets shadow color and transparency.
     * 
     * @return the shadowColor
     */
    public ReadOnlyColorRGBA getShadowColor() {
        return _shadowColor;
    }

    /**
     * Sets shadow color and transparency.
     * 
     * @param shadowColor
     *            the shadowColor to set
     */
    public void setShadowColor(final ReadOnlyColorRGBA shadowColor) {
        _shadowColor.set(shadowColor);
    }

    public ShadowRenderCallback getShadowRenderCallback() {
        return shadowRenderCallback;
    }

    public void setShadowRenderCallback(final ShadowRenderCallback callback) {
        shadowRenderCallback = callback;
    }

    /**
     * Clean up.
     * 
     * @see com.ardor3d.renderer.pass.Pass#cleanUp()
     */
    @Override
    public void cleanUp() {
        super.cleanUp();

        if (_shadowMapRenderer != null) {
            _shadowMapRenderer.cleanup();
        }
    }

    /**
     * Remove the contents of the pass.
     */
    public void clear() {
        _occluderNodes.clear();
        _spatials.clear();
    }

    /**
     * Simple clamp.
     * 
     * @param val
     *            value to clamp
     * @param from
     *            minimum value after clamping
     * @param to
     *            maximum value after clamping
     * @return Math.min(to, Math.max(from, val))
     */
    private double clamp(final double val, final double from, final double to) {
        return Math.min(to, Math.max(from, val));
    }

    /**
     * @return the updateMainCamera
     */
    public boolean isUpdateMainCamera() {
        return _updateMainCamera;
    }

    /**
     * @param updateMainCamera
     *            True (the default) if we want to copy the current rendering camera into this pass for use in shadow
     *            generation. False if we will manage our shadow camera elsewhere.
     * @see #getPssmCam()
     */
    public void setUpdateMainCamera(final boolean updateMainCamera) {
        _updateMainCamera = updateMainCamera;
    }

    /**
     * @return the drawDebug
     */
    public boolean isDrawDebug() {
        return _drawDebug;
    }

    /**
     * @param drawDebug
     *            True if we want to draw camera and light frustums for debugging purposes. Default is false.
     */
    public void setDrawDebug(final boolean drawDebug) {
        _drawDebug = drawDebug;
    }

    /**
     * @return the drawShaderDebug
     */
    public boolean isDrawShaderDebug() {
        return _drawShaderDebug;
    }

    /**
     * @param drawShaderDebug
     *            True if we want to draw debug colors over the shadows, showing which level they come from.
     */
    public void setDrawShaderDebug(final boolean drawShaderDebug) {
        _drawShaderDebug = drawShaderDebug;
    }

    /**
     * @return the useSceneTexturing
     */
    public boolean isUseSceneTexturing() {
        return _useSceneTexturing;
    }

    /**
     * @param useSceneTexturing
     *            True if we want to factor in texturing to shadows; useful for casting shadows against alpha-tested
     *            textures. Default is false.
     */
    public void setUseSceneTexturing(final boolean useSceneTexturing) {
        _useSceneTexturing = useSceneTexturing;
        if (_shadowMapRenderer != null) {
            if (!_useSceneTexturing) {
                _shadowMapRenderer.enforceState(_noTexture);
            } else {
                _shadowMapRenderer.clearEnforcedState(RenderState.StateType.Texture);
            }
        }

    }

    public boolean isUseObjectCullFace() {
        return _useObjectCullFace;
    }

    /**
     * @param useObjectCullFace
     *            True if we want to use the culling set on the objects instead of always culling front face (which is
     *            done for shadow precision). Default is false.
     */
    public void setUseObjectCullFace(final boolean useObjectCullFace) {
        _useObjectCullFace = useObjectCullFace;
        if (_shadowMapRenderer != null) {
            if (!_useObjectCullFace) {
                _shadowMapRenderer.enforceState(_cullFrontFace);
            } else {
                _shadowMapRenderer.clearEnforcedState(StateType.Cull);
            }
        }
    }

    public boolean isRenderShadowedScene() {
        return _renderShadowedScene;
    }

    /**
     * @param renderShadowedScene
     *            When true (the default) the generated shadow map textures are drawn over the scene in a separate blend
     *            pass. If false, the shadows are generated, but not applied.
     */
    public void setRenderShadowedScene(final boolean renderShadowedScene) {
        _renderShadowedScene = renderShadowedScene;
    }

    /**
     * @return the camera used internally to generate shadows.
     */
    public PSSMCamera getPssmCam() {
        return _pssmCam;
    }

    /**
     * @return the texture store format to use for the shadow textures on the next call to init/setNumOfSplits.
     */
    public TextureStoreFormat getShadowTextureStoreFormat() {
        return _shadowTextureStoreFormat;
    }

    /**
     * @param shadowTextureStoreFormat
     *            - the texture store format to use for the shadow textures. Only has an affect if called prior to
     *            calling init on this pass (or if called before calling {@link #setNumOfSplits(int)}).
     */
    public void setShadowTextureStoreFormat(final TextureStoreFormat shadowTextureStoreFormat) {
        _shadowTextureStoreFormat = shadowTextureStoreFormat;
    }

    /** The debug line frustum. */
    private static Line lineFrustum;

    /** The debug test cam. */
    private static final PSSMCamera testCam = new PSSMCamera();

    /** Debug bounding sphere */
    private static final Sphere boundingSphere = new Sphere("bsphere", 10, 10, 1);
    static {
        boundingSphere.getSceneHints().setRenderBucketType(RenderBucketType.Skip);
        boundingSphere.setRenderState(new WireframeState());
        boundingSphere.setRenderState(new ZBufferState());
        boundingSphere.updateWorldRenderStates(false);
    }

    /**
     * Draw debug frustum.
     * 
     * @param r
     *            the r
     * @param cam
     *            the cam
     * @param color
     *            the color
     * @param drawOriginConnector
     *            whether or not to draw a connector
     */
    private static void drawFrustum(final Renderer r, final Camera cam, final ReadOnlyColorRGBA color,
            final short pattern, final boolean drawOriginConnector) {
        drawFrustum(r, cam, cam.getFrustumNear(), cam.getFrustumFar(), color, pattern, drawOriginConnector);
    }

    /**
     * Draw debug frustum.
     * 
     * @param r
     *            the r
     * @param cam
     *            the cam
     * @param fNear
     *            the f near
     * @param fFar
     *            the f far
     * @param color
     *            the color
     * @param drawOriginConnector
     *            whether or not to draw a connector
     */
    private static void drawFrustum(final Renderer r, final Camera cam, final double fNear, final double fFar,
            final ReadOnlyColorRGBA color, final short pattern, final boolean drawOriginConnector) {
        if (lineFrustum == null) {
            final FloatBuffer verts = BufferUtils.createVector3Buffer(24);
            final FloatBuffer colors = BufferUtils.createColorBuffer(24);

            lineFrustum = new Line("Lines", verts, null, colors, null);
            lineFrustum.getMeshData().setIndexModes(
                    new IndexMode[] { IndexMode.LineLoop, IndexMode.LineLoop, IndexMode.Lines, IndexMode.Lines });
            lineFrustum.getMeshData().setIndexLengths(new int[] { 4, 4, 8, 8 });
            lineFrustum.setLineWidth(2);
            lineFrustum.getSceneHints().setLightCombineMode(LightCombineMode.Off);

            final BlendState lineBlendState = new BlendState();
            lineBlendState.setEnabled(true);
            lineBlendState.setBlendEnabled(true);
            lineBlendState.setTestEnabled(true);
            lineBlendState.setSourceFunction(BlendState.SourceFunction.SourceAlpha);
            lineBlendState.setDestinationFunction(BlendState.DestinationFunction.OneMinusSourceAlpha);
            lineFrustum.setRenderState(lineBlendState);

            final ZBufferState zstate = new ZBufferState();
            lineFrustum.setRenderState(zstate);
            lineFrustum.updateGeometricState(0.0);

            lineFrustum.getSceneHints().setRenderBucketType(RenderBucketType.Skip);
        }

        lineFrustum.setDefaultColor(color);
        lineFrustum.setStipplePattern(pattern);

        testCam.set(cam);
        testCam.update();
        testCam.calculateFrustum(fNear, fFar);

        final FloatBuffer colors = lineFrustum.getMeshData().getColorBuffer();
        for (int i = 0; i < 16; i++) {
            BufferUtils.setInBuffer(color, colors, i);
        }
        final float alpha = drawOriginConnector ? 0.4f : 0.0f;
        for (int i = 16; i < 24; i++) {
            colors.position(i * 4);
            colors.put(color.getRed());
            colors.put(color.getGreen());
            colors.put(color.getBlue());
            colors.put(alpha);
        }

        final FloatBuffer verts = lineFrustum.getMeshData().getVertexBuffer();
        BufferUtils.setInBuffer(testCam._corners[0], verts, 0);
        BufferUtils.setInBuffer(testCam._corners[1], verts, 1);
        BufferUtils.setInBuffer(testCam._corners[2], verts, 2);
        BufferUtils.setInBuffer(testCam._corners[3], verts, 3);

        BufferUtils.setInBuffer(testCam._corners[4], verts, 4);
        BufferUtils.setInBuffer(testCam._corners[5], verts, 5);
        BufferUtils.setInBuffer(testCam._corners[6], verts, 6);
        BufferUtils.setInBuffer(testCam._corners[7], verts, 7);

        BufferUtils.setInBuffer(testCam._corners[0], verts, 8);
        BufferUtils.setInBuffer(testCam._corners[4], verts, 9);
        BufferUtils.setInBuffer(testCam._corners[1], verts, 10);
        BufferUtils.setInBuffer(testCam._corners[5], verts, 11);
        BufferUtils.setInBuffer(testCam._corners[2], verts, 12);
        BufferUtils.setInBuffer(testCam._corners[6], verts, 13);
        BufferUtils.setInBuffer(testCam._corners[3], verts, 14);
        BufferUtils.setInBuffer(testCam._corners[7], verts, 15);

        BufferUtils.setInBuffer(testCam.getLocation(), verts, 16);
        BufferUtils.setInBuffer(testCam._corners[0], verts, 17);
        BufferUtils.setInBuffer(testCam.getLocation(), verts, 18);
        BufferUtils.setInBuffer(testCam._corners[1], verts, 19);
        BufferUtils.setInBuffer(testCam.getLocation(), verts, 20);
        BufferUtils.setInBuffer(testCam._corners[2], verts, 21);
        BufferUtils.setInBuffer(testCam.getLocation(), verts, 22);
        BufferUtils.setInBuffer(testCam._corners[3], verts, 23);

        lineFrustum.draw(r);
    }

    public void setPssmShader(final GLSLShaderObjectsState pssmShader) {
        _pssmShader = pssmShader;
    }

    public boolean isKeepMainShader() {
        return _keepMainShader;
    }

    public void setKeepMainShader(final boolean keepMainShader) {
        _keepMainShader = keepMainShader;
    }

    public void addBoundsReceiver(final Spatial spatial) {
        _boundsReceiver.add(spatial);
    }

    public void setFiltering(final Filter filter) {
        this.filter = filter;
    }

    public BlendState getDiscardShadowFragmentsBlendState() {
        return _discardShadowFragments;
    }
}