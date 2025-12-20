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
  // Common node quick-add icons
  TextFields as TextInputIcon,
  Image as ImageUploadIcon,
  Collections as ReferenceImageIcon,
  AutoAwesome as PromptEnhanceIcon,
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
import type { CanvasNodeData, NodeType, Port, PortType, NodeResult } from '../../models/canvas';
import {
  CATEGORY_INFO,
  normalizeCardFromApi,
  getTemplateById,
} from '../../models/creativeCanvas';
import creativeCanvasService from '../../services/creativeCanvasService';
import connectionActionService from '../../services/connectionActionService';
import { fashionService, type TryOnProvider, type TryOnCategory } from '../../services/virtualTryOnService';
import { storyGenerationService, type StoryGenre, type StoryTone, type POV, type TargetLength, type Audience, type StoryFramework, type SceneFormat, type SceneType, type SceneLength, type TwistType, type CharacterArchetype, type CharacterRole, type LocationType, type DialogueType } from '../../services/storyGenerationService';
// Unified Node System v3.1 - Backend-persisted nodes with typed ports
import { nodeService, type NodePort } from '../../services/nodeService';
import { edgeService, apiEdgeToFlowEdge } from '../../services/edgeService';
import { DomainToolbar } from './DomainToolbar';
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
// Fashion nodes - Phase 2 (Dec 2025)
import { CulturalTextileFusionNode } from '../nodes/CulturalTextileFusionNode';
import { ColorwayGeneratorNode } from '../nodes/ColorwayGeneratorNode';
import { PoseLibraryNode } from '../nodes/PoseLibraryNode';
import { SizeScalerNode } from '../nodes/SizeScalerNode';
import { LayeringStylistNode } from '../nodes/LayeringStylistNode';
import { GhostMannequinNode } from '../nodes/GhostMannequinNode';
import { TurnaroundVideoNode } from '../nodes/TurnaroundVideoNode';
import { LineSheetGeneratorNode } from '../nodes/LineSheetGeneratorNode';
// Fashion nodes - Composite/Try-On (Dec 2025)
import { VirtualTryOnNode } from '../nodes/VirtualTryOnNode';
import { ClothesSwapNode } from '../nodes/ClothesSwapNode';
import { RunwayAnimationNode } from '../nodes/RunwayAnimationNode';
// Input nodes (Dec 2025)
import { ReferenceImageNode } from '../nodes/ReferenceImageNode';
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
import { nodeDefinitions, getNodeDefinition } from '../../config/nodeDefinitions';
import { canvasTokens, categoryColors, darkNeutrals, brandColors, creativeCardTokens } from '../../theme';

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
  // Fashion nodes - Phase 2 (Dec 2025)
  culturalTextileFusion: CulturalTextileFusionNode as any,
  colorwayGenerator: ColorwayGeneratorNode as any,
  poseLibrary: PoseLibraryNode as any,
  sizeScaler: SizeScalerNode as any,
  layeringStylist: LayeringStylistNode as any,
  ghostMannequin: GhostMannequinNode as any,
  turnaroundVideo: TurnaroundVideoNode as any,
  lineSheetGenerator: LineSheetGeneratorNode as any,
  // Fashion nodes - Composite/Try-On (Dec 2025)
  virtualTryOn: VirtualTryOnNode as any,
  clothesSwap: ClothesSwapNode as any,
  runwayAnimation: RunwayAnimationNode as any,
  // Input nodes (Dec 2025)
  referenceImage: ReferenceImageNode as any,
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

  // === UNIFIED NODE SYSTEM v3.1 ===
  // Handle connection between nodes - validates port compatibility, persists to backend, and opens "Moments of Delight" menu
  const onConnect = useCallback(async (connection: Connection) => {
    if (!connection.source || !connection.target || !currentBoard) return;
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

    try {
      // Create edge via backend API with port-level connection
      const edgeResponse = await edgeService.create(currentBoard.id, {
        sourceNodeId: connection.source,
        sourcePortId: connection.sourceHandle || undefined,
        targetNodeId: connection.target,
        targetPortId: connection.targetHandle || undefined,
        edgeType: validation.sourcePort && validation.targetPort
          ? (validation.sourcePort.type === 'style' || validation.targetPort.type === 'style' ? 'style' : 'default')
          : 'default',
      });

      if (edgeResponse.success && edgeResponse.edge) {
        // Add the persisted edge to React Flow
        const flowEdge = apiEdgeToFlowEdge(edgeResponse.edge);
        setEdges((eds) => [...eds, flowEdge]);
      } else {
        // Fallback: add edge locally even if backend fails
        const edgeStyle = validation.sourcePort && validation.targetPort
          ? getEdgeStyle(validation.sourcePort.type, validation.targetPort.type)
          : { stroke: '#9c27b0', strokeWidth: 2 };

        setEdges((eds) => addEdge({
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: edgeStyle,
        }, eds));
      }

      // Open the connection action menu for "Moments of Delight"
      // Show for any node type that has generated images
      const sourceData = sourceNode.data as CanvasNodeData;
      const targetData = targetNode.data as CanvasNodeData;
      const sourceCached = sourceData?.cachedOutput as Record<string, unknown> | undefined;
      const targetCached = targetData?.cachedOutput as Record<string, unknown> | undefined;
      const sourceHasImages = sourceCached?.images || sourceData?.result?.urls;
      const targetHasImages = targetCached?.images || targetData?.result?.urls;

      if (sourceHasImages && targetHasImages) {
        setConnectionMenuState({
          isOpen: true,
          position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          sourceCardId: connection.source,
          targetCardId: connection.target,
        });
      }
    } catch (err) {
      console.error('Failed to create edge:', err);
      // Still add edge locally for immediate feedback
      const edgeStyle = validation.sourcePort && validation.targetPort
        ? getEdgeStyle(validation.sourcePort.type, validation.targetPort.type)
        : { stroke: '#9c27b0', strokeWidth: 2 };

      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: edgeStyle,
      }, eds));
    }
  }, [nodes, edges, setEdges, currentBoard]);

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

  // === UNIFIED NODE SYSTEM v3.1 ===
  // Handle node delete from child node or inspector
  // Supports both new nodes (v3.1+) and legacy cards (pre-v3.1)
  const handleCardDelete = useCallback(async (nodeId: string) => {
    try {
      // Try to delete via new node API first
      await nodeService.delete(nodeId);
    } catch (err: unknown) {
      // If 404, try legacy card API for backward compatibility
      const axiosError = err as { response?: { status?: number } };
      if (axiosError?.response?.status === 404) {
        try {
          await creativeCanvasService.cards.delete(nodeId);
        } catch {
          // Ignore - node may not exist in either system
        }
      }
    }
    // Remove from React Flow state regardless of backend result
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSuccessMessage('Node deleted successfully');
  }, [setNodes, setEdges]);

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

        // Use specialized node component if registered, otherwise fallback to generic canvasNode
        const registeredType = workflowNode.nodeType in nodeTypes ? workflowNode.nodeType : 'canvasNode';
        return {
          id: workflowNode.id,
          type: registeredType,
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

  // === UNIFIED NODE SYSTEM v3.1 ===
  // Load nodes and edges from backend when board changes
  useEffect(() => {
    const loadBoardContent = async () => {
      if (!currentBoard) return;

      try {
        // Fetch nodes and edges from backend in parallel
        const [nodesResponse, edgesResponse] = await Promise.all([
          nodeService.list(currentBoard.id),
          edgeService.list(currentBoard.id),
        ]);

        // Convert backend nodes to React Flow nodes
        if (nodesResponse.success && nodesResponse.nodes) {
          const flowNodes: Node[] = nodesResponse.nodes.map((apiNode) => {
            // Use specialized node component if registered, otherwise fallback to canvasNode
            const registeredNodeType = apiNode.nodeType in nodeTypes ? apiNode.nodeType : 'canvasNode';
            return {
              id: apiNode.id,
              type: registeredNodeType,
              position: apiNode.position,
              data: {
                nodeType: apiNode.nodeType,
                category: apiNode.category,
                label: apiNode.label,
                inputs: apiNode.inputs || [],
                outputs: apiNode.outputs || [],
                parameters: apiNode.parameters || {},
                status: apiNode.status || 'idle',
                cachedOutput: apiNode.cachedOutput,
              } as CanvasNodeData,
              width: apiNode.dimensions?.width,
              height: apiNode.dimensions?.height,
            };
          });
          setNodes(flowNodes);
        } else {
          // Fallback to legacy card system for backward compatibility
          const cards = (currentBoard.cards || []).map(card =>
            normalizeCardFromApi(card as unknown as Record<string, unknown>)
          );
          const flowNodes = cards.map(card => cardToNode(card, cardCallbacks));
          setNodes(flowNodes);
        }

        // Convert backend edges to React Flow edges
        if (edgesResponse.success && edgesResponse.edges) {
          const flowEdges: Edge[] = edgesResponse.edges.map(apiEdgeToFlowEdge);
          setEdges(flowEdges);
        } else {
          setEdges([]);
        }

        // Restore viewport
        const viewport = currentBoard.viewportState || (currentBoard as unknown as { viewport?: { x: number; y: number; zoom: number } }).viewport;
        if (viewport && reactFlowInstance) {
          reactFlowInstance.setViewport({
            x: viewport.x,
            y: viewport.y,
            zoom: viewport.zoom,
          });
        }
      } catch (err) {
        console.error('Failed to load board content:', err);
        // Fallback to legacy card system
        const cards = (currentBoard.cards || []).map(card =>
          normalizeCardFromApi(card as unknown as Record<string, unknown>)
        );
        const flowNodes = cards.map(card => cardToNode(card, cardCallbacks));
        setNodes(flowNodes);
        setEdges([]);
      }
    };

    loadBoardContent();
  }, [currentBoard, setNodes, setEdges, reactFlowInstance, cardCallbacks]);

  // === PORT DOUBLE-CLICK: Auto-add Input Node ===
  // Map port types to appropriate input node types
  const getInputNodeTypeForPort = useCallback((portType: PortType): string => {
    switch (portType) {
      case 'image':
        return 'imageUpload';
      case 'video':
        return 'videoUpload';
      case 'audio':
        return 'audioUpload';
      case 'text':
        return 'textInput';
      case 'garment':
        return 'imageUpload'; // Garments are images
      case 'model':
        return 'imageUpload'; // Model photos are images
      case 'fabric':
        return 'imageUpload';
      case 'pattern':
        return 'imageUpload';
      case 'character':
        return 'characterCreator';
      case 'story':
        return 'storyGenesis';
      case 'scene':
        return 'sceneGenerator';
      case 'location':
        return 'locationCreator';
      case 'dialogue':
        return 'dialogueGenerator';
      default:
        return 'textInput'; // Default fallback
    }
  }, []);

  // Handle double-click on input port to add appropriate input node
  const handlePortDoubleClick = useCallback(async (nodeId: string, portId: string, portType: PortType) => {
    if (!currentBoard) return;

    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    const inputNodeType = getInputNodeTypeForPort(portType);
    const inputDef = getNodeDefinition(inputNodeType);
    if (!inputDef) {
      console.warn(`No definition found for input node type: ${inputNodeType}`);
      return;
    }

    // Position the new node to the left of the target node
    const newPosition = {
      x: targetNode.position.x - 300,
      y: targetNode.position.y,
    };

    try {
      // Create the input node via API
      const apiInputs: NodePort[] = (inputDef.inputs || []).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        required: p.required ?? false,
        multi: false,
      }));
      const apiOutputs: NodePort[] = (inputDef.outputs || []).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        required: p.required ?? false,
        multi: false,
      }));

      const nodeResponse = await nodeService.create(currentBoard.id, {
        nodeType: inputDef.type,
        label: inputDef.label,
        category: inputDef.category,
        position: newPosition,
        dimensions: { width: 280, height: 350 },
        inputs: apiInputs,
        outputs: apiOutputs,
        parameters: inputDef.parameters.reduce<Record<string, unknown>>(
          (acc, param) => ({ ...acc, [param.id]: param.default }),
          {}
        ),
      });

      if (!nodeResponse.success || !nodeResponse.node) {
        throw new Error('Failed to create input node');
      }

      const newApiNode = nodeResponse.node;
      const registeredNodeType = newApiNode.nodeType in nodeTypes ? newApiNode.nodeType : 'canvasNode';

      const newNode: Node<CanvasNodeData> = {
        id: newApiNode.id,
        type: registeredNodeType,
        position: newApiNode.position,
        data: {
          nodeType: newApiNode.nodeType as NodeType,
          category: newApiNode.category as CanvasNodeData['category'],
          label: newApiNode.label,
          inputs: inputDef.inputs || [],
          outputs: inputDef.outputs || [],
          parameters: newApiNode.parameters || {},
          status: 'idle',
        },
        width: newApiNode.dimensions?.width,
        height: newApiNode.dimensions?.height,
      };

      // Find the output port from the new node that matches the target port type
      const outputPort = inputDef.outputs?.find(p => p.type === portType || p.type === 'image' || p.type === 'any');
      if (!outputPort) {
        console.warn('No compatible output port found on input node');
        setNodes(nds => [...nds, newNode]);
        return;
      }

      // Create the edge via API
      const edgeResponse = await edgeService.create(currentBoard.id, {
        sourceNodeId: newApiNode.id,
        sourcePortId: outputPort.id,
        targetNodeId: nodeId,
        targetPortId: portId,
        edgeType: 'default',
      });

      if (edgeResponse.success && edgeResponse.edge) {
        const newEdge = apiEdgeToFlowEdge(edgeResponse.edge);
        setNodes(nds => [...nds, newNode]);
        setEdges(eds => [...eds, newEdge]);
        setSuccessMessage(`Added ${inputDef.label} input node`);
      } else {
        // Still add the node even if edge creation failed
        setNodes(nds => [...nds, newNode]);
        setSuccessMessage(`Added ${inputDef.label} (connection pending)`);
      }
    } catch (err) {
      console.error('Failed to create input node:', err);
      setError('Failed to add input node');
    }
  }, [currentBoard, nodes, setNodes, setEdges, getInputNodeTypeForPort]);

  // Register the port double-click handler globally
  useEffect(() => {
    window.onPortDoubleClick = handlePortDoubleClick;
    return () => {
      delete window.onPortDoubleClick;
    };
  }, [handlePortDoubleClick]);

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

  // === UNIFIED NODE SYSTEM v3.1 ===
  // Handle node drag stop - update position via batch endpoint (includes boardId for ownership)
  // Note: During migration, legacy cards (created before v3.1) will 404 on the node endpoint.
  // This is expected - position updates locally, just doesn't persist for legacy nodes.
  const onNodeDragStop = useCallback(async (_event: React.MouseEvent, node: Node) => {
    if (!currentBoard) return;

    try {
      // Use batch endpoint - includes boardId for proper ownership verification
      await nodeService.batchUpdate(currentBoard.id, {
        updates: [{
          nodeId: node.id,
          position: { x: node.position.x, y: node.position.y },
        }],
      });
      // Position is already updated in React Flow state - no need to update local state
    } catch (err: unknown) {
      // Silently ignore 404s for legacy nodes created before v3.1 migration
      const axiosError = err as { response?: { status?: number } };
      if (axiosError?.response?.status !== 404) {
        console.error('Failed to update node position:', err);
      }
      // Position is still updated in React Flow state for immediate feedback
    }
  }, [currentBoard]);

  // Handle node selection - update both legacy selection and flow node selection for inspector
  const onSelectionChange = useCallback(({ nodes: selectedNodesList }: { nodes: Node[] }) => {
    setSelectedNodes(selectedNodesList.map(n => n.id));

    // Update selected flow node for the inspector panel
    if (selectedNodesList.length === 1) {
      const selectedNode = selectedNodesList[0];

      // Handle canvasNode type and specialized node types (FlowNode from palette)
      // Check if it has CanvasNodeData structure (has nodeType property)
      if (selectedNode.data && (selectedNode.data as CanvasNodeData).nodeType) {
        const nodeData = selectedNode.data as CanvasNodeData;
        // Get definition to ensure inputs/outputs are available
        const def = getNodeDefinition(nodeData.nodeType);

        // Merge definition inputs/outputs if node data doesn't have them
        const mergedData: CanvasNodeData = {
          ...nodeData,
          inputs: (nodeData.inputs && nodeData.inputs.length > 0) ? nodeData.inputs : (def?.inputs || []),
          outputs: (nodeData.outputs && nodeData.outputs.length > 0) ? nodeData.outputs : (def?.outputs || []),
        };

        setSelectedFlowNode({
          id: selectedNode.id,
          data: mergedData,
        });
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

  // === UNIFIED NODE SYSTEM v3.1 ===
  // Delete selected nodes via backend API (with legacy fallback)
  const handleDeleteSelectedCards = async () => {
    if (!currentBoard || selectedNodes.length === 0) return;

    // Try to delete each node, with fallback to legacy card API
    await Promise.all(selectedNodes.map(async (id) => {
      try {
        await nodeService.delete(id);
      } catch (err: unknown) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError?.response?.status === 404) {
          try {
            await creativeCanvasService.cards.delete(id);
          } catch {
            // Ignore - node may not exist in either system
          }
        }
      }
    }));

    // Remove from React Flow state regardless of backend results
    setNodes(prev => prev.filter(n => !selectedNodes.includes(n.id)));
    setEdges(prev => prev.filter(e =>
      !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
    ));
    setSelectedNodes([]);
    setSuccessMessage('Nodes deleted successfully');
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
          // === UNIFIED NODE SYSTEM v3.1 ===
          // Create node via backend API with full typed ports persistence
          // Convert local Port[] to NodePort[] for API
          const apiInputs: NodePort[] = (nodeData.inputs || []).map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            required: p.required ?? false,
            multi: false,
          }));
          const apiOutputs: NodePort[] = (nodeData.outputs || []).map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            required: p.required ?? false,
            multi: false,
          }));

          const nodeResponse = await nodeService.create(currentBoard.id, {
            nodeType: nodeData.nodeType,
            label: nodeData.label,
            category: nodeData.category,
            position: { x: finalPosition.x, y: finalPosition.y },
            dimensions: { width: 320, height: 400 },
            inputs: apiInputs,      // ← Typed ports now persisted!
            outputs: apiOutputs,    // ← Typed ports now persisted!
            parameters: nodeData.parameters || {}, // ← Parameters now persisted!
          });

          if (!nodeResponse.success || !nodeResponse.node) {
            const errMsg = typeof nodeResponse.error === 'string' ? nodeResponse.error : 'Failed to create node';
            throw new Error(errMsg);
          }

          const apiNode = nodeResponse.node;

          // Convert backend node to React Flow node
          // Use specialized node component if registered, otherwise fallback to canvasNode
          const registeredNodeType = apiNode.nodeType in nodeTypes ? apiNode.nodeType : 'canvasNode';

          // Convert API NodePort[] back to local Port[] format
          const localInputs: Port[] = (apiNode.inputs || []).map(p => ({
            id: p.id,
            name: p.name,
            type: p.type as PortType,
            required: p.required,
          }));
          const localOutputs: Port[] = (apiNode.outputs || []).map(p => ({
            id: p.id,
            name: p.name,
            type: p.type as PortType,
            required: p.required,
          }));

          const newNode: Node<CanvasNodeData> = {
            id: apiNode.id, // Use backend-generated ID
            type: registeredNodeType,
            position: apiNode.position,
            data: {
              nodeType: apiNode.nodeType as NodeType,
              category: apiNode.category as CanvasNodeData['category'],
              label: apiNode.label,
              inputs: localInputs,
              outputs: localOutputs,
              parameters: apiNode.parameters || {},
              status: apiNode.status || 'idle',
            },
            width: apiNode.dimensions?.width,
            height: apiNode.dimensions?.height,
          };

          // If we have a target node, try to create an auto-connect edge
          if (targetNode) {
            // Try target's output → new node's input (most common: drop processor on image source)
            const connectionFromTarget = findBestConnection(targetNode, newNode);
            if (connectionFromTarget) {
              // Create edge via backend API
              const edgeResponse = await edgeService.create(currentBoard.id, {
                sourceNodeId: targetNode.id,
                sourcePortId: connectionFromTarget.sourceHandle,
                targetNodeId: newNode.id,
                targetPortId: connectionFromTarget.targetHandle,
                edgeType: 'default',
              });
              if (edgeResponse.success && edgeResponse.edge) {
                autoConnectEdge = apiEdgeToFlowEdge(edgeResponse.edge);
              }
            } else {
              // Try new node's output → target's input (less common: drop source on processor)
              const connectionToTarget = findBestConnection(newNode, targetNode);
              if (connectionToTarget) {
                // Position new node to the LEFT of target instead
                newNode.position = {
                  x: targetNode.position.x - 250,
                  y: targetNode.position.y,
                };
                // Update position in backend
                await nodeService.update(newNode.id, { position: newNode.position });
                // Create edge via backend API
                const edgeResponse = await edgeService.create(currentBoard.id, {
                  sourceNodeId: newNode.id,
                  sourcePortId: connectionToTarget.sourceHandle,
                  targetNodeId: targetNode.id,
                  targetPortId: connectionToTarget.targetHandle,
                  edgeType: 'default',
                });
                if (edgeResponse.success && edgeResponse.edge) {
                  autoConnectEdge = apiEdgeToFlowEdge(edgeResponse.edge);
                }
              }
            }
          }

          // Add the new node to React Flow state
          setNodes((nds) => [...nds, newNode]);

          // Add auto-connect edge if applicable
          if (autoConnectEdge) {
            setEdges((eds) => [...eds, autoConnectEdge!]);
            setSuccessMessage(`Added ${nodeData.label} and connected to ${(targetNode?.data as CanvasNodeData)?.label || 'node'}`);
          } else {
            setSuccessMessage(`Added ${nodeData.label} node`);
          }

          // Note: No need to update board.cards - nodes are now separate entities

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

          // Update via API (try node API first, fallback to legacy card API)
          try {
            await nodeService.update(selectedFlowNode.id, {
              parameters: {
                ...(selectedFlowNode.data.parameters || {}),
                prompt: newPrompt,
              },
            });
          } catch (err: unknown) {
            // Fallback to legacy card API
            const axiosError = err as { response?: { status?: number } };
            if (axiosError?.response?.status === 404) {
              try {
                await creativeCanvasService.cards.update(selectedFlowNode.id, {
                  prompt: newPrompt,
                  config: { basePrompt: newPrompt },
                });
              } catch {
                console.error('Failed to update node/card prompt');
              }
            } else {
              console.error('Failed to update node prompt:', err);
            }
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

  // Quick-add node from toolbar - creates node at center of viewport
  const handleQuickAddNode = useCallback(
    async (nodeType: NodeType) => {
      if (!currentBoard) return;

      // Find node definition
      const nodeDef = nodeDefinitions.find((n) => n.type === nodeType);
      if (!nodeDef) {
        setError(`Unknown node type: ${nodeType}`);
        return;
      }

      // Calculate center of current viewport
      const viewport = reactFlowInstance.getViewport();
      const viewportWidth = canvasContainerRef.current?.clientWidth || 800;
      const viewportHeight = canvasContainerRef.current?.clientHeight || 600;

      const centerPosition = {
        x: (-viewport.x + viewportWidth / 2) / viewport.zoom - 160, // Account for node width
        y: (-viewport.y + viewportHeight / 2) / viewport.zoom - 200, // Account for node height
      };

      try {
        // Convert node definition to API format
        const apiInputs: NodePort[] = (nodeDef.inputs || []).map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          required: p.required ?? false,
          multi: false,
        }));
        const apiOutputs: NodePort[] = (nodeDef.outputs || []).map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          required: p.required ?? false,
          multi: false,
        }));

        // Build default parameters from definition
        const defaultParams: Record<string, unknown> = {};
        nodeDef.parameters?.forEach(param => {
          if (param.default !== undefined) {
            defaultParams[param.id] = param.default;
          }
        });

        const nodeResponse = await nodeService.create(currentBoard.id, {
          nodeType: nodeType,
          label: nodeDef.label,
          category: nodeDef.category,
          position: centerPosition,
          dimensions: { width: 320, height: 400 },
          inputs: apiInputs,
          outputs: apiOutputs,
          parameters: defaultParams,
        });

        if (!nodeResponse.success || !nodeResponse.node) {
          throw new Error(nodeResponse.error as string || 'Failed to create node');
        }

        const apiNode = nodeResponse.node;
        const registeredNodeType = apiNode.nodeType in nodeTypes ? apiNode.nodeType : 'canvasNode';

        // Convert API ports to local format
        const localInputs: Port[] = (apiNode.inputs || []).map(p => ({
          id: p.id,
          name: p.name,
          type: p.type as PortType,
          required: p.required,
        }));
        const localOutputs: Port[] = (apiNode.outputs || []).map(p => ({
          id: p.id,
          name: p.name,
          type: p.type as PortType,
          required: p.required,
        }));

        const newNode: Node<CanvasNodeData> = {
          id: apiNode.id,
          type: registeredNodeType,
          position: apiNode.position,
          data: {
            nodeType: apiNode.nodeType as NodeType,
            category: apiNode.category as CanvasNodeData['category'],
            label: apiNode.label,
            inputs: localInputs,
            outputs: localOutputs,
            parameters: apiNode.parameters || {},
            status: 'idle',
          },
          width: apiNode.dimensions?.width,
          height: apiNode.dimensions?.height,
        };

        setNodes((nds) => [...nds, newNode]);
        setSuccessMessage(`Added ${nodeDef.label} node`);
      } catch (err) {
        console.error('Failed to quick-add node:', err);
        setError(`Failed to add ${nodeDef.label} node`);
      }
    },
    [currentBoard, reactFlowInstance, setNodes, nodeTypes]
  );

  // Handle parameter change from inspector - update local state and persist to backend
  const handleParameterChange = useCallback(
    (nodeId: string, paramId: string, value: unknown) => {
      // Get current node data for the update
      const currentNode = nodes.find(n => n.id === nodeId);
      const currentParams = (currentNode?.data as CanvasNodeData | undefined)?.parameters || {};

      // Update local state immediately for responsive UI
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

      // Persist to backend (try node API, fallback to card API)
      nodeService.update(nodeId, {
        parameters: {
          ...currentParams,
          [paramId]: value,
        },
      }).catch(async (err: unknown) => {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError?.response?.status === 404) {
          // Fallback to legacy card API
          try {
            await creativeCanvasService.cards.update(nodeId, {
              config: { [paramId]: value },
            });
          } catch {
            console.error('Failed to persist parameter change');
          }
        }
      });
    },
    [nodes, setNodes, selectedFlowNode]
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

      // ========================================
      // DEBUG: Log all nodes and their parameters
      // ========================================
      console.log('[handleNodeExecute] === DEBUG START ===');
      console.log('[handleNodeExecute] Executing node:', nodeId, nodeData?.label);
      console.log('[handleNodeExecute] All nodes in state:', nodes.map(n => ({
        id: n.id,
        label: (n.data as CanvasNodeData)?.label,
        nodeType: (n.data as CanvasNodeData)?.nodeType,
        parameters: (n.data as CanvasNodeData)?.parameters,
        cachedOutput: (n.data as CanvasNodeData)?.cachedOutput,
      })));
      console.log('[handleNodeExecute] All edges:', edges.map(e => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
      })));

      // ========================================
      // GATHER INPUTS FROM CONNECTED UPSTREAM NODES
      // ========================================
      // Find all edges where this node is the target (incoming connections)
      const incomingEdges = edges.filter(edge => edge.target === nodeId);
      console.log('[handleNodeExecute] Incoming edges to this node:', incomingEdges);

      // Build inputData from connected source nodes
      const inputData: Record<string, unknown> = {};

      for (const edge of incomingEdges) {
        // Find the source node
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (!sourceNode) continue;

        const sourceData = sourceNode.data as CanvasNodeData | undefined;
        if (!sourceData) continue;

        // Get the source port and target port from the edge
        const sourcePortId = edge.sourceHandle || 'output';
        const targetPortId = edge.targetHandle || 'input';

        // Get output data from source node's cachedOutput or parameters
        let outputValue: unknown = null;

        // Helper to check if a value is meaningful (not null/undefined/empty)
        const isValidValue = (v: unknown): boolean => {
          if (v === null || v === undefined) return false;
          if (typeof v === 'string') return v.trim() !== '';
          if (typeof v === 'number') return true;
          if (typeof v === 'boolean') return true;
          if (Array.isArray(v)) return v.length > 0;
          if (typeof v === 'object') {
            // Empty objects are not valid
            const keys = Object.keys(v as object);
            if (keys.length === 0) return false;
            // Objects with only empty values are not valid
            return keys.some(key => isValidValue((v as Record<string, unknown>)[key]));
          }
          return false;
        };

        console.log(`[handleNodeExecute] Processing edge from ${edge.source} (port: ${sourcePortId}) to ${edge.target} (port: ${targetPortId})`);
        console.log(`[handleNodeExecute] Source node data:`, {
          label: sourceData.label,
          nodeType: sourceData.nodeType,
          cachedOutput: sourceData.cachedOutput,
          parameters: sourceData.parameters
        });

        // Check cachedOutput first (for executed nodes that have output)
        if (sourceData.cachedOutput && typeof sourceData.cachedOutput === 'object') {
          const cached = sourceData.cachedOutput as Record<string, unknown>;
          const cachedKeys = Object.keys(cached);

          // Only use cachedOutput if it has actual data (not an empty object)
          if (cachedKeys.length > 0) {
            // Try to get the specific output by port name first
            if (sourcePortId in cached && isValidValue(cached[sourcePortId])) {
              outputValue = cached[sourcePortId];
            } else {
              // Try common output keys for all node types
              // Text outputs - including enhancedPrompt from prompt enhancement nodes
              const textKeys = ['enhancedPrompt', 'text', 'prompt', 'enhanced', 'result', 'output', 'content', 'description', 'improvedPrompt', 'generatedPrompt'];
              // Image outputs
              const imageKeys = ['image', 'images', 'upscaled', 'grid', 'frames', 'sheet', 'panorama', 'turnaround', 'expressions'];
              // Video/Audio outputs
              const mediaKeys = ['video', 'audio', 'music'];
              // Character/Style outputs
              const entityKeys = ['character', 'characters', 'memory', 'library', 'style', 'lora', 'vector'];
              // Storytelling outputs
              const storyKeys = ['story', 'scene', 'dialogue', 'monologue', 'screenplay', 'lore', 'timeline', 'relationship'];
              // Fashion-specific outputs
              const fashionKeys = ['garment', 'outfit', 'lookbook', 'collection', 'pattern', 'fabric', 'colorway'];

              const allKeys = [...textKeys, ...imageKeys, ...mediaKeys, ...entityKeys, ...storyKeys, ...fashionKeys];

              for (const key of allKeys) {
                if (isValidValue(cached[key])) {
                  outputValue = cached[key];
                  break;
                }
              }
            }
          }
        }

        // Fallback to parameters if no valid cachedOutput (for input nodes like TextInput)
        // Input nodes don't execute - their value is stored directly in parameters
        if (!isValidValue(outputValue)) {
          const params = sourceData.parameters;
          if (params && typeof params === 'object') {
            const p = params as Record<string, unknown>;

            // Try the exact port ID first
            if (isValidValue(p[sourcePortId])) {
              outputValue = p[sourcePortId];
            } else {
              // Try common parameter keys for all node types
              // Text parameters (most common for input nodes)
              const textParams = ['text', 'prompt', 'value', 'content', 'idea', 'concept', 'theme', 'description'];
              // Image parameters
              const imageParams = ['image', 'images', 'reference', 'references', 'file', 'files', 'url'];
              // Video/Audio parameters
              const mediaParams = ['video', 'audio', 'audioPrompt'];
              // Character parameters
              const charParams = ['character', 'characters', 'characterName', 'character1', 'character2'];
              // Style parameters
              const styleParams = ['style', 'styleName', 'toneStyle', 'brandStyle'];
              // Storytelling parameters
              const storyParams = ['story', 'scene', 'dialogue', 'lore', 'timeline', 'script', 'screenplay'];

              const allParams = [...textParams, ...imageParams, ...mediaParams, ...charParams, ...styleParams, ...storyParams];

              for (const key of allParams) {
                if (isValidValue(p[key])) {
                  outputValue = p[key];
                  break;
                }
              }
            }
          }
        }

        console.log(`[handleNodeExecute] Source node ${sourceNode.id} (${sourceData.label}): portId=${sourcePortId}, cachedOutput=`, sourceData.cachedOutput, 'parameters=', sourceData.parameters, 'extracted value=', outputValue);

        // Map the output to the target input port (only if it's actually a valid value)
        if (isValidValue(outputValue)) {
          // If outputValue is an array of images/URLs, extract the first one for single-value ports
          // This handles Reference Image nodes which output arrays
          let finalValue = outputValue;
          if (Array.isArray(outputValue) && outputValue.length > 0) {
            // For ports expecting a single image (model, garment, image), use the first URL
            const singleValuePorts = ['model', 'garment', 'image', 'person', 'reference', 'video', 'audio'];
            if (singleValuePorts.includes(targetPortId) ||
                singleValuePorts.some(p => targetPortId.toLowerCase().includes(p))) {
              // Check if array contains strings (URLs) or objects with url property
              const firstItem = outputValue[0];
              if (typeof firstItem === 'string') {
                finalValue = firstItem;
                console.log(`[handleNodeExecute] Extracted first URL from array for port ${targetPortId}:`, finalValue);
              } else if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem) {
                finalValue = (firstItem as { url: string }).url;
                console.log(`[handleNodeExecute] Extracted first URL from object array for port ${targetPortId}:`, finalValue);
              }
            }
          }

          // Always set the exact target port ID
          inputData[targetPortId] = finalValue;

          // Map to alternative names that backends might expect
          // This ensures compatibility with different API naming conventions

          // Text-related mappings
          if (targetPortId === 'text' || targetPortId === 'prompt' || targetPortId.includes('Prompt') || targetPortId.includes('prompt')) {
            inputData['text'] = finalValue;
            inputData['prompt'] = finalValue;
            inputData['Input Prompt'] = finalValue; // Match exact API error messages
            inputData['input'] = finalValue;
          }

          // Image-related mappings
          if (targetPortId === 'image' || targetPortId === 'reference' || targetPortId.includes('image') || targetPortId.includes('Image')) {
            inputData['image'] = finalValue;
            inputData['images'] = finalValue;
            inputData['reference'] = finalValue;
            inputData['Source Image'] = finalValue;
          }

          // Video-related mappings
          if (targetPortId === 'video' || targetPortId.includes('video') || targetPortId.includes('Video')) {
            inputData['video'] = finalValue;
          }

          // Audio-related mappings
          if (targetPortId === 'audio' || targetPortId.includes('audio') || targetPortId.includes('Audio')) {
            inputData['audio'] = finalValue;
          }

          // Character-related mappings
          if (targetPortId === 'character' || targetPortId.includes('character') || targetPortId.includes('Character')) {
            inputData['character'] = finalValue;
            inputData['characters'] = finalValue;
            inputData['Character Lock'] = finalValue;
          }

          // Style-related mappings
          if (targetPortId === 'style' || targetPortId.includes('style') || targetPortId.includes('Style')) {
            inputData['style'] = finalValue;
            inputData['Visual Style'] = finalValue;
          }

          // Storytelling-related mappings
          if (targetPortId === 'story' || targetPortId.includes('story') || targetPortId.includes('Story')) {
            inputData['story'] = finalValue;
            inputData['Story Context'] = finalValue;
          }

          if (targetPortId === 'scene' || targetPortId.includes('scene') || targetPortId.includes('Scene')) {
            inputData['scene'] = finalValue;
          }

          if (targetPortId === 'dialogue' || targetPortId.includes('dialogue') || targetPortId.includes('Dialogue')) {
            inputData['dialogue'] = finalValue;
          }

          if (targetPortId === 'lore' || targetPortId.includes('lore') || targetPortId.includes('Lore')) {
            inputData['lore'] = finalValue;
            inputData['World Lore'] = finalValue;
          }

          // Fashion-related mappings
          if (targetPortId === 'garment' || targetPortId.includes('garment') || targetPortId.includes('Garment')) {
            inputData['garment'] = finalValue;
            inputData['Garment'] = finalValue;
          }

          if (targetPortId === 'person' || targetPortId === 'model' || targetPortId.includes('Person') || targetPortId.includes('Model')) {
            inputData['person'] = finalValue;
            inputData['model'] = finalValue;
            inputData['Person Image'] = finalValue;
            inputData['Model Photo'] = finalValue;
          }

          // Generic input fallback
          if (targetPortId === 'input') {
            inputData['input'] = finalValue;
            inputData['text'] = finalValue;
            inputData['prompt'] = finalValue;
          }

          console.log(`[handleNodeExecute] Mapped input: ${targetPortId} from ${sourceNode.id} (${sourceData.label}) -> value:`, finalValue);
        }
      }

      console.log('[handleNodeExecute] Collected inputData:', inputData);
      console.log('[handleNodeExecute] Node parameters:', nodeData?.parameters);

      // Get the node definition to find the correct default model
      const nodeDef = nodeDefinitions.find(def => def.type === nodeData?.nodeType);
      const defaultModel = nodeDef?.aiModel || 'flux-2-pro';

      console.log('[handleNodeExecute] Node type:', nodeData?.nodeType, 'Default model:', defaultModel);

      // ========================================
      // FASHION NODE SPECIAL HANDLING
      // ========================================
      // Fashion nodes use specialized services for better control
      let executeResponse: Awaited<ReturnType<typeof nodeService.execute>>;
      const nodeType = nodeData?.nodeType;

      if (nodeType === 'virtualTryOn') {
        // Virtual Try-On node - requires model image + garment image
        console.log('[handleNodeExecute] Processing Virtual Try-On with fashion service');
        const provider = (nodeData?.parameters?.provider as TryOnProvider) || 'fashn';
        const category = (nodeData?.parameters?.category as TryOnCategory) || 'tops';
        const mode = (nodeData?.parameters?.mode as string) || 'quality';

        // Get model and garment images from inputs
        const modelImageUrl = (inputData.model as string) || (inputData.image as string) || (nodeData?.parameters?.modelImageUrl as string);
        const garmentImageUrl = (inputData.garment as string) || (nodeData?.parameters?.garmentImageUrl as string);

        if (!modelImageUrl || !garmentImageUrl) {
          throw new Error('Virtual Try-On requires both a model photo and a garment image. Connect both inputs.');
        }

        // Call the fashion service directly
        const tryOnResponse = await fashionService.virtualTryOn.tryOnWithProvider({
          human_image_url: modelImageUrl,
          garment_image_url: garmentImageUrl,
          category,
          mode: mode as 'quality' | 'performance' | 'balanced',
        }, provider);

        // Transform to standard execute response format
        const resultImageUrl = tryOnResponse.data?.images?.[0]?.url;
        executeResponse = {
          success: tryOnResponse.success,
          nodeId,
          status: 'completed',
          output: {
            images: tryOnResponse.data?.images || [],
            imageUrl: resultImageUrl,
            outputType: 'image',
            provider,
          },
          error: tryOnResponse.error,
        };
      } else if (nodeType === 'clothesSwap') {
        // Clothes Swap node - uses dedicated /api/fashion/clothes-swap endpoint
        // Aligned with Swagger v3 API schema (Dec 2025)
        console.log('[handleNodeExecute] Processing Clothes Swap with fashion service');
        const modelImage = (inputData.person as string) || (inputData.model as string) || (inputData.image as string);
        const garmentImage = (inputData.garment as string) || (nodeData?.parameters?.garmentImage as string);
        const garmentDescription = (inputData.prompt as string) || (nodeData?.parameters?.garmentDescription as string);
        const category = (nodeData?.parameters?.category as 'tops' | 'bottoms' | 'dresses' | 'outerwear') || 'tops';

        if (!modelImage) {
          throw new Error('Clothes Swap requires a model/person image. Connect the input.');
        }
        if (!garmentImage) {
          throw new Error('Clothes Swap requires a garment image. Connect the garment input.');
        }

        const swapResponse = await fashionService.clothesSwap.swap({
          modelImage,
          garmentImage,
          garmentDescription,
          category,
        });

        const resultImageUrl = swapResponse.data?.images?.[0] || '';
        executeResponse = {
          success: swapResponse.data?.success ?? swapResponse.success,
          nodeId,
          status: 'completed',
          output: {
            images: swapResponse.data?.images || [],
            imageUrl: resultImageUrl,
            outputType: 'image',
          },
          error: swapResponse.data?.errors?.[0] || swapResponse.error,
        };
      } else if (nodeType === 'runwayAnimation') {
        // Runway Animation node - uses dedicated /api/fashion/runway-animation endpoint
        // Aligned with Swagger v3 API schema (Dec 2025)
        console.log('[handleNodeExecute] Processing Runway Animation with fashion service');
        const onModelImage = (inputData.image as string) || (nodeData?.parameters?.onModelImage as string);
        // Support both old parameter names (animationType) and new Swagger v3 names (walkStyle)
        const walkStyle = (nodeData?.parameters?.walkStyle as string) || (nodeData?.parameters?.animationType as string) || 'commercial';
        // Duration must be a string like "5s" or "10s" - convert if number
        const rawDuration = nodeData?.parameters?.duration;
        const duration: string = typeof rawDuration === 'number'
          ? `${rawDuration}s`
          : (rawDuration as string) || '5s';
        // Support both old parameter names (cameraMotion) and new Swagger v3 names (cameraStyle)
        const cameraStyle = (nodeData?.parameters?.cameraStyle as string) || (nodeData?.parameters?.cameraMotion as string) || 'follow';

        if (!onModelImage) {
          throw new Error('Runway Animation requires a styled model image. Connect the input.');
        }

        const animResponse = await fashionService.runwayAnimation.create({
          onModelImage,
          walkStyle,
          duration,
          cameraStyle,
        });

        // Runway animation is async - check if job is returned
        if (animResponse.data?.jobId && animResponse.data?.status !== 'completed') {
          // Job started - update node with job ID for polling
          executeResponse = {
            success: true,
            nodeId,
            status: 'running',
            output: {
              jobId: animResponse.data.jobId,
              videoUrl: animResponse.data.videoUrl,
              outputType: 'video',
            },
          };
          // TODO: Add polling for job completion
        } else {
          executeResponse = {
            success: animResponse.data?.success ?? animResponse.success,
            nodeId,
            status: 'completed',
            output: {
              videoUrl: animResponse.data?.videoUrl,
              outputType: 'video',
            },
            error: animResponse.data?.errors?.[0] || animResponse.error,
          };
        }
      }
      // ========================================
      // STORYTELLING NODE SPECIAL HANDLING
      // ========================================
      else if (nodeType === 'storyGenesis') {
        // Story Genesis - Create story concept from idea
        console.log('[handleNodeExecute] Processing Story Genesis');
        const starterPrompt = (inputData.idea as string) || (nodeData?.parameters?.starterPrompt as string);

        if (!starterPrompt) {
          throw new Error('Story Genesis requires a core idea. Enter a prompt or connect an input.');
        }

        const storyResponse = await storyGenerationService.startStory({
          starterPrompt,
          genre: (nodeData?.parameters?.genre as StoryGenre) || 'fantasy',
          tone: (nodeData?.parameters?.tone as StoryTone) || 'serious',
          pointOfView: (nodeData?.parameters?.pov as POV) || 'third-limited',
          targetLength: (nodeData?.parameters?.length as TargetLength) || 'short-story',
          targetAudience: (nodeData?.parameters?.audience as Audience) || 'adult',
          themes: (nodeData?.parameters?.themes as string[]) || [],
        });

        executeResponse = {
          success: true,
          nodeId,
          status: 'completed',
          output: {
            story: storyResponse.story,
            characters: storyResponse.characters,
            outline: storyResponse.outline,
            logline: storyResponse.logline,
            text: storyResponse.logline, // For text preview
            outputType: 'text',
          },
        };
      } else if (nodeType === 'storyStructure') {
        // Story Structure - Apply story framework
        console.log('[handleNodeExecute] Processing Story Structure');
        const storyInput = inputData.story as Record<string, unknown>;

        if (!storyInput) {
          throw new Error('Story Structure requires a story concept. Connect the Story input.');
        }

        const structureResponse = await storyGenerationService.generateStructure({
          storyId: (storyInput.id as string) || 'temp-story',
          story: storyInput as any,
          framework: (nodeData?.parameters?.framework as StoryFramework) || 'three-act',
          detailLevel: (nodeData?.parameters?.detailLevel as 'high-level' | 'detailed' | 'comprehensive') || 'detailed',
          includeSubplots: (nodeData?.parameters?.includeSubplots as boolean) ?? true,
        });

        executeResponse = {
          success: true,
          nodeId,
          status: 'completed',
          output: {
            outline: structureResponse.outline,
            beats: structureResponse.beats,
            acts: structureResponse.acts,
            text: `${structureResponse.outline?.framework} structure with ${structureResponse.beats?.length || 0} beats`,
            outputType: 'text',
          },
        };
      } else if (nodeType === 'characterCreator') {
        // Character Creator - Generate full character
        console.log('[handleNodeExecute] Processing Character Creator');
        const concept = (inputData.concept as string) || (nodeData?.parameters?.concept as string);

        if (!concept) {
          throw new Error('Character Creator requires a character concept.');
        }

        const characterResponse = await storyGenerationService.generateCharacter({
          concept,
          archetype: nodeData?.parameters?.archetype as CharacterArchetype,
          role: nodeData?.parameters?.role as CharacterRole,
          depth: (nodeData?.parameters?.depth as 'basic' | 'standard' | 'deep' | 'comprehensive') || 'standard',
          generatePortrait: (nodeData?.parameters?.generatePortrait as boolean) ?? false,
        });

        executeResponse = {
          success: true,
          nodeId,
          status: 'completed',
          output: {
            character: characterResponse.character,
            backstory: characterResponse.backstory,
            arc: characterResponse.arc,
            text: `${characterResponse.character?.name}: ${characterResponse.character?.role} - ${characterResponse.character?.archetype}`,
            imageUrl: characterResponse.portraitUrl,
            outputType: characterResponse.portraitUrl ? 'image' : 'text',
          },
        };
      } else if (nodeType === 'sceneGenerator') {
        // Scene Generator - Generate a complete scene
        console.log('[handleNodeExecute] Processing Scene Generator');
        const concept = (inputData.concept as string) || (nodeData?.parameters?.concept as string);

        if (!concept) {
          throw new Error('Scene Writer requires a scene concept.');
        }

        const sceneResponse = await storyGenerationService.generateScene({
          storyId: 'temp-story',
          storyContext: (inputData.story as any) || {},
          concept,
          characters: (inputData.characters as any[]) || [],
          location: inputData.location as any,
          format: (nodeData?.parameters?.format as SceneFormat) || 'prose',
          pov: (nodeData?.parameters?.pov as POV) || 'third-limited',
          sceneType: (nodeData?.parameters?.sceneType as SceneType) || 'dramatic',
          length: (nodeData?.parameters?.length as SceneLength) || 'medium',
        });

        executeResponse = {
          success: true,
          nodeId,
          status: 'completed',
          output: {
            scene: sceneResponse.scene,
            dialogue: sceneResponse.dialogue,
            text: sceneResponse.scene?.content || sceneResponse.narration,
            outputType: 'text',
          },
        };
      } else if (nodeType === 'locationCreator') {
        // Location Creator - Generate a location
        console.log('[handleNodeExecute] Processing Location Creator');
        const concept = (inputData.concept as string) || (nodeData?.parameters?.concept as string);

        if (!concept) {
          throw new Error('Location Creator requires a location concept.');
        }

        const locationResponse = await storyGenerationService.createLocation({
          concept,
          locationType: (nodeData?.parameters?.locationType as LocationType) || 'urban',
          mood: (nodeData?.parameters?.mood as string) || 'mysterious',
          sensoryDetail: (nodeData?.parameters?.sensoryDetail as 'minimal' | 'moderate' | 'rich' | 'immersive') || 'rich',
          includeHistory: (nodeData?.parameters?.includeHistory as boolean) ?? true,
          includeSecrets: (nodeData?.parameters?.includeSecrets as boolean) ?? true,
          generateImage: (nodeData?.parameters?.generateImage as boolean) ?? false,
        });

        executeResponse = {
          success: true,
          nodeId,
          status: 'completed',
          output: {
            location: locationResponse.location,
            text: locationResponse.description,
            imageUrl: locationResponse.imageUrl,
            outputType: locationResponse.imageUrl ? 'image' : 'text',
          },
        };
      } else if (nodeType === 'dialogueGenerator') {
        // Dialogue Generator - Generate dialogue between characters
        console.log('[handleNodeExecute] Processing Dialogue Generator');
        const characters = (inputData.characters as any[]) || [];
        const situation = (inputData.situation as string) || (nodeData?.parameters?.situation as string);

        if (characters.length < 2) {
          throw new Error('Character Dialogue requires at least 2 characters connected.');
        }
        if (!situation) {
          throw new Error('Character Dialogue requires a situation/context.');
        }

        const dialogueResponse = await storyGenerationService.generateDialogue({
          storyId: 'temp-story',
          characters,
          situation,
          dialogueType: (nodeData?.parameters?.dialogueType as DialogueType) || 'conversation',
          subtextLevel: (nodeData?.parameters?.subtextLevel as 'none' | 'light' | 'moderate' | 'heavy') || 'moderate',
          length: (nodeData?.parameters?.length as 'brief' | 'short' | 'medium' | 'long') || 'medium',
          format: (nodeData?.parameters?.format as 'prose' | 'screenplay' | 'comic' | 'game') || 'prose',
        });

        // Handle dialogue response - can be single exchange or array (Swagger v3)
        const dialogueData = dialogueResponse.dialogue;
        const dialogueExchanges = Array.isArray(dialogueData) ? dialogueData : (dialogueData ? [dialogueData] : []);
        const dialogueText = dialogueExchanges
          .flatMap(exchange => exchange.lines || [])
          .map((line: { characterName?: string; line?: string }) => `${line.characterName || 'Unknown'}: ${line.line || ''}`)
          .join('\n') || '';

        executeResponse = {
          success: dialogueResponse.success ?? true,
          nodeId,
          status: 'completed',
          output: {
            dialogue: dialogueData,
            text: dialogueText,
            sceneDescription: dialogueResponse.sceneDescription,
            outputType: 'text',
          },
          error: dialogueResponse.errors?.[0],
        };
      } else if (nodeType === 'plotTwist') {
        // Plot Twist - Generate a plot twist
        console.log('[handleNodeExecute] Processing Plot Twist');
        const storyInput = inputData.story as Record<string, unknown>;

        if (!storyInput) {
          throw new Error('Plot Twist requires a story context. Connect the Story input.');
        }

        const twistResponse = await storyGenerationService.generatePlotTwist({
          storyId: (storyInput.id as string) || 'temp-story',
          storyContext: storyInput as any,
          characters: (inputData.characters as any[]) || [],
          twistType: (nodeData?.parameters?.twistType as TwistType) || 'betrayal',
          impactLevel: (nodeData?.parameters?.impactLevel as 'minor' | 'moderate' | 'major' | 'story-changing') || 'major',
          generateForeshadowing: (nodeData?.parameters?.generateForeshadowing as boolean) ?? true,
        });

        executeResponse = {
          success: true,
          nodeId,
          status: 'completed',
          output: {
            twist: twistResponse.twist,
            foreshadowing: twistResponse.foreshadowingHints,
            text: `${twistResponse.twist?.type}: ${twistResponse.twist?.revelation}`,
            outputType: 'text',
          },
        };
      } else if (nodeType === 'storyEnhancer') {
        // Story Enhancer - Polish and improve content
        console.log('[handleNodeExecute] Processing Story Enhancer');
        const content = (inputData.content as string) || (inputData.scene as any)?.content;

        if (!content) {
          throw new Error('Story Enhancer requires content to enhance. Connect a scene or text input.');
        }

        const enhanceResponse = await storyGenerationService.enhanceStory({
          content,
          enhancementFocus: (nodeData?.parameters?.focus as any[]) || ['prose', 'pacing'],
          preserveVoice: (nodeData?.parameters?.preserveVoice as boolean) ?? true,
        });

        executeResponse = {
          success: true,
          nodeId,
          status: 'completed',
          output: {
            enhancedContent: enhanceResponse.enhancedContent,
            changes: enhanceResponse.changes,
            text: enhanceResponse.enhancedContent,
            outputType: 'text',
          },
        };
      } else {
        // ========================================
        // STANDARD NODE EXECUTION
        // ========================================
        // Execute node via Unified Node System API with gathered inputs
        executeResponse = await nodeService.execute(nodeId, {
          inputData,
          overrideParameters: {
            model: (nodeData?.parameters?.model as string) || (nodeData?.parameters?.selectedModel as string) || defaultModel,
            ...nodeData?.parameters, // Include all node parameters
          },
        });
      }

      if (!executeResponse.success) {
        throw new Error(executeResponse.error || 'Failed to execute node');
      }

      // ========================================
      // PROCESS IMMEDIATE EXECUTION RESULT
      // ========================================
      // If the response includes output data, process it immediately (synchronous execution)
      const execOutput = executeResponse.output;
      const execStatus = executeResponse.status || 'running';

      console.log('[handleNodeExecute] Execution response:', {
        success: executeResponse.success,
        status: execStatus,
        output: execOutput,
        execution: executeResponse.execution,
      });

      if (execStatus === 'completed' && execOutput) {
        // Execution completed synchronously - update node immediately
        console.log('[handleNodeExecute] 🎉 Execution completed! Processing output:', execOutput);

        // Build the result object for UI display
        let nodeResult: NodeResult | undefined;

        // Handle text-based outputs (like prompt enhancement)
        if (execOutput.enhancedPrompt || execOutput.text || execOutput.outputType === 'text') {
          nodeResult = {
            type: 'text',
            data: {
              text: execOutput.enhancedPrompt || execOutput.text || execOutput.result,
              originalText: execOutput.originalText,
              outputType: execOutput.outputType,
            },
          };
        }
        // Handle image outputs
        else if (execOutput.imageUrl || execOutput.images || execOutput.outputType === 'image') {
          // Extract URLs - images can be an array of objects with url property or array of strings
          let imageUrls: string[] = [];

          console.log('[handleNodeExecute] Processing image output:', {
            hasImages: !!execOutput.images,
            imagesIsArray: Array.isArray(execOutput.images),
            imagesLength: Array.isArray(execOutput.images) ? execOutput.images.length : 0,
            imageUrl: execOutput.imageUrl,
            outputType: execOutput.outputType,
            rawImages: execOutput.images,
          });

          if (execOutput.images && Array.isArray(execOutput.images)) {
            imageUrls = execOutput.images.map((img: unknown) => {
              // Handle string URLs directly
              if (typeof img === 'string') {
                return img;
              }
              // Handle objects with url property (e.g., { url: "...", width: 864, height: 1296 })
              if (img && typeof img === 'object' && 'url' in img) {
                return (img as { url: string }).url || '';
              }
              return '';
            }).filter((url): url is string => typeof url === 'string' && url.length > 0);
          } else if (execOutput.imageUrl) {
            imageUrls = [execOutput.imageUrl];
          }

          console.log('[handleNodeExecute] Extracted image URLs:', imageUrls);

          nodeResult = {
            type: 'image',
            url: imageUrls[0],
            urls: imageUrls,
          };

          console.log('[handleNodeExecute] Created nodeResult:', nodeResult);
        }
        // Handle video outputs
        else if (execOutput.videoUrl || execOutput.video || execOutput.outputType === 'video') {
          nodeResult = {
            type: 'video',
            url: execOutput.videoUrl || execOutput.video,
          };
        }
        // Handle generic output
        else if (execOutput.result) {
          nodeResult = {
            type: 'text',
            data: execOutput.result,
          };
        }

        // Update node with completed status and result
        console.log('[handleNodeExecute] 🎨 Updating node with result:', {
          nodeId,
          nodeResult,
          hasResult: !!nodeResult,
          resultType: nodeResult?.type,
          resultUrl: nodeResult?.url,
          resultUrls: nodeResult?.urls,
        });

        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId && node.data) {
              const nodeDataLocal = node.data as CanvasNodeData;

              // Build updated data with generic result
              const updatedData: Record<string, unknown> = {
                ...nodeDataLocal,
                status: 'completed' as const,
                progress: 100,
                error: undefined,
                result: nodeResult,
                // Store the full output in cachedOutput for downstream nodes
                cachedOutput: execOutput,
              };

              // For specialized nodes that expect specific result properties,
              // also set the legacy/specialized properties
              if (nodeResult?.type === 'image' && nodeResult.url) {
                // VirtualTryOnNode, ClothesSwapNode, etc. expect resultImageUrl directly
                updatedData.resultImageUrl = nodeResult.url;
                console.log('[handleNodeExecute] 🖼️ Set resultImageUrl for specialized node:', nodeResult.url);
              } else if (nodeResult?.type === 'video' && nodeResult.url) {
                // Video nodes expect resultVideoUrl
                updatedData.resultVideoUrl = nodeResult.url;
              }

              console.log('[handleNodeExecute] 🎨 Node data updated:', {
                nodeId,
                result: updatedData.result,
                resultImageUrl: updatedData.resultImageUrl,
              });
              return {
                ...node,
                data: updatedData,
              };
            }
            return node;
          })
        );

        // Persist the cachedOutput to the backend for reload persistence
        try {
          await nodeService.update(nodeId, {
            status: 'completed',
            cachedOutput: execOutput,
          });
          console.log('[handleNodeExecute] Persisted cachedOutput to backend for node:', nodeId);
        } catch (persistError) {
          console.warn('[handleNodeExecute] Failed to persist cachedOutput:', persistError);
          // Don't fail the whole execution just because persistence failed
        }

        // Show success message with celebratory feedback based on output type
        let outputPreview = 'Output ready!';
        if (nodeResult?.type === 'image' && nodeResult.urls && nodeResult.urls.length > 0) {
          outputPreview = nodeResult.urls.length === 1
            ? '🖼️ Image generated successfully!'
            : `🖼️ ${nodeResult.urls.length} images generated!`;
        } else if (nodeResult?.type === 'video' && nodeResult.url) {
          outputPreview = '🎬 Video generated successfully!';
        } else if (execOutput.enhancedPrompt) {
          outputPreview = `"${execOutput.enhancedPrompt.substring(0, 50)}..."`;
        } else if (execOutput.text) {
          outputPreview = `"${execOutput.text.substring(0, 50)}..."`;
        }
        setSuccessMessage(`✨ ${nodeData?.label || 'Node'} completed! ${outputPreview}`);

        // Execution completed, no need to poll
        return;
      }

      // For async execution, show message and start polling
      setSuccessMessage(`Executing ${nodeData?.label || 'node'}...`);

      // Poll for node status
      const pollStatus = async () => {
        try {
          const nodeResponse = await nodeService.get(nodeId);
          const nodeStatus = nodeResponse.node;

          if (!nodeStatus) {
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
                    status: nodeStatus.status as 'idle' | 'running' | 'completed' | 'error',
                    progress: nodeDataLocal.progress || 0,
                    error: nodeStatus.status === 'error' ? (nodeStatus.lastExecution?.error || 'Execution failed') : undefined,
                    // Update cachedOutput if available
                    ...(nodeStatus.cachedOutput && { cachedOutput: nodeStatus.cachedOutput }),
                  },
                };
              }
              return node;
            })
          );

          if (nodeStatus.status === 'completed') {
            // Refresh the node data to get cachedOutput
            setSuccessMessage(`${nodeData?.label || 'Node'} completed!`);
          } else if (nodeStatus.status === 'error') {
            setError(nodeStatus.lastExecution?.error || 'Node execution failed');
          } else if (nodeStatus.status === 'running') {
            // Continue polling
            setTimeout(pollStatus, 2000);
          }
        } catch (pollErr) {
          console.error('Failed to poll node status:', pollErr);
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
  }, [currentBoard, nodes, edges, setNodes]);

  // === UNIFIED NODE SYSTEM v3.1 ===
  // Handle node delete from inspector - persist to backend (with legacy fallback)
  const handleNodeDelete = useCallback(
    async (nodeId: string) => {
      try {
        // Try to delete via new node API first
        await nodeService.delete(nodeId);
      } catch (err: unknown) {
        // If 404, try legacy card API for backward compatibility
        const axiosError = err as { response?: { status?: number } };
        if (axiosError?.response?.status === 404) {
          try {
            await creativeCanvasService.cards.delete(nodeId);
          } catch {
            // Ignore - node may not exist in either system
          }
        }
      }
      // Remove from React Flow state regardless of backend result
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

  // Render toolbar - Brand styled floating toolbar
  const renderToolbar = () => (
    <Paper
      elevation={4}
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
        borderRadius: `${creativeCardTokens.radius.card}px`,
        zIndex: 10,
        bgcolor: darkNeutrals.surface2,
        border: `1px solid ${darkNeutrals.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: creativeCardTokens.shadows.card,
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

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Domain-specific quick actions toolbar */}
      <DomainToolbar
        category={currentBoard?.category || null}
        onQuickAdd={handleQuickAddNode}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

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

      {/* Common Nodes Quick-Add Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: darkNeutrals.textTertiary,
            fontSize: '0.65rem',
            fontWeight: 600,
            mr: 0.5,
            whiteSpace: 'nowrap',
          }}
        >
          Quick Add:
        </Typography>
        <Tooltip title="Text / Prompt Input">
          <IconButton
            size="small"
            onClick={() => handleQuickAddNode('textInput')}
            sx={{
              color: darkNeutrals.textSecondary,
              '&:hover': { color: brandColors.tealPulse, bgcolor: `${brandColors.tealPulse}15` },
            }}
          >
            <TextInputIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Upload Image">
          <IconButton
            size="small"
            onClick={() => handleQuickAddNode('imageUpload')}
            sx={{
              color: darkNeutrals.textSecondary,
              '&:hover': { color: brandColors.mintGlow, bgcolor: `${brandColors.mintGlow}15` },
            }}
          >
            <ImageUploadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Style Reference Images">
          <IconButton
            size="small"
            onClick={() => handleQuickAddNode('referenceImage')}
            sx={{
              color: darkNeutrals.textSecondary,
              '&:hover': { color: brandColors.sunsetOrange, bgcolor: `${brandColors.sunsetOrange}15` },
            }}
          >
            <ReferenceImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Prompt Enhancer (AI)">
          <IconButton
            size="small"
            onClick={() => handleQuickAddNode('enhancePrompt')}
            sx={{
              color: darkNeutrals.textSecondary,
              '&:hover': { color: brandColors.coralSpark, bgcolor: `${brandColors.coralSpark}15` },
            }}
          >
            <PromptEnhanceIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

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

      {/* Main Canvas Area - Brand styled with dot-grid */}
      <Box
        ref={canvasContainerRef}
        sx={{
          flex: 1,
          height: '100%',
          position: 'relative',
          bgcolor: canvasTokens.background.dark,
          // React Flow will add its own background via the Background component
        }}
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
              gap={canvasTokens.background.dotGrid.size}
              size={1}
              color={canvasTokens.background.dotGrid.color}
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
                return template?.color || darkNeutrals.textTertiary;
              }
              // For flow nodes, use brand category colors
              if (node.data && 'category' in node.data) {
                const category = (node.data as CanvasNodeData).category;
                const categoryConfig = {
                  input: categoryColors.input.main,
                  imageGen: categoryColors.imageGen.main,
                  videoGen: categoryColors.videoGen.main,
                  threeD: categoryColors.threeD.main,
                  character: categoryColors.character.main,
                  style: categoryColors.style.main,
                  composite: categoryColors.composite.main,
                  output: categoryColors.output.main,
                };
                return categoryConfig[category as keyof typeof categoryConfig] || darkNeutrals.textTertiary;
              }
              return darkNeutrals.textTertiary;
            }}
            maskColor={`${darkNeutrals.ink}E6`}
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
      {/* Header - Deep Ocean brand anchor */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${darkNeutrals.border}`,
          bgcolor: brandColors.deepOcean,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: darkNeutrals.textPrimary,
              fontFamily: '"Comfortaa", system-ui, sans-serif',
            }}
          >
            <PaletteIcon sx={{ color: brandColors.tealPulse }} />
            Creator's Toolbox
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

          <Tabs
            value={activeView}
            onChange={(_, value) => setActiveView(value)}
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': {
                backgroundColor: brandColors.tealPulse,
              },
            }}
          >
            <Tab
              value="boards"
              label="My Boards"
              icon={<BoardsIcon />}
              iconPosition="start"
              sx={{
                minHeight: 40,
                py: 0,
                color: darkNeutrals.textSecondary,
                '&.Mui-selected': { color: darkNeutrals.textPrimary },
              }}
            />
            <Tab
              value="canvas"
              label="Canvas"
              icon={<LayersIcon />}
              iconPosition="start"
              sx={{
                minHeight: 40,
                py: 0,
                color: darkNeutrals.textSecondary,
                '&.Mui-selected': { color: darkNeutrals.textPrimary },
              }}
              disabled={!currentBoard}
            />
            <Tab
              value="library"
              label="Library"
              icon={<LibraryIcon />}
              iconPosition="start"
              sx={{
                minHeight: 40,
                py: 0,
                color: darkNeutrals.textSecondary,
                '&.Mui-selected': { color: darkNeutrals.textPrimary },
              }}
            />
            <Tab
              value="marketplace"
              label="Marketplace"
              icon={<MarketplaceIcon />}
              iconPosition="start"
              sx={{
                minHeight: 40,
                py: 0,
                color: darkNeutrals.textSecondary,
                '&.Mui-selected': { color: darkNeutrals.textPrimary },
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Settings">
            <IconButton sx={{ color: darkNeutrals.textSecondary, '&:hover': { color: darkNeutrals.textPrimary } }}>
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
