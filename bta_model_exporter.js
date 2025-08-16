function jVar(name) {
    return "private final Cube " + name + ";";
}

function jAddBox(name, minX, minY, minZ, sizeX, sizeY, sizeZ) {
    return `this.${name}.addBox(${minX},${minY},${minZ},${sizeX},${sizeY},${sizeZ});`
}

function jCube(name, u, v, texWidth, texHeight) {
    return `this.${name} = new Cube(${u}, ${v}, ${texWidth}, ${texHeight});`
}

function jSetRotationPoint(name, x, y, z) {
    return `this.${name}.setRotationPoint(${x}F, ${y}F, ${z}F);`
}

function jRot(name, axis, rot) {
    return `this.name.${axis}Rot = ${rot}`;
}

function jClass(name, vars, assignaments) {
    return `
        public class Model${name} extends ModelBase {
           ${vars.map(v => jVar(v)).join("\n ")}


            public Model${name}() {
                ${assignaments.map(v => v).join("\n ")}
            }

            @Override
            public void render(float limbSwing, float limbYaw, float limbPitch, float headYaw, float headPitch, float scale) {
                ${vars.keys.map(v => `this.${v}`.render(scale)).join("\n ")}
            }
        }
    `;
}




let button;

function exportBTAformat() {
    let cleanData = Codecs.project.compile();
    //let modelData = Project.format.codec.compile();

    const vars = {

    };

    const assignments = {

    };


    cleanData.elements.forEach(element => {
        vars[element.name] = null;
    });

    cleanData.elements.forEach(element => {
        vars[element.name] = null;
    });

    let jsonString = JSON.stringify(cleanData, null, 2);
    console.log(jsonString);
}

Plugin.register('bta_model_exporter', {
    title: 'BTA Model Exporter',
    author: '@Garkatron',
    icon: 'icon',
    description: 'Export models to BTA model .java format',
    version: '1.0.0',
    variant: 'both',
    onload() {
        button = new Action("bta_export", {
            name: "Export BTA Java Model",
            icon: "save",
            click: exportBTAformat
        })
        MenuBar.addAction(button, "file.export")
    },
    onunload() {
        button.delete();
    }
});

