// ============================================================
// Wedding Journey — Config Types
// ============================================================

export interface WeddingConfig {
  couple: CoupleConfig;
  loader: LoaderConfig;
  /** Each side carries its own full event list. */
  sides: Record<Side, SideConfig>;
  guestForm: GuestFormConfig;
  car: CarConfig;
  people: PeopleConfig;
  audio: AudioConfig;
  performance: PerformanceConfig;
}

export type Side = 'groom' | 'bride';

export interface SideConfig {
  id: Side;
  /** Full label, e.g. "Groom's Side". */
  label: string;
  /** Button label, e.g. "Groom". */
  shortLabel: string;
  /** Glyph or emoji shown on the choice card. */
  icon: string;
  /** One-liner under the choice card. */
  blurb: string;
  /** Whose family is hosting, shown once the side is picked. */
  host: string;
  /** Accent colour for this side's choice card. */
  accent: string;
  /**
   * This side's journey. Event `id`s must stay within the set the 3D world
   * knows how to build — entrance | nikah | mehendi | reception — since the
   * zone, lighting, sky and camera presets are keyed by id.
   */
  events: EventConfig[];
}

/** Copy for the guest sign-in modal. */
export interface GuestFormConfig {
  eyebrow: string;
  sideQuestion: string;
  sideHint?: string;
  nameQuestion: string;
  nameHint?: string;
  namePlaceholder: string;
  nameMaxLength: number;
  backLabel: string;
  submitLabel: string;
  submittingLabel: string;
  /** Used when a guest submits an empty name. */
  fallbackName: string;
}

export interface CoupleConfig {
  name1: string;
  name2: string;
  tagline: string;
  date: string;
  location: string;
}

export interface LoaderConfig {
  /** Monogram shown inside the heart. Omit to auto-derive initials from the couple names. */
  monogram?: string;
  /** Separator between auto-derived initials (ignored when `monogram` is set). */
  monogramSeparator?: string;
  title: string;
  /** Small line under the step label — omit to hide. */
  footnote?: string;
  /** Ordered checkpoints. `at` is the target percentage (0–100). */
  steps: LoaderStep[];
  /** ms spent on each step. */
  stepDurationMs: number;
  /** ms held at 100% before the fade-out starts. */
  holdMs: number;
  /** ms of the fade-out. */
  fadeMs: number;
  /** Any CSS `background` value — gradient, solid, or image. */
  background: string;
  /** CSS length for the heart; `clamp()` keeps it responsive. */
  heartSize: string;
  colors: LoaderColors;
}

export interface LoaderStep {
  at: number;
  label: string;
}

export interface LoaderColors {
  monogram: string;
  title: string;
  percent: string;
  step: string;
  track: string;
  progressFrom: string;
  progressTo: string;
  /** Ambient bloom behind the heart. */
  glow: string;
  /** Hairline rules flanking the title. */
  rule: string;
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
  /** Which family the guest is here for — drives which event list is used. */
  side: Side;
  eventIdx: number;
  previousEventIdx: number;  // for crossfade transitions
  guestName: string;
  cameraMode: CameraMode;
  soundOn: boolean;
  /** Event details modal mounted, or collapsed to the gift box trigger. */
  panelOpen: boolean;
}

export type JourneyAction =
  | { type: 'SET_STAGE'; stage: JourneyStage }
  | { type: 'SET_SIDE'; side: Side }
  | { type: 'SET_EVENT'; idx: number }
  | { type: 'SET_GUEST'; name: string }
  | { type: 'SET_CAMERA_MODE'; mode: CameraMode }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_PANEL_OPEN'; open: boolean }
  | { type: 'DRIVE_TO'; idx: number }
  | { type: 'ARRIVE' };
