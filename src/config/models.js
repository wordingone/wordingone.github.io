// Model configuration - paths and loading behavior
const modelsBasePath = new URL('../../models/', import.meta.url);

export const models = [
    { 
        name: 'Architectural System', 
        file: new URL('arch_module_smallest.glb', modelsBasePath).href, 
        isInstanced: true 
    },
    { 
        name: 'Misc Geometry', 
        file: new URL('misc geometry.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Altars', 
        file: new URL('altars.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Circulation', 
        file: new URL('circulation.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Distress', 
        file: new URL('Distress.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Embellishments', 
        file: new URL('embellishments.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Index', 
        file: new URL('Index.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Mirror', 
        file: new URL('mirror.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Moulage', 
        file: new URL('Moulage.glb', modelsBasePath).href, 
        isInstanced: false 
    },
    { 
        name: 'Robot', 
        file: new URL('robot.glb', modelsBasePath).href, 
        isInstanced: false 
    }
];

export default models;
