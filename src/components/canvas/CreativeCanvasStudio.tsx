/**
 * Creative Canvas Studio - Main Component
 * Infinity board with template cards for Fashion, Interior Design, Stock Images, and Stories
 * Uses React Flow for the infinite canvas functionality
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  Tabs,
  Tab,
  TextField,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Paper,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Style as FashionIcon,
  Weekend as InteriorIcon,
  Photo as StockIcon,
  MenuBook as StoryIcon,
  FolderOpen as LibraryIcon,
  Store as MarketplaceIcon,
  Dashboard as BoardsIcon,
  Save as SaveIcon,
  Download as ExportIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  FitScreen as FitViewIcon,
  GridOn as GridIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Lock as LockIcon,
  ArrowBack as BackIcon,
  Palette as PaletteIcon,
  Layers as LayersIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import type {
  CanvasBoard,
  CanvasCard,
  CardTemplate,
  CardCategory,
  CardType,
  CreateBoardRequest,
  CreateCardRequest,
  ConnectionActionType,
  ConnectionActionOptions,
} from '../../models/creativeCanvas';
import type { CanvasNodeData, NodeType } from '../../models/canvas';
import {
  CATEGORY_INFO,
  normalizeCardFromApi,
  getTemplateById,
} from '../../models/creativeCanvas';
import creativeCanvasService from '../../services/creativeCanvasService';
import connectionActionService from '../../services/connectionActionService';
import { CanvasNode } from '../nodes/CanvasNode';
import { FlowNode } from '../nodes/FlowNode';
// Storytelling nodes (Dec 2025)
import { StoryGenesisNode } from '../nodes/StoryGenesisNode';
import { StoryStructureNode } from '../nodes/StoryStructureNode';
import { CharacterCreatorNode } from '../nodes/CharacterCreatorNode';
import { SceneGeneratorNode } from '../nodes/SceneGeneratorNode';
import { LocationCreatorNode } from '../nodes/LocationCreatorNode';
import { DialogueGeneratorNode } from '../nodes/DialogueGeneratorNode';
// Storytelling Phase 2 nodes (Dec 2025)
import { TreatmentGeneratorNode } from '../nodes/TreatmentGeneratorNode';
import { CharacterRelationshipNode } from '../nodes/CharacterRelationshipNode';
import { CharacterVoiceNode } from '../nodes/CharacterVoiceNode';
import { WorldLoreNode } from '../nodes/WorldLoreNode';
import { TimelineNode } from '../nodes/TimelineNode';
import { PlotPointNode } from '../nodes/PlotPointNode';
import { PlotTwistNode } from '../nodes/PlotTwistNode';
import { ConflictGeneratorNode } from '../nodes/ConflictGeneratorNode';
import { MonologueGeneratorNode } from '../nodes/MonologueGeneratorNode';
// Branching narrative nodes (Dec 2025)
import { ChoicePointNode } from '../nodes/ChoicePointNode';
import { ConsequenceTrackerNode } from '../nodes/ConsequenceTrackerNode';
import { PathMergeNode } from '../nodes/PathMergeNode';
// Enhancement nodes (Dec 2025)
import { StoryPivotNode } from '../nodes/StoryPivotNode';
import { IntrigueLiftNode } from '../nodes/IntrigueLiftNode';
import { StoryEnhancerNode } from '../nodes/StoryEnhancerNode';
// Visualization nodes - Phase 5 (Dec 2025)
import { SceneVisualizerNode } from '../nodes/SceneVisualizerNode';
import { CharacterSheetNode } from '../nodes/CharacterSheetNode';
import { ScreenplayFormatterNode } from '../nodes/ScreenplayFormatterNode';
// Fashion nodes (Dec 2025)
import { GarmentSketchNode } from '../nodes/GarmentSketchNode';
import { TextileDesignerNode } from '../nodes/TextileDesignerNode';
import { ModelCasterNode } from '../nodes/ModelCasterNode';
import { OutfitComposerNode } from '../nodes/OutfitComposerNode';
import { FlatLayComposerNode } from '../nodes/FlatLayComposerNode';
import { EcommerceShotNode } from '../nodes/EcommerceShotNode';
import { CollectionBuilderNode } from '../nodes/CollectionBuilderNode';
import { PatternGeneratorNode } from '../nodes/PatternGeneratorNode';
import { TechPackGeneratorNode } from '../nodes/TechPackGeneratorNode';
import { LookbookGeneratorNode } from '../nodes/LookbookGeneratorNode';
import { AccessoryStylistNode } from '../nodes/AccessoryStylistNode';
import { FabricMotionNode } from '../nodes/FabricMotionNode';
import TemplateBrowser from '../panels/TemplateBrowser';
import BoardManager from '../panels/BoardManager';
import ConnectionActionMenu from '../panels/ConnectionActionMenu';
// NodePalette removed - now using CreativePalette v3 exclusively
import { NodeInspector } from '../panels/NodeInspector';
// Creative Palette Redesign (Elevated Vision v3.0 - Phase 3)
import { CreativePalette } from '../palette';
import { validateConnection, getEdgeStyle, createConnectionValidator } from '../../utils/connectionValidation';
// New Creative Card system (Elevated Vision v3.0)
import { CreativeCard, StandardEdge, FlowingEdge, StyleEdge, CharacterEdge, DelightEdge } from '../cards';
// Creative Collaborators (Agents) - Elevated Vision v3.0
import { AgentPresence, AgentPanel } from '../agents';
import type { AgentPersona } from '../agents';
// Workflow Templates (Elevated Vision v3.0)
import type { WorkflowTemplate, PersonaType } from '../../data/workflowTemplates';
import { nodeDefinitions } from '../../config/nodeDefinitions';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface CreativeCanvasStudioProps {
  /** Initial workflow template to load on mount */
  initialWorkflow?: WorkflowTemplate | null;
  /** Callback when workflow has been loaded */
  onWorkflowLoaded?: () => void;
  /** User's selected persona for personalized experience */
  userPersona?: PersonaType;
}

// Context for passing props to inner component
const WorkflowContext = React.createContext<{
  initialWorkflow?: WorkflowTemplate | null;
  onWorkflowLoaded?: () => void;
  userPersona?: PersonaType;
}>({});

// Node types for React Flow
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = {
  canvasCard: CanvasNode,
  creativeCard: CreativeCard as any, // New Creative Card (Elevated Vision v3.0)
  canvasNode: FlowNode as any,  // New flow node type for palette nodes
  // Storytelling nodes - Foundation (Dec 2025)
  storyGenesis: StoryGenesisNode as any,
  storyStructure: StoryStructureNode as any,
  characterCreator: CharacterCreatorNode as any,
  sceneGenerator: SceneGeneratorNode as any,
  locationCreator: LocationCreatorNode as any,
  dialogueGenerator: DialogueGeneratorNode as any,
  // Storytelling nodes - Phase 2 (Dec 2025)
  treatmentGenerator: TreatmentGeneratorNode as any,
  characterRelationship: CharacterRelationshipNode as any,
  characterVoice: CharacterVoiceNode as any,
  worldLore: WorldLoreNode as any,
  storyTimeline: TimelineNode as any,
  plotPoint: PlotPointNode as any,
  plotTwist: PlotTwistNode as any,
  conflictGenerator: ConflictGeneratorNode as any,
  monologueGenerator: MonologueGeneratorNode as any,
  // Branching narrative nodes (Dec 2025)
  choicePoint: ChoicePointNode as any,
  consequenceTracker: ConsequenceTrackerNode as any,
  pathMerge: PathMergeNode as any,
  // Enhancement nodes (Dec 2025)
  storyPivot: StoryPivotNode as any,
  intrigueLift: IntrigueLiftNode as any,
  storyEnhancer: StoryEnhancerNode as any,
  // Visualization nodes - Phase 5 (Dec 2025)
  sceneVisualizer: SceneVisualizerNode as any,
  characterSheet: CharacterSheetNode as any,
  screenplayFormatter: ScreenplayFormatterNode as any,
  // Fashion nodes (Dec 2025)
  garmentSketch: GarmentSketchNode as any,
  textileDesigner: TextileDesignerNode as any,
  modelCaster: ModelCasterNode as any,
  outfitComposer: OutfitComposerNode as any,
  flatLayComposer: FlatLayComposerNode as any,
  ecommerceShot: EcommerceShotNode as any,
  collectionBuilder: CollectionBuilderNode as any,
  patternGenerator: PatternGeneratorNode as any,
  techPackGenerator: TechPackGeneratorNode as any,
  lookbookGenerator: LookbookGeneratorNode as any,
  accessoryStylist: AccessoryStylistNode as any,
  fabricMotion: FabricMotionNode as any,
};

// Edge types for React Flow - animated connection lines
const edgeTypes = {
  default: StandardEdge,
  standard: StandardEdge,
  flowing: FlowingEdge,
  style: StyleEdge,
  character: CharacterEdge,
  delight: DelightEdge,
};

// Convert CanvasCard to React Flow Node
// Uses CreativeCard (Elevated Vision v3.0) with 3 modes: hero, craft, mini
const cardToNode = (
  card: CanvasCard,
  callbacks: {
    onUpdate?: (card: CanvasCard) => void;
    onDelete?: (cardId: string) => void;
    onDuplicate?: (card: CanvasCard) => void;
    onError?: (message: string) => void;
    onSuccess?: (message: string) => void;
  },
  useCreativeCard: boolean = true // Toggle between old and new card system
): Node => ({
  id: card.id,
  type: useCreativeCard ? 'creativeCard' : 'canvasCard',
  position: { x: card.position.x, y: card.position.y },
  data: { card, ...callbacks },
  style: {
    // CreativeCard manages its own dimensions based on mode
    width: useCreativeCard ? undefined : card.dimensions.width,
    height: useCreativeCard ? undefined : (card.isExpanded ? (card.dimensions.height * 2) : card.dimensions.height),
    zIndex: card.zIndex,
  },
  draggable: !card.isLocked,
  selectable: true,
});

// Main canvas component (wrapped with ReactFlowProvider)
const CreativeCanvasInner: React.FC = () => {
  const theme = useTheme();
  const reactFlowInstance = useReactFlow();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Get workflow context
  const { initialWorkflow, onWorkflowLoaded, userPersona: _userPersona } = React.useContext(WorkflowContext);
  const [workflowLoaded, setWorkflowLoaded] = useState(false);
  // Note: userPersona can be used later for personalized suggestions

  // Board state
  const [currentBoard, setCurrentBoard] = useState<CanvasBoard | null>(null);
  const [boards, setBoards] = useState<CanvasBoard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // UI state
  const [activeView, setActiveView] = useState<'canvas' | 'boards' | 'library' | 'marketplace'>('boards');
  const [templateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  const [createBoardDialogOpen, setCreateBoardDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardCategory, setNewBoardCategory] = useState<CardCategory>('fashion');

  // Panel state
  const [nodePaletteOpen, setNodePaletteOpen] = useState(true);
  const [nodeInspectorOpen, setNodeInspectorOpen] = useState(true);
  const [selectedFlowNode, setSelectedFlowNode] = useState<{ id: string; data: CanvasNodeData } | null>(null);

  // Settings
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapToGrid] = useState(true);

  // Connection state - for "Moments of Delight" when connecting nodes
  const [connectionMenuState, setConnectionMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    sourceCardId: string;
    targetCardId: string;
  } | null>(null);
  const [connectionProcessing, setConnectionProcessing] = useState(false);

  // Agent state - Creative Collaborators (Elevated Vision v3.0)
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<AgentPersona>('muse');

  // Creative Palette v3 is now the default (legacy NodePalette removed)

  // Handle card update from child node
  const handleCardUpdate = useCallback((updatedCard: CanvasCard) => {
    setNodes(prev => prev.map(node => {
      if (node.id === updatedCard.id) {
        return {
          ...node,
          data: { ...node.data, card: updatedCard },
          style: {
            ...node.style,
            height: updatedCard.isExpanded
              ? (updatedCard.dimensions.height * 2)
              : updatedCard.dimensions.height,
          },
          draggable: !updatedCard.isLocked,
        };
      }
      return node;
    }));

    setCurrentBoard(prev => {
      if (!prev) return null;
      const cards = prev.cards || [];
      return {
        ...prev,
        cards: cards.map(card =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      };
    });
  }, [setNodes]);

  // Handle connection between nodes - validates port compatibility and opens "Moments of Delight" menu
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (connection.source === connection.target) return;

    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    if (!sourceNode || !targetNode) return;

    // Validate connection using port type checking
    // Cast nodes to the expected type - validation handles mixed node types gracefully
    const validation = validateConnection(
      connection,
      nodes as Node<CanvasNodeData>[],
      edges,
      {
        allowSelfConnection: false,
        allowMultipleConnections: false,
        strictTypeChecking: false,
      }
    );

    if (!validation.isValid) {
      setError(validation.reason || 'Invalid connection');
      return;
    }

    // Get edge style based on port types
    const edgeStyle = validation.sourcePort && validation.targetPort
      ? getEdgeStyle(validation.sourcePort.type, validation.targetPort.type)
      : { stroke: '#9c27b0', strokeWidth: 2 };

    // Add the edge visually
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: edgeStyle,
    }, eds));

    // Open the connection action menu for canvas cards (Moments of Delight)
    // Only show for card-to-card connections, not flow nodes
    if (sourceNode.type === 'canvasCard' && targetNode.type === 'canvasCard') {
      setConnectionMenuState({
        isOpen: true,
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        sourceCardId: connection.source,
        targetCardId: connection.target,
      });
    }
  }, [nodes, edges, setEdges]);

  // Handle connection action selection
  const handleConnectionAction = useCallback(async (
    actionType: ConnectionActionType,
    options: ConnectionActionOptions
  ) => {
    if (!connectionMenuState || !currentBoard) return;

    const { sourceCardId, targetCardId } = connectionMenuState;

    // Get the cards
    const sourceNode = nodes.find(n => n.id === sourceCardId);
    const targetNode = nodes.find(n => n.id === targetCardId);
    if (!sourceNode || !targetNode) {
      setError('Could not find connected cards');
      return;
    }

    const sourceCard = (sourceNode.data as { card: CanvasCard }).card;
    const targetCard = (targetNode.data as { card: CanvasCard }).card;

    // Check if we can execute
    const canExecuteCheck = connectionActionService.canExecute(sourceCard, targetCard);
    if (!canExecuteCheck.canExecute) {
      setError(canExecuteCheck.reason || 'Cannot execute connection action');
      return;
    }

    setConnectionProcessing(true);
    setSuccessMessage(`Creating ${actionType.replace(/-/g, ' ')}...`);

    try {
      const response = await connectionActionService.executeConnectionAction(
        {
          sourceCardId,
          targetCardId,
          actionType,
          options,
          boardId: currentBoard.id,
          category: currentBoard.category,
        },
        sourceCard,
        targetCard
      );

      if (response.success && response.childCardIds.length > 0) {
        // Reload the board to get the new cards
        const boardResponse = await creativeCanvasService.boards.get(currentBoard.id);
        if (boardResponse.success && boardResponse.data) {
          setCurrentBoard(boardResponse.data);
          setSuccessMessage(`Created ${response.childCardIds.length} new card(s) with ${actionType.replace(/-/g, ' ')}!`);
        }
      } else if (response.error) {
        setError(response.error);
      } else {
        setSuccessMessage(`Connection action completed`);
      }
    } catch (err: unknown) {
      console.error('Connection action failed:', err);
      setError((err as Error).message || 'Failed to execute connection action');
    } finally {
      setConnectionProcessing(false);
      setConnectionMenuState(null);
    }
  }, [connectionMenuState, currentBoard, nodes]);

  // Close connection menu
  const handleCloseConnectionMenu = useCallback(() => {
    setConnectionMenuState(null);
    if (connectionMenuState) {
      setEdges((eds) => eds.filter(e =>
        !(e.source === connectionMenuState.sourceCardId && e.target === connectionMenuState.targetCardId)
      ));
    }
  }, [connectionMenuState, setEdges]);

  // Handle card delete from child node
  const handleCardDelete = useCallback(async (cardId: string) => {
    try {
      await creativeCanvasService.cards.delete(cardId);
      setNodes(prev => prev.filter(n => n.id !== cardId));
      setCurrentBoard(prev => {
        if (!prev) return null;
        const cards = prev.cards || [];
        return {
          ...prev,
          cards: cards.filter(c => c.id !== cardId),
        };
      });
      setSuccessMessage('Card deleted successfully');
    } catch (err) {
      console.error('Failed to delete card:', err);
      setError('Failed to delete card');
    }
  }, [setNodes]);

  // Handle card duplicate from child node
  const handleCardDuplicate = useCallback(async (cardToDuplicate: CanvasCard) => {
    if (!currentBoard) return;

    try {
      const request: CreateCardRequest = {
        type: cardToDuplicate.type,
        templateId: cardToDuplicate.templateId,
        position: {
          x: cardToDuplicate.position.x + 50,
          y: cardToDuplicate.position.y + 50,
        },
        dimensions: cardToDuplicate.dimensions,
        title: `${cardToDuplicate.title} (Copy)`,
        prompt: cardToDuplicate.prompt,
        settings: cardToDuplicate.settings,
      };

      const response = await creativeCanvasService.cards.create(currentBoard.id, request);
      if (response.success && response.data) {
        const newCard: CanvasCard = {
          ...response.data,
          prompt: response.data.prompt || cardToDuplicate.prompt,
          title: response.data.title || `${cardToDuplicate.title} (Copy)`,
        };
        const newNode = cardToNode(newCard, cardCallbacks);
        setNodes(prev => [...prev, newNode]);
        setCurrentBoard(prev => {
          if (!prev) return null;
          const cards = prev.cards || [];
          return { ...prev, cards: [...cards, newCard] };
        });
        setSuccessMessage('Card duplicated successfully');
      }
    } catch (err) {
      console.error('Failed to duplicate card:', err);
      setError('Failed to duplicate card');
    }
  }, [currentBoard, setNodes]);

  // Callbacks object for card nodes
  const cardCallbacks = useMemo(() => ({
    onUpdate: handleCardUpdate,
    onDelete: handleCardDelete,
    onDuplicate: handleCardDuplicate,
    onError: setError,
    onSuccess: setSuccessMessage,
  }), [handleCardUpdate, handleCardDelete, handleCardDuplicate]);

  // Connection validator for React Flow's isValidConnection prop
  // Provides visual feedback during connection dragging
  const connectionValidator = useMemo(
    () => createConnectionValidator(nodes as Node<CanvasNodeData>[], edges, { strictTypeChecking: false }),
    [nodes, edges]
  );

  // Wrapper to handle React Flow's isValidConnection type (accepts Connection | Edge)
  const isValidConnection = useCallback(
    (connectionOrEdge: Connection | Edge) => {
      // Convert to Connection type for our validator
      const connection: Connection = {
        source: connectionOrEdge.source,
        target: connectionOrEdge.target,
        sourceHandle: connectionOrEdge.sourceHandle ?? null,
        targetHandle: connectionOrEdge.targetHandle ?? null,
      };
      return connectionValidator(connection);
    },
    [connectionValidator]
  );

  // Load boards on mount
  useEffect(() => {
    loadBoards();
  }, []);

  // Load initial workflow template if provided (from onboarding)
  useEffect(() => {
    if (initialWorkflow && !workflowLoaded) {
      console.log('Loading workflow template:', initialWorkflow.name);

      // Convert workflow nodes to React Flow nodes
      const flowNodes: Node[] = initialWorkflow.nodes.map((workflowNode) => {
        const nodeDef = nodeDefinitions.find((n) => n.type === workflowNode.nodeType);

        const nodeData: CanvasNodeData = {
          nodeType: workflowNode.nodeType,
          category: nodeDef?.category || 'input',
          label: workflowNode.label,
          parameters: workflowNode.parameters || (nodeDef?.parameters.reduce<Record<string, unknown>>(
            (acc, param) => ({ ...acc, [param.id]: param.default }),
            {}
          ) || {}),
          inputs: nodeDef?.inputs || [],
          outputs: nodeDef?.outputs || [],
          status: 'idle',
        };

        return {
          id: workflowNode.id,
          type: 'canvasNode',
          position: workflowNode.position,
          data: nodeData,
          selected: false,
        };
      });

      // Convert workflow edges to React Flow edges
      const flowEdges: Edge[] = initialWorkflow.edges.map((workflowEdge) => ({
        id: workflowEdge.id,
        source: workflowEdge.source,
        sourceHandle: workflowEdge.sourceHandle,
        target: workflowEdge.target,
        targetHandle: workflowEdge.targetHandle,
        type: 'default',
        animated: true,
      }));

      // Set the nodes and edges
      setNodes(flowNodes);
      setEdges(flowEdges);

      // Switch to canvas view
      setActiveView('canvas');

      // Mark as loaded
      setWorkflowLoaded(true);
      onWorkflowLoaded?.();

      // Show success message
      setSuccessMessage(`Workflow "${initialWorkflow.name}" loaded! Follow the guided steps to get started.`);

      // Fit view after a short delay to ensure nodes are rendered
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2 });
      }, 100);
    }
  }, [initialWorkflow, workflowLoaded, onWorkflowLoaded, reactFlowInstance]);

  // Update nodes when board changes
  useEffect(() => {
    if (currentBoard) {
      const cards = (currentBoard.cards || []).map(card =>
        normalizeCardFromApi(card as unknown as Record<string, unknown>)
      );
      const flowNodes = cards.map(card => cardToNode(card, cardCallbacks));
      setNodes(flowNodes);
      setEdges([]);

      const viewport = currentBoard.viewportState || (currentBoard as unknown as { viewport?: { x: number; y: number; zoom: number } }).viewport;
      if (viewport && reactFlowInstance) {
        reactFlowInstance.setViewport({
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom,
        });
      }
    }
  }, [currentBoard, setNodes, setEdges, reactFlowInstance, cardCallbacks]);

  // Load boards
  const loadBoards = async () => {
    setLoading(true);
    try {
      const response = await creativeCanvasService.boards.list();
      if (response.success && response.data) {
        setBoards(response.data.boards);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
      setError('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  // Create new board
  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    setLoading(true);
    try {
      const request: CreateBoardRequest = {
        name: newBoardName,
        description: newBoardDescription,
        category: newBoardCategory,
      };

      const response = await creativeCanvasService.boards.create(request);
      if (response.success && response.data) {
        setBoards(prev => [...prev, response.data!]);
        setCurrentBoard(response.data);
        setActiveView('canvas');
        setCreateBoardDialogOpen(false);
        setNewBoardName('');
        setNewBoardDescription('');
        setSuccessMessage('Board created successfully!');
      } else {
        setError(response.error?.message || 'Failed to create board');
      }
    } catch (err) {
      console.error('Failed to create board:', err);
      setError('Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  // Open existing board
  const handleOpenBoard = async (boardId: string) => {
    setLoading(true);
    try {
      const response = await creativeCanvasService.boards.get(boardId);
      if (response.success && response.data) {
        setCurrentBoard(response.data);
        setActiveView('canvas');
      } else {
        setError(response.error?.message || 'Failed to load board');
      }
    } catch (err) {
      console.error('Failed to load board:', err);
      setError('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  // Delete board
  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board?')) return;

    setLoading(true);
    try {
      const response = await creativeCanvasService.boards.delete(boardId);
      if (response.success) {
        setBoards(prev => prev.filter(b => b.id !== boardId));
        if (currentBoard?.id === boardId) {
          setCurrentBoard(null);
          setActiveView('boards');
        }
        setSuccessMessage('Board deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete board:', err);
      setError('Failed to delete board');
    } finally {
      setLoading(false);
    }
  };

  // Generate sequential title for new cards
  const generateCardTitle = (template: CardTemplate): string => {
    if (!currentBoard) return template.name;
    const existingCards = currentBoard.cards || [];
    const sameTemplateCards = existingCards.filter(card => card.templateId === template.id);
    const nextNumber = sameTemplateCards.length + 1;
    return `${template.name} ${String(nextNumber).padStart(3, '0')}`;
  };

  // Add card from template
  const handleAddCard = async (template: CardTemplate, position?: { x: number; y: number }) => {
    if (!currentBoard) return;

    const dimensions = template.defaultDimensions || { width: 320, height: 400 };

    const getCardType = (): CardType => {
      if (template.type) return template.type;
      switch (template.category) {
        case 'fashion': return 'fashion-concept';
        case 'interior': return 'interior-room';
        case 'stock': return 'stock-photo';
        case 'story': return 'story-scene';
        default: return 'fashion-concept';
      }
    };

    const viewportCenter = reactFlowInstance.getViewport();
    const canvasPosition = position || {
      x: (-viewportCenter.x + window.innerWidth / 2) / viewportCenter.zoom - dimensions.width / 2,
      y: (-viewportCenter.y + window.innerHeight / 2) / viewportCenter.zoom - dimensions.height / 2,
    };

    setLoading(true);
    try {
      const basePrompt = (template as unknown as { basePrompt?: string }).basePrompt || template.defaultPrompt || '';
      const cardTitle = generateCardTitle(template);

      const request: CreateCardRequest = {
        type: getCardType(),
        templateId: template.id,
        position: canvasPosition,
        dimensions: dimensions,
        title: cardTitle,
        prompt: basePrompt,
        settings: template.defaultSettings,
        config: {
          basePrompt: basePrompt,
          enhancementAgents: template.defaultSettings?.enhancementAgents as string[] || ['fashion-prompt-enhancer'],
          generationParams: {
            model: template.defaultSettings?.imageModel as string || 'flux-2-pro',
            width: 1024,
            height: 1024,
            numImages: template.defaultSettings?.numVariations as number || 2,
          },
        },
      };

      const response = await creativeCanvasService.cards.create(currentBoard.id, request);
      if (response.success && response.data) {
        const newCard: CanvasCard = {
          ...response.data,
          prompt: response.data.prompt || basePrompt,
          title: response.data.title || cardTitle,
        };
        const newNode = cardToNode(newCard, cardCallbacks);
        setNodes(prev => [...prev, newNode]);

        setCurrentBoard(prev => {
          if (!prev) return null;
          const cards = prev.cards || [];
          return {
            ...prev,
            cards: [...cards, newCard],
          };
        });

        setTemplateBrowserOpen(false);
        setSuccessMessage('Card added successfully!');
      }
    } catch (err) {
      console.error('Failed to add card:', err);
      setError('Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  // Handle node drag stop - update position via API
  // All cards are backend entities - no local-only cards
  const onNodeDragStop = useCallback(async (_event: React.MouseEvent, node: Node) => {
    if (!currentBoard) return;

    try {
      await creativeCanvasService.cards.update(node.id, {
        position: { x: node.position.x, y: node.position.y },
      });

      setCurrentBoard(prev => {
        if (!prev) return null;
        const cards = prev.cards || [];
        return {
          ...prev,
          cards: cards.map(card =>
            card.id === node.id
              ? { ...card, position: { x: node.position.x, y: node.position.y } }
              : card
          ),
        };
      });
    } catch (err) {
      console.error('Failed to update card position:', err);
      // Position is still updated in React Flow state for immediate feedback
    }
  }, [currentBoard]);

  // Handle node selection - update both legacy selection and flow node selection for inspector
  const onSelectionChange = useCallback(({ nodes: selectedNodesList }: { nodes: Node[] }) => {
    setSelectedNodes(selectedNodesList.map(n => n.id));

    // Update selected flow node for the inspector panel
    if (selectedNodesList.length === 1) {
      const selectedNode = selectedNodesList[0];

      // Handle canvasNode type (FlowNode from palette)
      if (selectedNode.type === 'canvasNode' && selectedNode.data) {
        const nodeData = selectedNode.data as CanvasNodeData;
        // Ensure nodeType exists (required for inspector)
        if (nodeData.nodeType) {
          setSelectedFlowNode({
            id: selectedNode.id,
            data: nodeData,
          });
        } else {
          console.warn('Selected node missing nodeType:', selectedNode);
          setSelectedFlowNode(null);
        }
      }
      // Handle creativeCard and canvasCard types (card-based nodes)
      else if ((selectedNode.type === 'creativeCard' || selectedNode.type === 'canvasCard') && selectedNode.data) {
        const cardData = selectedNode.data as { card: CanvasCard };
        const card = cardData.card;

        if (card) {
          // Get template to determine node category and type
          const template = getTemplateById(card.templateId);

          // Convert card data to CanvasNodeData format for the inspector
          // Map card category to node category based on template type
          const nodeCategory = template?.category === 'fashion' ? 'composite' :
                              template?.category === 'interior' ? 'composite' :
                              template?.category === 'stock' ? 'imageGen' :
                              template?.category === 'story' ? 'composite' : 'composite';

          const convertedData: CanvasNodeData = {
            nodeType: card.type as unknown as NodeType, // Use card type as node type
            category: nodeCategory as CanvasNodeData['category'],
            label: card.title || template?.name || 'Untitled',
            parameters: {
              prompt: card.prompt || card.config?.basePrompt || '',
              style: card.config?.style || '',
              ...card.settings,
            },
            inputs: [], // Cards don't have typed ports like flow nodes
            outputs: [],
            status: card.workflow?.status === 'running' ? 'running' :
                    card.workflow?.status === 'completed' ? 'completed' :
                    card.workflow?.status === 'failed' ? 'error' : 'idle',
            progress: card.workflow?.stages?.reduce((acc, s) =>
              s.status === 'completed' ? acc + (100 / (card.workflow?.stages?.length || 1)) : acc, 0),
            result: card.generatedImages?.length ? {
              type: 'image',
              urls: card.generatedImages,
              url: card.generatedImages[0],
            } : undefined,
            error: card.workflow?.error,
          };

          setSelectedFlowNode({
            id: selectedNode.id,
            data: convertedData,
          });
        } else {
          setSelectedFlowNode(null);
        }
      } else {
        setSelectedFlowNode(null);
      }
    } else {
      setSelectedFlowNode(null);
    }
  }, []);

  // Handle delete key
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' && selectedNodes.length > 0) {
      handleDeleteSelectedCards();
    }
  }, [selectedNodes]);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Delete selected cards
  const handleDeleteSelectedCards = async () => {
    if (!currentBoard || selectedNodes.length === 0) return;

    try {
      await Promise.all(selectedNodes.map(id =>
        creativeCanvasService.cards.delete(id)
      ));

      setNodes(prev => prev.filter(n => !selectedNodes.includes(n.id)));
      setCurrentBoard(prev => {
        if (!prev) return null;
        const cards = prev.cards || [];
        return {
          ...prev,
          cards: cards.filter(c => !selectedNodes.includes(c.id)),
        };
      });
      setSelectedNodes([]);
      setSuccessMessage('Cards deleted successfully');
    } catch (err) {
      console.error('Failed to delete cards:', err);
      setError('Failed to delete cards');
    }
  };

  // Context menu
  const handleContextMenu = useCallback((event: React.MouseEvent, nodeId?: string) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId });
  }, []);

  // Save board viewport
  const saveViewport = useCallback(async () => {
    if (!currentBoard) return;

    const viewport = reactFlowInstance.getViewport();
    try {
      await creativeCanvasService.boards.update(currentBoard.id, {
        viewportState: {
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom,
        },
      });
    } catch (err) {
      console.error('Failed to save viewport:', err);
    }
  }, [currentBoard, reactFlowInstance]);

  // Auto-save viewport on change
  const onMoveEnd = useCallback(() => {
    saveViewport();
  }, [saveViewport]);

  // Handle drop from Node Palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Helper: Find node at position with a tolerance
  const findNodeAtPosition = useCallback((position: { x: number; y: number }, tolerance: number = 50): Node | null => {
    for (const node of nodes) {
      const nodeWidth = 200; // Approximate node width
      const nodeHeight = 100; // Approximate node height

      if (
        position.x >= node.position.x - tolerance &&
        position.x <= node.position.x + nodeWidth + tolerance &&
        position.y >= node.position.y - tolerance &&
        position.y <= node.position.y + nodeHeight + tolerance
      ) {
        return node;
      }
    }
    return null;
  }, [nodes]);

  // Helper: Check if two port types are compatible
  const arePortsCompatible = useCallback((outputType: string, inputType: string): boolean => {
    if (outputType === 'any' || inputType === 'any') return true;
    return outputType === inputType;
  }, []);

  // Helper: Find best connection between two nodes
  const findBestConnection = useCallback((
    sourceNode: Node,
    targetNode: Node
  ): { sourceHandle: string; targetHandle: string } | null => {
    const sourceData = sourceNode.data as CanvasNodeData | undefined;
    const targetData = targetNode.data as CanvasNodeData | undefined;

    if (!sourceData?.outputs || !targetData?.inputs) return null;

    // Find first compatible output → input pair
    for (const output of sourceData.outputs) {
      for (const input of targetData.inputs) {
        if (arePortsCompatible(output.type, input.type)) {
          return { sourceHandle: output.id, targetHandle: input.id };
        }
      }
    }
    return null;
  }, [arePortsCompatible]);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      // Check if it's a node drop from the palette
      const reactFlowType = event.dataTransfer.getData('application/reactflow');
      const nodeDataStr = event.dataTransfer.getData('nodeData');

      if (reactFlowType && nodeDataStr && canvasContainerRef.current && currentBoard) {
        const nodeData = JSON.parse(nodeDataStr) as CanvasNodeData;
        const bounds = canvasContainerRef.current.getBoundingClientRect();

        // Calculate position in canvas coordinates
        const dropPosition = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        // Check if dropping onto an existing node for auto-connect
        const targetNode = findNodeAtPosition(dropPosition);
        let finalPosition = dropPosition;
        let autoConnectEdge: Edge | null = null;

        // If dropped on a node, position the new node to the right and prepare auto-connect
        if (targetNode) {
          // Position new node to the right of target with spacing
          finalPosition = {
            x: targetNode.position.x + 250, // Node width + spacing
            y: targetNode.position.y,
          };
        }

        try {
          // Create card via API - all cards are backend entities from creation
          const request: CreateCardRequest = {
            type: nodeData.nodeType as CardType,
            templateId: nodeData.nodeType, // Use nodeType as templateId
            position: { x: finalPosition.x, y: finalPosition.y },
            dimensions: { width: 320, height: 400 },
            title: nodeData.label,
            config: {
              basePrompt: (nodeData.parameters?.prompt as string) || '',
              generationParams: {
                model: (nodeData.parameters?.model as string) || 'flux-2-pro',
                width: (nodeData.parameters?.width as number) || 1024,
                height: (nodeData.parameters?.height as number) || 1024,
                numImages: (nodeData.parameters?.numImages as number) || 4,
              },
            },
          };

          const response = await creativeCanvasService.cards.create(currentBoard.id, request);
          const newCard = normalizeCardFromApi(response.data as unknown as Record<string, unknown>);

          // Create React Flow node from the backend card
          // Explicitly set all required CanvasNodeData fields to ensure proper selection/inspection
          const newNode: Node<CanvasNodeData> = {
            id: newCard.id, // Use backend-generated ID
            type: 'canvasNode',
            position: { x: finalPosition.x, y: finalPosition.y },
            data: {
              nodeType: nodeData.nodeType,
              category: nodeData.category,
              label: newCard.title || nodeData.label,
              inputs: nodeData.inputs || [],
              outputs: nodeData.outputs || [],
              parameters: nodeData.parameters || {},
              status: 'idle' as const,
            },
          };

          // If we have a target node, try to create an auto-connect edge
          if (targetNode) {
            // Try target's output → new node's input (most common: drop processor on image source)
            const connectionFromTarget = findBestConnection(targetNode, newNode);
            if (connectionFromTarget) {
              autoConnectEdge = {
                id: `edge-${targetNode.id}-${newNode.id}`,
                source: targetNode.id,
                target: newNode.id,
                sourceHandle: connectionFromTarget.sourceHandle,
                targetHandle: connectionFromTarget.targetHandle,
                type: 'default',
              };
            } else {
              // Try new node's output → target's input (less common: drop source on processor)
              const connectionToTarget = findBestConnection(newNode, targetNode);
              if (connectionToTarget) {
                // Position new node to the LEFT of target instead
                newNode.position = {
                  x: targetNode.position.x - 250,
                  y: targetNode.position.y,
                };
                autoConnectEdge = {
                  id: `edge-${newNode.id}-${targetNode.id}`,
                  source: newNode.id,
                  target: targetNode.id,
                  sourceHandle: connectionToTarget.sourceHandle,
                  targetHandle: connectionToTarget.targetHandle,
                  type: 'default',
                };
              }
            }
          }

          // Add the new node
          setNodes((nds) => [...nds, newNode]);

          // Add auto-connect edge if applicable
          if (autoConnectEdge) {
            setEdges((eds) => [...eds, autoConnectEdge!]);
            setSuccessMessage(`Added ${nodeData.label} and connected to ${(targetNode?.data as CanvasNodeData)?.label || 'node'}`);
          } else {
            setSuccessMessage(`Added ${nodeData.label} node`);
          }

          // Update board state with new card
          setCurrentBoard(prev => prev ? {
            ...prev,
            cards: [...(prev.cards || []), newCard],
          } : null);

        } catch (err) {
          console.error('Failed to create card:', err);
          setError(`Failed to add ${nodeData.label} node`);
        }
      }

      // Check if it's a swatch drop
      const swatchDataStr = event.dataTransfer.getData('application/swatch');
      if (swatchDataStr) {
        const swatchData = JSON.parse(swatchDataStr);
        const keywords = swatchData.promptKeywords || [];
        const itemName = swatchData.item?.name || 'Unknown';

        // If there's a selected flow node, apply to it
        if (selectedFlowNode) {
          // Get current prompt from parameters
          const currentPrompt = (selectedFlowNode.data.parameters?.prompt as string) || '';
          const keywordStr = keywords.length > 0 ? keywords.join(', ') : itemName;
          const newPrompt = currentPrompt ? `${currentPrompt}, ${keywordStr}` : keywordStr;

          // Update via API
          try {
            await creativeCanvasService.cards.update(selectedFlowNode.id, {
              prompt: newPrompt,
              config: { basePrompt: newPrompt },
            });
          } catch (err) {
            console.error('Failed to update card prompt:', err);
          }

          // Update the node's prompt parameter locally for immediate feedback
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === selectedFlowNode.id && node.data) {
                const nodeData = node.data as CanvasNodeData;
                return {
                  ...node,
                  data: {
                    ...nodeData,
                    parameters: {
                      ...nodeData.parameters,
                      prompt: newPrompt,
                    },
                  },
                };
              }
              return node;
            })
          );

          // Update selectedFlowNode state
          setSelectedFlowNode((prev) =>
            prev
              ? {
                  ...prev,
                  data: {
                    ...prev.data,
                    parameters: {
                      ...prev.data.parameters,
                      prompt: newPrompt,
                    },
                  },
                }
              : null
          );

          setSuccessMessage(`Applied "${itemName}" to node prompt`);
        } else {
          // No node selected - show hint
          setSuccessMessage(`Swatch "${itemName}" - select a node first to apply`);
        }
      }
    },
    [reactFlowInstance, setNodes, setEdges, selectedFlowNode, currentBoard, findNodeAtPosition, findBestConnection]
  );

  // Handle parameter change from inspector
  const handleParameterChange = useCallback(
    (nodeId: string, paramId: string, value: unknown) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId && node.data) {
            const nodeData = node.data as CanvasNodeData;
            return {
              ...node,
              data: {
                ...nodeData,
                parameters: {
                  ...nodeData.parameters,
                  [paramId]: value,
                },
              },
            };
          }
          return node;
        })
      );

      // Update selectedFlowNode if it's the same node
      if (selectedFlowNode && selectedFlowNode.id === nodeId) {
        setSelectedFlowNode((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  parameters: {
                    ...prev.data.parameters,
                    [paramId]: value,
                  },
                },
              }
            : null
        );
      }
    },
    [setNodes, selectedFlowNode]
  );

  // Handle node execution from inspector
  const handleNodeExecute = useCallback(async (nodeId: string) => {
    if (!currentBoard) return;

    // Update node status to running
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId && node.data) {
          const nodeData = node.data as CanvasNodeData;
          return {
            ...node,
            data: {
              ...nodeData,
              status: 'running' as const,
              progress: 0,
            },
          };
        }
        return node;
      })
    );

    try {
      // Get current node data for execution parameters
      const currentNode = nodes.find(n => n.id === nodeId);
      const nodeData = currentNode?.data as CanvasNodeData | undefined;

      // Execute workflow via API
      await creativeCanvasService.cards.executeWorkflow(nodeId, {
        stageOverrides: {
          stage_3: {
            generationParams: {
              model: (nodeData?.parameters?.model as string) || 'flux-2-pro',
            },
          },
        },
      });

      setSuccessMessage(`Executing ${nodeData?.label || 'node'}...`);

      // Poll for status
      const pollStatus = async () => {
        try {
          const statusResponse = await creativeCanvasService.cards.getWorkflowStatus(nodeId);
          const status = statusResponse.data;

          if (!status) {
            // No status data, continue polling
            setTimeout(pollStatus, 2000);
            return;
          }

          // Update node progress
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === nodeId && node.data) {
                const nodeDataLocal = node.data as CanvasNodeData;
                return {
                  ...node,
                  data: {
                    ...nodeDataLocal,
                    status: status.status === 'completed' ? 'completed' :
                            status.status === 'failed' ? 'error' : 'running',
                    progress: status.progress || 0,
                    error: status.status === 'failed' ? (status.errorMessage || 'Execution failed') : undefined,
                  },
                };
              }
              return node;
            })
          );

          if (status.status === 'completed') {
            // Refresh board to get updated card with generated assets
            const boardResponse = await creativeCanvasService.boards.get(currentBoard.id);
            if (boardResponse.data) {
              setCurrentBoard(boardResponse.data);
            }
            setSuccessMessage(`${nodeData?.label || 'Node'} completed!`);
          } else if (status.status === 'failed') {
            setError(status.errorMessage || 'Workflow execution failed');
          } else if (status.status === 'processing' || status.status === 'pending') {
            // Continue polling
            setTimeout(pollStatus, 2000);
          }
        } catch (pollErr) {
          console.error('Failed to poll status:', pollErr);
          // Continue polling on error (might be temporary)
          setTimeout(pollStatus, 3000);
        }
      };

      // Start polling after a short delay
      setTimeout(pollStatus, 1000);

    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setError('Failed to start execution');

      // Update node status to error
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId && node.data) {
            const nodeData = node.data as CanvasNodeData;
            return {
              ...node,
              data: {
                ...nodeData,
                status: 'error' as const,
                error: 'Failed to start execution',
              },
            };
          }
          return node;
        })
      );
    }
  }, [currentBoard, nodes, setNodes]);

  // Handle node delete from inspector
  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedFlowNode(null);
      setSuccessMessage('Node deleted');
    },
    [setNodes, setEdges]
  );

  // Handle node duplicate from inspector
  const handleNodeDuplicate = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
      if (nodeToDuplicate) {
        const newNode: Node = {
          ...nodeToDuplicate,
          id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          position: {
            x: nodeToDuplicate.position.x + 50,
            y: nodeToDuplicate.position.y + 50,
          },
        };
        setNodes((nds) => [...nds, newNode]);
        setSuccessMessage('Node duplicated');
      }
    },
    [nodes, setNodes]
  );

  // Handle style selection from CreativePalette (Phase 3)
  const handleStyleSelect = useCallback(
    (styleId: string, keywords: string[]) => {
      // If there's a selected node, apply style keywords to its prompt
      if (selectedFlowNode) {
        const currentPrompt = (selectedFlowNode.data.parameters?.prompt as string) || '';
        const keywordStr = keywords.join(', ');
        const newPrompt = currentPrompt ? `${currentPrompt}, ${keywordStr}` : keywordStr;

        // Update node parameters
        handleParameterChange(selectedFlowNode.id, 'prompt', newPrompt);
        setSuccessMessage(`Applied style "${styleId}" to node prompt`);
      } else {
        setSuccessMessage(`Style "${styleId}" - select a node first to apply`);
      }
    },
    [selectedFlowNode, handleParameterChange]
  );

  // Handle color palette selection from CreativePalette (Phase 3)
  const handleColorPaletteSelect = useCallback(
    (paletteId: string, colors: string[]) => {
      // Store the selected palette for use in generation
      // For now, just show a message - in production this would affect generation params
      console.log('Color palette selected:', paletteId, colors);
      setSuccessMessage(`Selected color palette: ${paletteId}`);
    },
    []
  );

  // Handle asset selection from CreativePalette (Phase 3)
  const handleAssetSelect = useCallback(
    (_assetId: string, assetType: string, url: string) => {
      // If there's a selected node, apply asset to appropriate input
      if (selectedFlowNode) {
        // Determine which parameter to update based on asset type
        const paramId = assetType === 'image' ? 'image' :
                        assetType === 'video' ? 'video' :
                        assetType === 'audio' ? 'audio' : 'input';

        handleParameterChange(selectedFlowNode.id, paramId, url);
        setSuccessMessage(`Applied ${assetType} asset to node`);
      } else {
        setSuccessMessage(`Asset selected - select a node first to apply`);
      }
    },
    [selectedFlowNode, handleParameterChange]
  );

  // Render toolbar
  const renderToolbar = () => (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 2,
        zIndex: 10,
      }}
    >
      <Tooltip title="Back to boards">
        <IconButton onClick={() => setActiveView('boards')} size="small">
          <BackIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Typography variant="subtitle1" sx={{ mx: 1, fontWeight: 600 }}>
        {currentBoard?.name || 'Untitled Board'}
      </Typography>

      <Chip
        size="small"
        label={currentBoard?.category ? CATEGORY_INFO[currentBoard.category].name : ''}
        sx={{
          bgcolor: currentBoard?.category ? CATEGORY_INFO[currentBoard.category].color : undefined,
          color: 'white',
        }}
      />

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Add Card">
        <IconButton onClick={() => setTemplateBrowserOpen(true)} color="primary">
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Toggle Grid">
        <IconButton onClick={() => setGridEnabled(!gridEnabled)} color={gridEnabled ? 'primary' : 'default'}>
          <GridIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Fit View">
        <IconButton onClick={() => reactFlowInstance.fitView()}>
          <FitViewIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Save">
        <IconButton onClick={saveViewport}>
          <SaveIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Export">
        <IconButton>
          <ExportIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Share">
        <IconButton>
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title={nodePaletteOpen ? 'Hide Node Palette' : 'Show Node Palette'}>
        <IconButton
          onClick={() => setNodePaletteOpen(!nodePaletteOpen)}
          color={nodePaletteOpen ? 'primary' : 'default'}
        >
          {nodePaletteOpen ? <ChevronLeftIcon /> : <PaletteIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title={nodeInspectorOpen ? 'Hide Inspector' : 'Show Inspector'}>
        <IconButton
          onClick={() => setNodeInspectorOpen(!nodeInspectorOpen)}
          color={nodeInspectorOpen ? 'primary' : 'default'}
        >
          {nodeInspectorOpen ? <ChevronRightIcon /> : <TuneIcon />}
        </IconButton>
      </Tooltip>
    </Paper>
  );

  // Render speed dial for quick actions
  const renderSpeedDial = () => (
    <SpeedDial
      ariaLabel="Quick actions"
      sx={{ position: 'absolute', bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
    >
      <SpeedDialAction
        icon={<AddIcon />}
        tooltipTitle="Add Card"
        onClick={() => setTemplateBrowserOpen(true)}
      />
      <SpeedDialAction
        icon={<LibraryIcon />}
        tooltipTitle="Asset Library"
        onClick={() => setActiveView('library')}
      />
      <SpeedDialAction
        icon={<MarketplaceIcon />}
        tooltipTitle="Marketplace"
        onClick={() => setActiveView('marketplace')}
      />
    </SpeedDial>
  );

  // Render canvas view
  const renderCanvasView = () => (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
      {/* Left Sidebar - Creative Palette v3 */}
      {nodePaletteOpen && (
        <CreativePalette
          onStyleSelect={handleStyleSelect}
          onColorPaletteSelect={handleColorPaletteSelect}
          onAssetSelect={handleAssetSelect}
          width={280}
        />
      )}

      {/* Main Canvas Area */}
      <Box
        ref={canvasContainerRef}
        sx={{ flex: 1, height: '100%', position: 'relative' }}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {renderToolbar()}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          onMoveEnd={onMoveEnd}
          onContextMenu={(e) => handleContextMenu(e)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          isValidConnection={isValidConnection}
          snapToGrid={snapToGrid}
          snapGrid={[20, 20]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={4}
          fitView
          proOptions={{ hideAttribution: true }}
          connectOnClick={false}
        >
          {gridEnabled && (
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={theme.palette.mode === 'dark' ? '#333' : '#ddd'}
            />
          )}
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              // Handle both canvasCard and flow nodes
              if (node.data && 'card' in node.data) {
                const card = (node.data as { card: CanvasCard }).card;
                const template = getTemplateById(card.templateId);
                return template?.color || '#888';
              }
              // For flow nodes, use category color
              if (node.data && 'category' in node.data) {
                const category = (node.data as CanvasNodeData).category;
                const categoryConfig = {
                  input: '#22c55e',
                  imageGen: '#3b82f6',
                  videoGen: '#8b5cf6',
                  threeD: '#f97316',
                  character: '#ec4899',
                  style: '#06b6d4',
                  composite: '#6366f1',
                  output: '#ef4444',
                };
                return categoryConfig[category as keyof typeof categoryConfig] || '#888';
              }
              return '#888';
            }}
            maskColor={theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
          />
        </ReactFlow>

        {renderSpeedDial()}
      </Box>

      {/* Right Sidebar - Node Inspector */}
      {nodeInspectorOpen && (
        <NodeInspector
          node={selectedFlowNode}
          onParameterChange={handleParameterChange}
          onExecute={handleNodeExecute}
          onDelete={handleNodeDelete}
          onDuplicate={handleNodeDuplicate}
          onClose={() => setNodeInspectorOpen(false)}
          width={320}
        />
      )}

      {/* Connection Action Menu - "Moments of Delight" */}
      {connectionMenuState && currentBoard && (() => {
        const sourceNode = nodes.find(n => n.id === connectionMenuState.sourceCardId);
        const targetNode = nodes.find(n => n.id === connectionMenuState.targetCardId);
        if (!sourceNode || !targetNode) return null;

        const sourceCard = (sourceNode.data as { card: CanvasCard }).card;
        const targetCard = (targetNode.data as { card: CanvasCard }).card;

        return (
          <ConnectionActionMenu
            position={connectionMenuState.position}
            sourceCard={sourceCard}
            targetCard={targetCard}
            category={currentBoard.category}
            onSelectAction={handleConnectionAction}
            onClose={handleCloseConnectionMenu}
            isProcessing={connectionProcessing}
          />
        );
      })()}

      {/* Template Browser Drawer */}
      <Drawer
        anchor="right"
        open={templateBrowserOpen}
        onClose={() => setTemplateBrowserOpen(false)}
      >
        <TemplateBrowser
          category={currentBoard?.category || null}
          onSelectTemplate={handleAddCard}
          onClose={() => setTemplateBrowserOpen(false)}
        />
      </Drawer>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined
        }
      >
        <MenuItem onClick={() => { setTemplateBrowserOpen(true); setContextMenu(null); }}>
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText>Add Card Here</ListItemText>
        </MenuItem>
        {contextMenu?.nodeId && (
          <>
            <Divider />
            <MenuItem onClick={() => setContextMenu(null)}>
              <ListItemIcon><DuplicateIcon /></ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => setContextMenu(null)}>
              <ListItemIcon><LockIcon /></ListItemIcon>
              <ListItemText>Lock/Unlock</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleDeleteSelectedCards(); setContextMenu(null); }}>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );

  // Render boards view
  const renderBoardsView = () => (
    <BoardManager
      boards={boards}
      loading={loading}
      onCreateBoard={() => setCreateBoardDialogOpen(true)}
      onOpenBoard={handleOpenBoard}
      onDeleteBoard={handleDeleteBoard}
      onDuplicateBoard={async (boardId) => {
        try {
          const response = await creativeCanvasService.boards.duplicate(boardId, {
            includeCards: true,
            includeAssets: true,
          });
          if (response.success && response.data) {
            setBoards(prev => [...prev, response.data!]);
            setSuccessMessage('Board duplicated successfully');
          }
        } catch (err) {
          setError('Failed to duplicate board');
        }
      }}
    />
  );

  // Render library view placeholder
  const renderLibraryView = () => (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Asset Library</Typography>
      <Typography color="text.secondary">Coming soon...</Typography>
      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setActiveView(currentBoard ? 'canvas' : 'boards')}>
        Go Back
      </Button>
    </Box>
  );

  // Render marketplace view placeholder
  const renderMarketplaceView = () => (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Marketplace</Typography>
      <Typography color="text.secondary">Coming soon...</Typography>
      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setActiveView(currentBoard ? 'canvas' : 'boards')}>
        Go Back
      </Button>
    </Box>
  );

  // Main render
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon color="primary" />
            Creative Canvas
          </Typography>

          <Divider orientation="vertical" flexItem />

          <Tabs
            value={activeView}
            onChange={(_, value) => setActiveView(value)}
            sx={{ minHeight: 40 }}
          >
            <Tab
              value="boards"
              label="My Boards"
              icon={<BoardsIcon />}
              iconPosition="start"
              sx={{ minHeight: 40, py: 0 }}
            />
            <Tab
              value="canvas"
              label="Canvas"
              icon={<LayersIcon />}
              iconPosition="start"
              sx={{ minHeight: 40, py: 0 }}
              disabled={!currentBoard}
            />
            <Tab
              value="library"
              label="Library"
              icon={<LibraryIcon />}
              iconPosition="start"
              sx={{ minHeight: 40, py: 0 }}
            />
            <Tab
              value="marketplace"
              label="Marketplace"
              icon={<MarketplaceIcon />}
              iconPosition="start"
              sx={{ minHeight: 40, py: 0 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeView === 'canvas' && currentBoard && renderCanvasView()}
        {activeView === 'boards' && renderBoardsView()}
        {activeView === 'library' && renderLibraryView()}
        {activeView === 'marketplace' && renderMarketplaceView()}
      </Box>

      {/* Create Board Dialog */}
      <Dialog open={createBoardDialogOpen} onClose={() => setCreateBoardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Board</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Board Name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Description (optional)"
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Category
              </Typography>
              <Grid container spacing={1}>
                {(Object.entries(CATEGORY_INFO) as [CardCategory, typeof CATEGORY_INFO[CardCategory]][]).map(([key, info]) => (
                  <Grid size={{ xs: 6 }} key={key}>
                    <Card
                      variant={newBoardCategory === key ? 'elevation' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        border: newBoardCategory === key ? `2px solid ${info.color}` : undefined,
                        '&:hover': { borderColor: info.color },
                      }}
                      onClick={() => setNewBoardCategory(key)}
                    >
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: info.color, width: 32, height: 32 }}>
                            {key === 'fashion' ? <FashionIcon fontSize="small" /> :
                             key === 'interior' ? <InteriorIcon fontSize="small" /> :
                             key === 'stock' ? <StockIcon fontSize="small" /> :
                             <StoryIcon fontSize="small" />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{info.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                              {info.description.substring(0, 40)}...
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBoardDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateBoard}
            disabled={!newBoardName.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Board'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Creative Collaborators (Agents) - Elevated Vision v3.0 */}
      <AgentPresence
        onOpenPanel={(agentId) => {
          if (agentId) setActiveAgentId(agentId);
          setAgentPanelOpen(true);
        }}
        onAction={(message, actionId) => {
          console.log('Agent action:', message.agentId, actionId);
        }}
      />

      <AgentPanel
        open={agentPanelOpen}
        onClose={() => setAgentPanelOpen(false)}
        initialAgent={activeAgentId}
        width={380}
      />
    </Box>
  );
};

// Wrapper component with ReactFlowProvider
export const CreativeCanvasStudio: React.FC<CreativeCanvasStudioProps> = ({
  initialWorkflow,
  onWorkflowLoaded,
  userPersona,
}) => {
  return (
    <WorkflowContext.Provider value={{ initialWorkflow, onWorkflowLoaded, userPersona }}>
      <ReactFlowProvider>
        <CreativeCanvasInner />
      </ReactFlowProvider>
    </WorkflowContext.Provider>
  );
};

export default CreativeCanvasStudio;
