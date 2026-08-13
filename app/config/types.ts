// ============================================================
// Wedding Journey — Config Types
// ============================================================

export interface WeddingConfig {
  couple: CoupleConfig;
  events: EventConfig[];
  car: CarConfig;
  people: PeopleConfig;
  audio: AudioConfig;
  performance: PerformanceConfig;
}

export interface CoupleConfig {
  name1: string;
  name2: string;
  tagline: string;
  date: string;
  location: string;
}

export interface EventConfig {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  greet: string;       // template: "Dear {{name}},"
  body: string;        // template: "... {{name}} ..."
  caption: string;     // driving caption to next event
  meta: MetaLine[];
  sky: SkyGradient;
  lighting: LightingPreset;
  camera: CameraPreset;
  theme: ThemeColors;
  zoneZ: number;       // Z position along the road
  enableExplore?: boolean;
  exploreBounds?: ExploreBounds;
  interactions?: ZoneInteraction[];
}

export interface MetaLine {
  icon: string;
  text: string;
  bold?: string;       // bold portion within text
}

export interface SkyGradient {
  stops: string[];     // CSS gradient color stops
  direction?: number;  // gradient angle in degrees (default 180)
}

export interface LightingPreset {
  fog: string;         // hex color
  fogNear: number;
  fogFar: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  ambientIntensity: number;
}

export interface CameraPreset {
  position: [number, number, number];   // camera position offset from zone Z
  lookAt: [number, number, number];     // lookAt offset from zone Z
  flyDuration?: number;                 // ms (default 2400)
}

export interface ThemeColors {
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  shadow: string;
}

export interface ExploreBounds {
  minDistance: number;
  maxDistance: number;
  center: [number, number, number];
}

export interface ZoneInteraction {
  id: string;
  type: 'detail' | 'link' | 'gallery' | 'map' | 'rsvp' | 'wishes' | 'game' | 'menu';
  position: [number, number, number];
  label: string;
  content: {
    title: string;
    body?: string;
    image?: string;
    url?: string;
  };
}

export interface CarConfig {
  type: 'procedural' | 'model';
  modelPath?: string;
  color: string;
  trimColor: string;
  decorations: boolean;
  speedMultiplier: number;  // 0.5 = slow, 1.0 = normal, 2.0 = fast
}

export interface PeopleConfig {
  type: 'procedural' | 'model';
  modelPath?: string;
}

export interface AudioConfig {
  enabled: boolean;
  engine: boolean;
  bgm: boolean;
  wind: boolean;
}

export interface PerformanceConfig {
  maxDpr: number;
  shadowMapSize: number;
  enableFireworks: boolean;
  maxParticles: number;
}

// Journey state
export type JourneyStage = 'loading' | 'gate' | 'naming' | 'event' | 'driving';
export type CameraMode = 'guided' | 'explore';

export interface JourneyState {
  stage: JourneyStage;
  eventIdx: number;
  previousEventIdx: number;  // for crossfade transitions
  guestName: string;
  cameraMode: CameraMode;
  soundOn: boolean;
}

export type JourneyAction =
  | { type: 'SET_STAGE'; stage: JourneyStage }
  | { type: 'SET_EVENT'; idx: number }
  | { type: 'SET_GUEST'; name: string }
  | { type: 'SET_CAMERA_MODE'; mode: CameraMode }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'DRIVE_TO'; idx: number }
  | { type: 'ARRIVE' };
