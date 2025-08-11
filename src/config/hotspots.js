// Hotspot configuration - coordinates, rotations, and metadata
// Reference dimensions: 1920x1080 (Figma export)
export const REFERENCE_WIDTH = 1920;
export const REFERENCE_HEIGHT = 1080;

export const hotspots = [
    {
        area: 'index',
        coords: [516, 448, 154, 37], // [x, y, width, height]
        rotation: 4.0,
        label: 'index'
    },
    {
        area: 'mirror',
        coords: [818, 459, 104, 44],
        rotation: 2.9,
        label: 'mirror'
    },
    {
        area: 'exhibition-right',
        coords: [1285, 589, 153, 131],
        rotation: 0.8,
        label: 'exhibition-right'
    },
    {
        area: 'archive_1',
        coords: [354, 440, 58, 44],
        rotation: 4.2,
        label: 'archive_1'
    },
    {
        area: 'archive_2',
        coords: [831, 574, 113, 84],
        rotation: 0,
        label: 'archive_2'
    },
    {
        area: 'circulation_2',
        coords: [1345, 346, 101, 112],
        rotation: 0.4,
        label: 'circulation_2'
    },
    {
        area: 'circulation_1',
        coords: [1220, 216, 109, 163],
        rotation: 0.5,
        label: 'circulation_1'
    },
    {
        area: 'insula',
        coords: [948, 522, 136, 109],
        rotation: 0.3,
        label: 'insula'
    },
    {
        area: 'altar',
        coords: [1426, 455, 62, 42],
        rotation: -2.1,
        label: 'altar'
    }
];

export default hotspots;
