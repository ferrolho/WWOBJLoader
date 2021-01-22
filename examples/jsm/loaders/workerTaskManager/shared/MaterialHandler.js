/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	LineBasicMaterial,
	MaterialLoader,
	MeshStandardMaterial,
	PointsMaterial,
	VertexColors
} from '../../../../../build/three.module.js';


class MaterialHandler {

	constructor() {

		this.logging = {
			enabled: false,
			debug: false
		};

		this.callbacks = {
			onLoadMaterials: null
		};
		this.materials = {};

	}

	/**
	 * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
	 *
	 * @param {boolean} enabled True or false.
	 * @param {boolean} debug True or false.
	 */
	setLogging ( enabled, debug ) {

		this.logging.enabled = enabled === true;
		this.logging.debug = debug === true;

	}

	_setCallbacks ( onLoadMaterials ) {

		if ( onLoadMaterials !== undefined && onLoadMaterials !== null && onLoadMaterials instanceof Function ) {

			this.callbacks.onLoadMaterials = onLoadMaterials;

		}

	}

	/**
	 * Creates default materials and adds them to the materials object.
	 *
	 * @param overrideExisting boolean Override existing material
	 */
	createDefaultMaterials ( overrideExisting ) {

		const defaultMaterial = new MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultMaterial.name = 'defaultMaterial';

		const defaultVertexColorMaterial = new MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
		defaultVertexColorMaterial.vertexColors = VertexColors;

		const defaultLineMaterial = new LineBasicMaterial();
		defaultLineMaterial.name = 'defaultLineMaterial';

		const defaultPointMaterial = new PointsMaterial( { size: 0.1 } );
		defaultPointMaterial.name = 'defaultPointMaterial';

		const runtimeMaterials = {};
		runtimeMaterials[ defaultMaterial.name ] = defaultMaterial;
		runtimeMaterials[ defaultVertexColorMaterial.name ] = defaultVertexColorMaterial;
		runtimeMaterials[ defaultLineMaterial.name ] = defaultLineMaterial;
		runtimeMaterials[ defaultPointMaterial.name ] = defaultPointMaterial;

		this.addMaterials( runtimeMaterials, overrideExisting );

	}

	/**
	 * Updates the materials with contained material objects (sync) or from alteration instructions (async).
	 *
	 * @param {Object} materialPayload Material update instructions
	 * @returns {Object} Map of {@link Material}
	 */
	addPayloadMaterials ( materialPayload ) {

		let material, materialName;
		const materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
		let newMaterials = {};

		if ( materialCloneInstructions !== undefined && materialCloneInstructions !== null ) {

			let materialNameOrg = materialCloneInstructions.materialNameOrg;
			materialNameOrg = ( materialNameOrg !== undefined && materialNameOrg !== null ) ? materialNameOrg : '';
			const materialOrg = this.materials[ materialNameOrg ];
			if ( materialOrg ) {

				material = materialOrg.clone();

				materialName = materialCloneInstructions.materialName;
				material.name = materialName;

				Object.assign( material, materialCloneInstructions.materialProperties );

				this.materials[ materialName ] = material;
				newMaterials[ materialName ] = material;

			} else {

				if ( this.logging.enabled ) {

					console.info( 'Requested material "' + materialNameOrg + '" is not available!' );

				}

			}

		}

		let materials = materialPayload.materials.serializedMaterials;
		if ( materials !== undefined && materials !== null && Object.keys( materials ).length > 0 ) {

			const loader = new MaterialLoader();
			let materialJson;
			for ( materialName in materials ) {

				materialJson = materials[ materialName ];
				if ( materialJson !== undefined && materialJson !== null ) {

					material = loader.parse( materialJson );
					if ( this.logging.enabled ) {

						console.info( 'De-serialized material with name "' + materialName + '" will be added.' );

					}
					this.materials[ materialName ] = material;
					newMaterials[ materialName ] = material;

				}

			}

		}
		materials = materialPayload.materials.runtimeMaterials;
		newMaterials = this.addMaterials( materials, true, newMaterials );

		return newMaterials;

	}

	/**
	 * Set materials loaded by any supplier of an Array of {@link Material}.
	 *
	 * @param materials Object with named {@link Material}
	 * @param forceOverrideExisting boolean Override existing material
	 * @param newMaterials [Object] with named {@link Material}
	 */
	addMaterials ( materials, forceOverrideExisting, newMaterials ) {

		if ( newMaterials === undefined || newMaterials === null ) {

			newMaterials = {};

		}
		if ( materials !== undefined && materials !== null && Object.keys( materials ).length > 0 ) {

			let material;
			let existingMaterial;
			let force;
			for ( const materialName in materials ) {

				material = materials[ materialName ];
				force = forceOverrideExisting === true;
				if ( ! force ) {

					existingMaterial = this.materials[ materialName ];
					if ( existingMaterial ) {

						if ( existingMaterial.uuid !== material.uuid ) {

							console.log( 'Same material name "' + material.name + '" different uuid [' + existingMaterial.uuid + '|' + material.uuid + ']' );
						}

					} else {

						this.materials[ materialName ] = material;

					}

				} else {

					this.materials[ materialName ] = material;
					newMaterials[ materialName ] = material;

				}
				if ( this.logging.enabled && this.logging.debug ) {

					console.info( 'Material with name "' + materialName + '" was added.' );

				}

			}

		}

		if ( this.callbacks.onLoadMaterials ) {

			this.callbacks.onLoadMaterials( newMaterials );

		}
		return newMaterials;

	}

	/**
	 * Returns the mapping object of material name and corresponding material.
	 *
	 * @returns {Object} Map of {@link Material}
	 */
	getMaterials () {

		return this.materials;

	}

	/**
	 *
	 * @param {String} materialName
	 * @returns {Material}
	 */
	getMaterial ( materialName ) {

		return this.materials[ materialName ];

	}

	/**
	 * Returns the mapping object of material name and corresponding jsonified material.
	 *
	 * @returns {Object} Map of Materials in JSON representation
	 */
	getMaterialsJSON () {

		return MaterialHandler.getMaterialsJSON( this.materials );

	}

	static getMaterialsJSON ( materialsObject ) {

		const materialsJSON = {};
		let material;
		for ( const materialName in materialsObject ) {

			material = materialsObject[ materialName ];
			materialsJSON[ materialName ] = material.toJSON();

		}
		return materialsJSON;

	}

	/**
	 * Removes all materials
	 */
	clearMaterials () {

		this.materials = {};

	}

}

export { MaterialHandler };
