define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/loaders/handlers/ComponentHandler'

	'goo/renderer/MeshData'
	'goo/entities/components/MeshDataComponent'
	'goo/animation/Joint'
	'goo/animation/Skeleton'
	'goo/animation/SkeletonPose'


	'goo/loaders/JsonUtils'
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
	
], (
ConfigHandler,
ComponentHandler,
MeshData,
MeshDataComponent,
Joint, 
Skeleton, 
SkeletonPose,
JsonUtils,
RSVP,
pu,
_) ->

	class SkeletonHandler extends ConfigHandler
		@_register('skeleton')
		
		_create: (skeletonConfig)->
			console.debug "Creating skeleton"
			joints = (
				for jointConfig in skeletonConfig.Joints
					joint = new Joint(jointConfig.Name)
					joint._index = Math.round(jointConfig.Index)
					joint._parentIndex = Math.round(jointConfig.ParentIndex)
					
					
					if jointConfig.InverseBindPose.Matrix
						parseTransform = JsonUtils.parseTransformMatrix
	
					else if jointConfig.InverseBindPose.Rotation.length == 4
						parseTransform = JsonUtils.parseTransformQuat
						
					else if jointObj.InverseBindPose.Rotation.length == 3
						parseTransform = JsonUtils.parseTransformEuler
					else 
						parseTransform = JsonUtils.parseTransform
	
					joint._inverseBindPose.copy(parseTransform(jointConfig.InverseBindPose))
					
					if not jointConfig.InverseBindPose.Matrix 
						joint._inverseBindPose.update()
					
					joint
			)
			new Skeleton(skeletonConfig.name, joints)
			
		update: (ref, config)->
			skeleton = @_create(config)
			return pu.createDummyPromise(skeleton)
		
		

	class MeshDataHandler extends ConfigHandler
		@_register('mesh')
	
	
		_create: (meshConfig)->
			if meshConfig.compression and meshConfig.compression.compressed
				compression = 
					compressedVertsRange: meshConfig.compression.compressedVertsRange or (1 << 14) - 1 #int
					compressedColorsRange: meshConfig.compression.compressedColorsRange or (1 << 8) - 1 #int
					compressedUnitVectorRange: meshConfig.compression.compressedUnitVectorRange or (1 << 10) - 1 #int
	
			if meshConfig.type == 'SkinnedMesh'
				meshData = @_parseMeshData(meshConfig.data or meshConfig, 4, 'SkinnedMesh', compression)
				meshData.type = MeshData.SKINMESH
			else
				meshData = @_parseMeshData(meshConfig.data or meshConfig, 0, 'Mesh', compression)
				meshData.type = MeshData.MESH
			
			
			return meshData
			
		update: (ref, config)->
			meshData = @_create(config)
			
			if config.pose
				skelRef = config.pose
				@getConfig(skelRef).then (skelConfig)=>
					@updateObject(skelRef, skelConfig).then (skeleton)=>
						pose = new SkeletonPose(skeleton)
						pose.setToBindPose()
						meshData.currentPose = pose
						return meshData
			else
				pu.createDummyPromise(meshData)
		
			
		# Translated into coffeescript from goo/loaders/MeshLoader.js
		# Returns MeshData object
		_parseMeshData: (data, weightsPerVert, type, compression)->
			vertexCount = data.vertexCount # int
			if vertexCount == 0 then return null
	
			indexCount = data.indexLengths?[0] or  data.indices?.length or 0
			
			attributeMap = {}
			if data.vertices
				attributeMap.POSITION = MeshData.createAttribute(3, 'Float')
			
			if data.normals
				attributeMap.NORMAL = MeshData.createAttribute(3, 'Float')
			
			if (data.tangents) 
				attributeMap.TANGENT = MeshData.createAttribute(4, 'Float')
			
			if (data.colors) 
				attributeMap.COLOR = MeshData.createAttribute(4, 'Float')
			
			if (weightsPerVert > 0 && data.weights) 
				attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float')
			
			if (weightsPerVert > 0 && data.joints) 
				attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Short')
			
			if data.textureCoords
				for texCoords, texIdx in data.textureCoords
					console.log "TEXCOORD #{texIdx}"
					attributeMap['TEXCOORD' + texIdx] = MeshData.createAttribute(2, 'Float')

			console.log "Parsing mesh data: #{_.keys(attributeMap).join(',')}"
				
			meshData = new MeshData(attributeMap, vertexCount, indexCount)
	
			if (data.vertices) 
				if compression? 
					offsetObj = data.vertexOffsets
					JsonUtils.fillAttributeBufferFromCompressedString(
						data.vertices, 
						meshData, 
						MeshData.POSITION, 
						[ 
							data.vertexScale,
							data.vertexScale, 
							data.vertexScale
						], 
						[
							offsetObj.xOffset, 
							offsetObj.yOffset, 
							offsetObj.zOffset
						])
				else
					JsonUtils.fillAttributeBuffer(data.vertices, meshData, MeshData.POSITION)
				
			if weightsPerVert > 0 and data.weights
				if compression?
					offset = 0
					scale = 1 / compression.compressedVertsRange
	
					JsonUtils.fillAttributeBufferFromCompressedString(data.weights, meshData, MeshData.WEIGHTS, [scale], [offset])
				else
					JsonUtils.fillAttributeBuffer(data.weights, meshData, MeshData.WEIGHTS)
				
			if (data.normals) 
				if compression?
					offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
					scale = 1 / -offset
	
					JsonUtils.fillAttributeBufferFromCompressedString(data.normals, meshData, MeshData.NORMAL, 
						[scale, scale, scale], [offset, offset,offset])
				else
					JsonUtils.fillAttributeBuffer(data.normals, meshData, MeshData.NORMAL)
	
			if (data.tangents) 
				if compression?
					offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
					scale = 1 / -offset
	
					JsonUtils.fillAttributeBufferFromCompressedString(data.tangents, meshData, MeshData.TANGENT, 
						[scale, scale, scale, scale], [offset,offset, offset, offset])
				else
					JsonUtils.fillAttributeBuffer(data.tangents, meshData, MeshData.TANGENT)
	
			if (data.colors) 
				if compression?
					offset = 0
					scale = 255 / (compression.compressedColorsRange + 1)
					JsonUtils.fillAttributeBufferFromCompressedString(data.colors, meshData, MeshData.COLOR, 
						[scale, scale, scale, scale], [offset,offset, offset, offset])
				else
					JsonUtils.fillAttributeBuffer(data.colors, meshData, MeshData.COLOR)
	
			if (data.textureCoords)
				textureUnits = data.textureCoords
				if compression?
					for texObj, texIdx in textureUnits
						JsonUtils.fillAttributeBufferFromCompressedString(texObj.UVs, meshData, 'TEXCOORD' + texIdx, texObj.UVScales, texObj.UVOffsets)
				else
					for texObj, texIdx in textureUnits
						JsonUtils.fillAttributeBuffer(texObj, meshData, 'TEXCOORD' + texIdx)
	
			if weightsPerVert > 0 and data.joints
				buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS)
	
				if compression
					jointData = JsonUtils.getIntBufferFromCompressedString(data.joints, 32767)
				else
					jointData = JsonUtils.getIntBuffer(data.joints, 32767)
				
				if type == 'SkinnedMesh'
					# map these joints to local.
					localJointMap = [];
					localIndex = 0;
					for jointIndex, idx in jointData
						if localJointMap[jointIndex] == undefined
							localJointMap[jointIndex] = localIndex++
	
						buffer.set([localJointMap[jointIndex]], idx)
	
					# store local map
					localMap = [];
					for localIndex, jointIndex in localJointMap 
						localIndex = localJointMap[jointIndex]
						if localIndex != null
							localMap[localIndex] = jointIndex;
	
					meshData.paletteMap = localMap
					meshData.weightsPerVertex = weightsPerVert
				else
					for jointIdx in [0...jointData.capacity()]
						buffer.putCast(jointIdx, jointData.get(jointIdx))
					
			if data.indices
				if compression?
					meshData.getIndexBuffer().set(JsonUtils.getIntBufferFromCompressedString(data.indices, vertexCount))
				else
					meshData.getIndexBuffer().set(JsonUtils.getIntBuffer(data.indices, vertexCount))
	
			if data.indexModes 
				meshData.indexModes = data.indexModes[..]
					
			if data.indexLengths
				meshData.indexLengths = data.indexLengths[..]
	
			if data.boundingBox
				meshData.boundingBox = data.boundingBox
	
			return meshData


	class MeshDataComponentHandler extends ComponentHandler
		@_register('meshData')
		
		_prepare: (config) ->
			_.defaults config,
				# TODO: make default for mesh or support missing mesh
				meshRef: null
				
		_create: (entity, config) ->
			# Created in update

		update: (entity, config) ->
			super(entity, config) # Creates component if needed
			meshRef = config.meshRef

			if not meshRef
				console.error "No meshRef in meshDataComponent for #{entity.ref}"
				
			@getConfig(meshRef).then (config)=>
				@updateObject(meshRef, config).then (meshData)=>
					component = new MeshDataComponent(meshData)
					entity.setComponent(component)
					return component
			

				
