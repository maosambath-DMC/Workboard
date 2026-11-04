export type PersonaId = 'maya' | 'alex' | 'sam' | 'liam' | 'simon' | 'david' | 'andrea';

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  avatar: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentHex: string;
}

export type CardColor = 'yellow' | 'pink' | 'purple' | 'blue' | 'green' | 'peach';

export interface ColorDefinition {
  bg: string;
  darkBg: string;
  border: string;
  darkBorder: string;
  header: string;
  dot: string;
  badge: string;
}

export type ItemType = 'sticky' | 'reference' | 'frame' | 'image' | 'text' | 'poll' | 'miniboard';

export type NoteShape = 
  | 'square'    // 1. Classic Square Sticky
  | 'rounded'   // 2. Soft Pill Pebble
  | 'circle'    // 3. Circular Memo
  | 'folded'    // 4. Folded Dog-ear Corner
  | 'tape'      // 5. Washi Tape Strip
  | 'tag'       // 6. Luggage / Price Tag
  | 'cloud'     // 7. Thought Bubble / Cloud
  | 'badge'     // 8. Starburst Flower Badge
  | 'stamp'     // 9. Perforated Postage Stamp
  | 'arch';     // 10. Tombstone Arch

export type DecisionCategory = 'core' | 'secondary' | 'backlog';

export interface PollOption {
  id: string;
  text: string;
  votes: PersonaId[];
}

export interface CanvasItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content?: string;
  color: CardColor;
  authorId: PersonaId;
  authorName: string;
  authorAvatar: string;
  createdAt: number;
  tags: string[];
  votes: PersonaId[]; // Persona IDs who allocated a dot
  parentId?: string; // Linked parent item for branching
  branchLabel?: string; // e.g. "Variation", "Counter-Idea", "Visual Twist"
  isShortlisted?: boolean;
  isDecision?: boolean;
  decisionCategory?: DecisionCategory;
  
  // Specific for sticky & text shapes
  shape?: NoteShape;
  rotation?: number; // subtle angle for sticky feel (-2 to 2 deg)

  // Specific for reference cards & images
  imageUrl?: string;
  linkUrl?: string;
  palette?: string[]; // hex colors
  aspectRatio?: number;

  // Specific for text items
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  textColor?: string;
  isBold?: boolean;

  // Specific for Polls
  pollQuestion?: string;
  pollOptions?: PollOption[];

  // Specific for Miniboards (Teleport sub-whiteboards)
  targetProjectId?: string;
  targetBoardTitle?: string;
  subBoardItemsCount?: number;

  // Specific for frames / clusters
  frameColor?: string;
}

export interface StagedItem {
  id: string;
  authorId: PersonaId;
  authorName: string;
  authorAvatar: string;
  type: 'sticky' | 'reference';
  title: string;
  content: string;
  color: CardColor;
  tags: string[];
  imageUrl?: string;
  linkUrl?: string;
  palette?: string[];
  createdAt: number;
}

export interface PeerCursor {
  personaId: PersonaId;
  personaName: string;
  avatar?: string;
  color: string;
  x: number;
  y: number;
  hasStar?: boolean;
  activeAction?: string;
  lastActive: number;
}

export type CanvasBackground = 'dots' | 'lines' | 'clean';

export type ViewFilter = 'all' | 'top-voted' | 'shortlisted' | 'decisions' | PersonaId;

export interface VotingSession {
  isActive: boolean;
  dotsPerPerson: number;
  endsAt: number | null; // epoch timestamp
  durationMinutes: number;
  statusText?: string;
  pendingVotersCount?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  canvasHeading?: string;
  emoji: string;
  accentColor: string;
  category: string;
  status: 'voting' | 'ideation' | 'decisions' | 'completed';
  statusLabel: string;
  updatedAt: string;
  members: PersonaId[];
  items: CanvasItem[];
  stagedItems: StagedItem[];
  votingSession: VotingSession;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  isGuest: boolean;
  createdAt: number;
}

