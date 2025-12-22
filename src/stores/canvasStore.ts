import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Board,
  BoardCategory,
  CanvasNode,
  CanvasEdge,
  Asset,
  StoryAsset,
  WorkflowExecution,
} from '@/models/canvas';

interface CanvasState {
  // Current board
  currentBoard: Board | null;
  boards: Board[];

  // Canvas state
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodes: string[];
  selectedEdges: string[];

  // UI state
  nodePaletteOpen: boolean;
  inspectorOpen: boolean;
  assetLibraryOpen: boolean;
  activeCategory: BoardCategory;

  // Execution state
  currentExecution: WorkflowExecution | null;
  isExecuting: boolean;

  // Assets
  assets: Asset[];

  // Actions - Board management
  setCurrentBoard: (board: Board | null) => void;
  createBoard: (name: string, category: BoardCategory) => Board;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;

  // Actions - Node management
  setNodes: (nodes: CanvasNode[]) => void;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;

  // Actions - Edge management
  setEdges: (edges: CanvasEdge[]) => void;
  addEdge: (edge: CanvasEdge) => void;
  deleteEdge: (id: string) => void;

  // Actions - Selection
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;

  // Actions - UI panels
  toggleNodePalette: () => void;
  toggleInspector: () => void;
  toggleAssetLibrary: () => void;
  setActiveCategory: (category: BoardCategory) => void;

  // Actions - Execution
  setCurrentExecution: (execution: WorkflowExecution | null) => void;
  setIsExecuting: (isExecuting: boolean) => void;

  // Actions - Assets
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;

  // Story Library
  storyLibraryOpen: boolean;
  toggleStoryLibrary: () => void;
  saveStory: (storyData: StoryAsset['storyData'], tags?: string[]) => StoryAsset;
  getStoryAssets: () => StoryAsset[];
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentBoard: null,
        boards: [],
        nodes: [],
        edges: [],
        selectedNodes: [],
        selectedEdges: [],
        nodePaletteOpen: true,
        inspectorOpen: true,
        assetLibraryOpen: false,
        activeCategory: 'fashion',
        currentExecution: null,
        isExecuting: false,
        assets: [],

        // Board management
        setCurrentBoard: (board) => set({ currentBoard: board, nodes: board?.nodes || [], edges: board?.edges || [] }),

        createBoard: (name, category) => {
          const newBoard: Board = {
            id: crypto.randomUUID(),
            name,
            category,
            nodes: [],
            edges: [],
            viewport: { x: 0, y: 0, zoom: 1 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({ boards: [...state.boards, newBoard] }));
          return newBoard;
        },

        updateBoard: (id, updates) =>
          set((state) => ({
            boards: state.boards.map((b) =>
              b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
            ),
            currentBoard:
              state.currentBoard?.id === id
                ? { ...state.currentBoard, ...updates, updatedAt: new Date().toISOString() }
                : state.currentBoard,
          })),

        deleteBoard: (id) =>
          set((state) => ({
            boards: state.boards.filter((b) => b.id !== id),
            currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
          })),

        // Node management
        setNodes: (nodes) => set({ nodes }),
        addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
        updateNode: (id, updates) =>
          set((state) => ({
            nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
          })),
        deleteNode: (id) =>
          set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== id),
            edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          })),

        // Edge management
        setEdges: (edges) => set({ edges }),
        addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
        deleteEdge: (id) => set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),

        // Selection
        setSelectedNodes: (ids) => set({ selectedNodes: ids }),
        setSelectedEdges: (ids) => set({ selectedEdges: ids }),
        clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

        // UI panels
        toggleNodePalette: () => set((state) => ({ nodePaletteOpen: !state.nodePaletteOpen })),
        toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),
        toggleAssetLibrary: () => set((state) => ({ assetLibraryOpen: !state.assetLibraryOpen })),
        setActiveCategory: (category) => set({ activeCategory: category }),

        // Execution
        setCurrentExecution: (execution) => set({ currentExecution: execution }),
        setIsExecuting: (isExecuting) => set({ isExecuting }),

        // Assets
        addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
        removeAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),

        // Story Library
        storyLibraryOpen: false,
        toggleStoryLibrary: () => set((state) => ({ storyLibraryOpen: !state.storyLibraryOpen })),
        saveStory: (storyData, tags = []) => {
          const storyAsset: StoryAsset = {
            id: crypto.randomUUID(),
            type: 'story',
            name: storyData.title || 'Untitled Story',
            url: '', // Stories don't have URLs like media assets
            metadata: {
              genre: storyData.genre,
              tone: storyData.tone,
              characterCount: storyData.characters?.length || 0,
              hasOutline: !!storyData.outline,
            },
            tags: [...tags, storyData.genre, storyData.tone].filter(Boolean) as string[],
            createdAt: new Date().toISOString(),
            storyData,
          };
          set((state) => ({ assets: [...state.assets, storyAsset] }));
          return storyAsset;
        },
        getStoryAssets: () => {
          // This is a selector-like function but we need the current state
          // In practice, components should filter assets directly
          return [];
        },
      }),
      {
        name: 'creator-canvas-storage',
        partialize: (state) => ({
          boards: state.boards,
          assets: state.assets,
          activeCategory: state.activeCategory,
        }),
      }
    )
  )
);
