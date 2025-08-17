// ============================================================================================================================================= //

/**
 * @param {string} name
 * @returns Java cube variable declaration
 */
function java_cube_declaration(name) {
    return "private final Cube " + name + ";";
}

/**
 * @param {string} name
 * @param {number} minX
 * @param {number} minY
 * @param {number} minZ
 * @param {number} sizeX
 * @param {number} sizeY
 * @param {number} sizeZ
 * @returns Java addBox call
 */
function java_add_box(name, minX, minY, minZ, sizeX, sizeY, sizeZ) {
    return `this.${name}.addBox(${minX},${minY},${minZ},${sizeX},${sizeY},${sizeZ});`
}

/**
 * @param {string} name
 * @param {number} u
 * @param {number} v
 * @param {number} texWidth
 * @param {number} texHeight
 * @returns Cube initialization
 */
function java_cube_assing(name, u, v, texWidth, texHeight) {
    return `this.${name} = new Cube(${u}, ${v}, ${texWidth}, ${texHeight});`
}

/**
 * @param {string} name
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns Sets cube rotation point
 */
function java_set_rotation_point(name, x, y, z) {
    return `this.${name}.setRotationPoint(${x}F, ${y}F, ${z}F);`
}

/**
 * @param {string} name
 * @param {number} axis
 * @param {number} rot
 * @returns Sets rotation for an axis
 */
function java_set_rotation_axis(name, axis, rot) {
    let r = Number(rot);
    return `this.${name}.${axis}Rot = (float)Math.toRadians(${r});`;
}

/**
 * @param {string} name
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns Sets rotation for all axes
 */
function java_full_rotation(name, x, y, z) {
    return `
        ${java_set_rotation_axis(name, "x", x)}
        ${java_set_rotation_axis(name, "y", y)}
        ${java_set_rotation_axis(name, "z", z)}`;
}

/**
 * @param {string} name
 * @param {array} vars
 * @param {array} assignments
 * @returns Full Java model class
 */
function java_model_class(name, vars, assignments) {
    const varLines = vars.map(v => java_cube_declaration(v)).join("\n        ");
    const assignLines = assignments.map(a => a).join("\n        ");
    const renderLines = vars.map(v => `this.${v}.render(scale);`).join("\n        ");

    return `

import net.minecraft.client.render.model.Cube;
import net.minecraft.client.render.model.ModelBase;
public class Model${name} extends ModelBase {
    ${varLines}

    public Model${name}() {
        ${assignLines}
    }

    @Override
    public void render(float limbSwing, float limbYaw, float limbPitch, float headYaw, float headPitch, float scale) {
        ${renderLines}
    }
}
`;
}

// ============================================================================================================================================= //
let export_button;
const pivotY = 6;
function export_bta_format() {
    let projectData = Project;  // <- aquí está la data con elements
    const vars = [];
    const ar = [];
    let w = projectData.resolution ? projectData.resolution.width : 64;
    let h = projectData.resolution ? projectData.resolution.height : 64;
    if (!projectData.elements || projectData.elements.length === 0) {
        console.error("❌ No se encontraron elementos en el proyecto");
        return;
    }

    projectData.elements.forEach(element => {
        let name = element.name;
        vars.push(name);


        if (element.uv_offset) {
            ar.push(java_cube_assing(
                name,
                element.uv_offset[0],
                element.uv_offset[1],
                w,
                h
            ));
        }

        let sizeX = element.to[0] - element.from[0];
        let sizeY = element.to[1] - element.from[1];
        let sizeZ = element.to[2] - element.from[2];

        let posX = element.from[0] - element.origin[0];
        let posY = element.from[1] - element.origin[1];
        let posZ = element.from[2] - element.origin[2];

        console.log(name);
        console.log(posX, posY, posZ);
        console.log(sizeX, sizeY, sizeZ);

        ar.push(java_add_box(
            name,
            posX, posY, posZ,
            sizeX, sizeY, sizeZ
        ));


        if (element.origin) {
            ar.push(java_set_rotation_point(
                name,
                element.origin[0],
                pivotY - (posY - sizeY),
                element.origin[2]
            ))
        }


        if (element.rotation) {
            ar.push(java_full_rotation
                (
                    name,
                    element.rotation[0] || 0,
                    element.rotation[1] || 0,
                    element.rotation[2] || 0
                ));
        }

    });

    let finalString = "// Exported with @Garkatron BTA Model Exporter. 0/\n";
    finalString += java_model_class(projectData.name, vars, ar);

    Blockbench.export({
        name: "Model" + projectData.name,
        extensions: ["java"],
        type: "text",
        content: finalString
    });
}


Plugin.register('bta_model_exporter', {
    title: 'BTA Model Exporter',
    author: '@Garkatron',
    icon: 'icon',
    description: 'Export models to BTA model .java format',
    version: '1.0.0',
    variant: 'both',
    onload() {
        export_button = new Action("bta_export", {
            name: "Export BTA Model",
            icon: "save",
            click: export_bta_format

        })
        MenuBar.addAction(export_button, "file.export")
    },
    onunload() {
        export_button.delete();
    }
});

