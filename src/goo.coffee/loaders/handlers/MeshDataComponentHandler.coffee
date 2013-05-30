define [
	'goo/loaders/handlers/ComponentHandler'

	'goo/renderer/MeshData'
	'goo/entities/components/MeshDataComponent'
	'goo/loaders/JsonUtils'
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ConsoleUtil'
	'goo/lib/underscore'
	
], (
ComponentHandler,
MeshData,
MeshDataComponent,
JsonUtils,
RSVP,
pu,
console) ->

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
			
			# I wonder if is is actually possible to change the meshdata.
			# Maybe bounds aren't updated properly?

			@getConfig(config.meshRef).then (mesh)=>
# 				meshLoader = new MeshLoader(loader: 'dummy')
# 				meshData = meshLoader._parseMeshData(mesh, 0, 'Mesh')
# 				component = new MeshDataComponent(meshData)
# 				entity.setComponent(component)
# 				return component

				if mesh.compression and mesh.compression.compressed
					compression = 
						compressedVertsRange: mesh.compression.compressedVertsRange or (1 << 14) - 1 #int
						compressedColorsRange: mesh.compression.compressedColorsRange or (1 << 8) - 1 #int
						compressedUnitVectorRange: mesh.compression.compressedUnitVectorRange or (1 << 10) - 1 #int
		
				if mesh.type == 'SkinnedMesh'
					meshData = @_parseMeshData(mesh.data or mesh, 4, 'SkinnedMesh')
					meshData.type = MeshData.SKINMESH
				else
					meshData = @_parseMeshData(mesh.data or mesh, 0, 'Mesh')
					meshData.type = MeshData.MESH

				component = new MeshDataComponent(meshData)
				entity.setComponent(component)
				
				if mesh.pose
					console.warn "SkeletonLoader is not yet supported"
# 					var skeletonLoader = this._skeletonLoader;
# 					promise = skeletonLoader.load(data.pose)
# 						.then(function(skeletonPose) {
# 						meshData.currentPose = skeletonPose;
# 						return meshData;
# 					});
				
				return component
				
		# Translated into coffeescript from goo/loaders/MeshLoader.js
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
				# TODO: Ask Rikard about this
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
					for jointIndex in jointData
						if localJointMap[jointIndex] == undefined
							localJointMap[jointIndex] = localIndex++
	
						buffer.set([localJointMap[jointIndex]], i)
	
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
