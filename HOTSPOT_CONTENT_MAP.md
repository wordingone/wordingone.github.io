# HOTSPOT CONTENT MAPPING
## WordingOne - Prada: (Re)Making Navigation System

### Overview
The LiDAR interface contains 9 interactive hotspots, each linked to specific 3D model regions and video content. Below is a comprehensive mapping of all hotspots with their associated media and suggested contextual descriptions.

---

## 1. INDEX
**Location**: Central workspace area  
**Data**: `data-area="index"` | Coords: 516,448,154,37  
**3D Model Focus**: Index model components  
**Video Series**: 2 videos
- `index_1.mp4`
- `index_2.mp4`

**Suggested Description**:
"The Index represents the organizational framework of the architectural system. This cataloging methodology transforms spatial data into navigable experiences, creating a bridge between physical documentation and digital interpretation."

---

## 2. MIRROR
**Location**: Upper central area  
**Data**: `data-area="mirror"` | Coords: 818,459,104,44  
**3D Model Focus**: Mirror reflective elements  
**Video Series**: 1 video
- `Mirror.mp4`

**Suggested Description**:
"Reflective surfaces create infinite spatial recursions, questioning the boundaries between real and represented space. The mirror becomes both a literal and metaphorical device for examining architectural perception."

---

## 3. EXHIBITION-RIGHT (MODEL SERIES)
**Location**: Right exhibition area  
**Data**: `data-area="exhibition-right"` | Coords: 1285,589,153,131  
**3D Model Focus**: Exhibition space models  
**Video Series**: 4 videos (NEW)
- `Model_1.mp4`
- `Model_2.mp4`
- `Model_3.mp4`
- `Model_4.mp4`

**Suggested Description**:
"Physical models document the evolution of spatial concepts from abstract to concrete. Each iteration reveals new relationships between form, function, and the cinematic experience of architecture."

---

## 4. ARCHIVE INSIDE
**Location**: Archive interior space  
**Data**: `data-area="archive_inside"` | Coords: 354,440,58,44  
**3D Model Focus**: Interior archive structures  
**Video Series**: 1 video
- `archive_inside.mp4`

**Suggested Description**:
"The archive's interior reveals layers of accumulated memory and documentation. This intimate space preserves the traces of creative process, offering glimpses into the evolution of architectural thought."

---

## 5. ARCHIVE 2 (ARCHIVE SERIES)
**Location**: Archive center (large vertical area)  
**Data**: `data-area="archive_2"` | Coords: 831,574,113,84  
**3D Model Focus**: Main archive components  
**Video Series**: 6 videos
- `archive_1.mp4`
- `archive_2.mp4`
- `archive_3.mp4`
- `archive_4.mp4`
- `archive_5.mp4`
- `archive_6.mp4`

**Suggested Description**:
"The central archive functions as a repository of spatial memory, containing fragments of past iterations and future possibilities. Six perspectives reveal the multifaceted nature of architectural documentation."

---

## 6. RED DYE
**Location**: Material experimentation area (recently moved left)  
**Data**: `data-area="red_dye"` | Coords: 1310,346,101,112  
**3D Model Focus**: Material and texture studies  
**Video Series**: 1 video
- `Red Dye.mp4`

**Suggested Description**:
"Material experiments with dye and fabric explore the intersection of fashion and architecture. The red dye process reveals transformation, permanence, and the marking of space through color and texture."

---

## 7. CIRCULATION 1 (CIRCULATION SERIES)
**Location**: Movement documentation area  
**Data**: `data-area="circulation_1"` | Coords: 1220,216,109,163  
**3D Model Focus**: Circulation paths and flow  
**Video Series**: 2 videos
- `circulation_1.mp4`
- `circulation_2.mp4`

**Suggested Description**:
"Circulation patterns define the choreography of movement through space. These studies map the invisible trajectories of bodies, revealing the dynamic relationship between architecture and human motion."

---

## 8. INSULA
**Location**: Digital workspace area  
**Data**: `data-area="insula"` | Coords: 948,522,136,109  
**3D Model Focus**: Isolated architectural elements  
**Video Series**: 1 video
- `insula.mp4`

**Suggested Description**:
"The Insula represents architectural isolation and autonomy. This self-contained unit explores the tension between connection and separation, creating a microcosm of larger spatial relationships."

---

## 9. ALTAR (ALTAR SERIES)
**Location**: Studio corner (sacred space)  
**Data**: `data-area="altar"` | Coords: 1426,455,62,42  
**3D Model Focus**: Altar ceremonial structures  
**Video Series**: 4 videos
- `altar_1.mp4`
- `altar_2.mp4`
- `altar_3.mp4`
- `altar_4.mp4`

**Suggested Description**:
"The Altar series investigates sacred geometry and ritualistic space. Four variations explore the transformation of everyday architecture into spaces of contemplation and ceremony."

---

## Additional Video Content (Not Currently Mapped)
These videos exist in the repository but are not assigned to hotspots:
- `250331 Scene 01.mp4`
- `250411 Lift.mp4`
- `250412 Altar 01.mp4`
- `250413 Altar 02 1.mp4`
- `250413 Rotation Om.Mp4 - Slow Motion.mp4`
- `All Jun Type Shit.mp4`
- `Jun Combo.mp4`
- `complete animation.mp4` (Used for intro)

---

## 3D Model Components
The system includes 10 GLB models that are highlighted when hotspots are activated:
1. **Architectural System** (`arch_module_smallest.glb`) - GPU instanced
2. **Misc Geometry** (`misc geometry.glb`)
3. **Altars** (`altars.glb`)
4. **Circulation** (`circulation.glb`)
5. **Distress** (`Distress.glb`)
6. **Embellishments** (`embellishments.glb`)
7. **Index** (`Index.glb`)
8. **Mirror** (`mirror.glb`)
9. **Moulage** (`Moulage.glb`)
10. **Robot** (`robot.glb`)

---

## Technical Implementation Notes

### Hotspot Behavior
- **Hover**: Shows glass pin with "?" symbol
- **Click**: Triggers 3.5x zoom to region + video overlay
- **Highlighting Mode**: Darkens background (65% opacity) to emphasize hotspots
- **Model Focus**: Corresponding 3D models are highlighted with color tinting

### Video Player Features
- Auto-play for series
- Navigation controls for multi-video series
- Glass-morphism UI with premium controls
- Progress dots for series navigation
- Previous/Next buttons with elegant animations

### Suggested Text Integration
To add descriptive text to video popups, modify the `createVideoSeriesOverlay` function in `src/overlay/videoOverlay.js`:

```javascript
// Add after the video element in the HTML template
<div class="video-description">
    <p>${getDescriptionForRegion(region)}</p>
</div>
```

Then create a mapping function with the descriptions above.

---

## Color Coding System (Future Enhancement)
Consider color-coding hotspots by category:
- **Blue**: Digital/Technical (Index, Insula)
- **Purple**: Sacred/Ceremonial (Altar, Mirror)
- **Red**: Material/Process (Red Dye, Circulation)
- **Green**: Archive/Documentation (Archive series)
- **Gold**: Exhibition/Display (Model series)

---

*Last Updated: 2025-08-11*
