/**
 * assetLibraryService.ts - Asset Library Persistence Service
 * Manages saving, loading, and organizing generated assets
 * Uses localStorage for persistence with API integration hooks
 */

// ==================== TYPE DEFINITIONS ====================

export type AssetType = 'image' | 'video' | 'carousel' | 'moodboard' | 'brandkit' | 'lookbook';
export type StudioSource = 'fashion' | 'social' | 'moodboards' | 'canvas';

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  description?: string;
  thumbnailUrl: string;
  fullUrl?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  source: StudioSource;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  source: StudioSource;
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived';
  assetIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  projectIds: string[];
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetLibraryState {
  assets: Record<string, Asset>;
  projects: Record<string, Project>;
  collections: Record<string, Collection>;
  recentAssetIds: string[];
  favoriteAssetIds: string[];
}

export interface AssetFilter {
  type?: AssetType | AssetType[];
  source?: StudioSource | StudioSource[];
  projectId?: string;
  tags?: string[];
  isFavorite?: boolean;
  search?: string;
  dateRange?: { start: Date; end: Date };
}

export interface AssetSort {
  field: 'createdAt' | 'updatedAt' | 'name';
  direction: 'asc' | 'desc';
}

// ==================== STORAGE KEYS ====================

const STORAGE_KEYS = {
  assets: 'creative-canvas-assets',
  projects: 'creative-canvas-projects',
  collections: 'creative-canvas-collections',
  recent: 'creative-canvas-recent',
  favorites: 'creative-canvas-favorites',
};

// ==================== UTILITY FUNCTIONS ====================

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(`Failed to load ${key} from storage:`, error);
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
};

// ==================== ASSET LIBRARY SERVICE ====================

class AssetLibraryService {
  private state: AssetLibraryState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      assets: loadFromStorage(STORAGE_KEYS.assets, {}),
      projects: loadFromStorage(STORAGE_KEYS.projects, {}),
      collections: loadFromStorage(STORAGE_KEYS.collections, {}),
      recentAssetIds: loadFromStorage(STORAGE_KEYS.recent, []),
      favoriteAssetIds: loadFromStorage(STORAGE_KEYS.favorites, []),
    };
  }

  // ==================== SUBSCRIPTION ====================

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private persistAssets(): void {
    saveToStorage(STORAGE_KEYS.assets, this.state.assets);
    this.notify();
  }

  private persistProjects(): void {
    saveToStorage(STORAGE_KEYS.projects, this.state.projects);
    this.notify();
  }

  private persistCollections(): void {
    saveToStorage(STORAGE_KEYS.collections, this.state.collections);
    this.notify();
  }

  private persistRecent(): void {
    saveToStorage(STORAGE_KEYS.recent, this.state.recentAssetIds);
  }

  private persistFavorites(): void {
    saveToStorage(STORAGE_KEYS.favorites, this.state.favoriteAssetIds);
  }

  // ==================== ASSET OPERATIONS ====================

  createAsset(
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>
  ): Asset {
    const now = new Date().toISOString();
    const asset: Asset = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
    };

    this.state.assets[asset.id] = asset;
    this.addToRecent(asset.id);
    this.persistAssets();

    return asset;
  }

  getAsset(id: string): Asset | undefined {
    return this.state.assets[id];
  }

  updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>): Asset | undefined {
    const asset = this.state.assets[id];
    if (!asset) return undefined;

    const updated: Asset = {
      ...asset,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.assets[id] = updated;
    this.persistAssets();

    return updated;
  }

  deleteAsset(id: string): boolean {
    if (!this.state.assets[id]) return false;

    delete this.state.assets[id];

    // Remove from recent
    this.state.recentAssetIds = this.state.recentAssetIds.filter((aid) => aid !== id);
    this.persistRecent();

    // Remove from favorites
    this.state.favoriteAssetIds = this.state.favoriteAssetIds.filter((aid) => aid !== id);
    this.persistFavorites();

    // Remove from projects
    Object.values(this.state.projects).forEach((project) => {
      if (project.assetIds.includes(id)) {
        project.assetIds = project.assetIds.filter((aid) => aid !== id);
      }
    });
    this.persistProjects();

    // Remove from collections
    Object.values(this.state.collections).forEach((collection) => {
      if (collection.assetIds.includes(id)) {
        collection.assetIds = collection.assetIds.filter((aid) => aid !== id);
      }
    });
    this.persistCollections();

    this.persistAssets();
    return true;
  }

  getAllAssets(): Asset[] {
    return Object.values(this.state.assets);
  }

  queryAssets(filter?: AssetFilter, sort?: AssetSort): Asset[] {
    let assets = Object.values(this.state.assets);

    if (filter) {
      // Filter by type
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        assets = assets.filter((a) => types.includes(a.type));
      }

      // Filter by source
      if (filter.source) {
        const sources = Array.isArray(filter.source) ? filter.source : [filter.source];
        assets = assets.filter((a) => sources.includes(a.source));
      }

      // Filter by project
      if (filter.projectId) {
        const project = this.state.projects[filter.projectId];
        if (project) {
          assets = assets.filter((a) => project.assetIds.includes(a.id));
        }
      }

      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        assets = assets.filter((a) =>
          filter.tags!.some((tag) => a.tags.includes(tag))
        );
      }

      // Filter by favorite
      if (filter.isFavorite !== undefined) {
        assets = assets.filter((a) => a.isFavorite === filter.isFavorite);
      }

      // Filter by search
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        assets = assets.filter(
          (a) =>
            a.name.toLowerCase().includes(searchLower) ||
            a.description?.toLowerCase().includes(searchLower) ||
            a.tags.some((t) => t.toLowerCase().includes(searchLower))
        );
      }

      // Filter by date range
      if (filter.dateRange) {
        const start = filter.dateRange.start.getTime();
        const end = filter.dateRange.end.getTime();
        assets = assets.filter((a) => {
          const created = new Date(a.createdAt).getTime();
          return created >= start && created <= end;
        });
      }
    }

    // Sort
    if (sort) {
      assets.sort((a, b) => {
        let aValue: string | number = a[sort.field];
        let bValue: string | number = b[sort.field];

        if (sort.field === 'createdAt' || sort.field === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default: newest first
      assets.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return assets;
  }

  // ==================== FAVORITES ====================

  toggleFavorite(assetId: string): boolean {
    const asset = this.state.assets[assetId];
    if (!asset) return false;

    asset.isFavorite = !asset.isFavorite;
    asset.updatedAt = new Date().toISOString();

    if (asset.isFavorite) {
      if (!this.state.favoriteAssetIds.includes(assetId)) {
        this.state.favoriteAssetIds.unshift(assetId);
      }
    } else {
      this.state.favoriteAssetIds = this.state.favoriteAssetIds.filter(
        (id) => id !== assetId
      );
    }

    this.persistAssets();
    this.persistFavorites();
    return asset.isFavorite;
  }

  getFavorites(): Asset[] {
    return this.state.favoriteAssetIds
      .map((id) => this.state.assets[id])
      .filter(Boolean);
  }

  // ==================== RECENT ====================

  private addToRecent(assetId: string): void {
    this.state.recentAssetIds = [
      assetId,
      ...this.state.recentAssetIds.filter((id) => id !== assetId),
    ].slice(0, 50); // Keep last 50
    this.persistRecent();
  }

  getRecent(limit: number = 20): Asset[] {
    return this.state.recentAssetIds
      .slice(0, limit)
      .map((id) => this.state.assets[id])
      .filter(Boolean);
  }

  // ==================== PROJECT OPERATIONS ====================

  createProject(
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'assetIds'>
  ): Project {
    const now = new Date().toISOString();
    const project: Project = {
      ...data,
      id: generateId(),
      assetIds: [],
      createdAt: now,
      updatedAt: now,
    };

    this.state.projects[project.id] = project;
    this.persistProjects();

    return project;
  }

  getProject(id: string): Project | undefined {
    return this.state.projects[id];
  }

  updateProject(
    id: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ): Project | undefined {
    const project = this.state.projects[id];
    if (!project) return undefined;

    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.projects[id] = updated;
    this.persistProjects();

    return updated;
  }

  deleteProject(id: string): boolean {
    if (!this.state.projects[id]) return false;

    delete this.state.projects[id];

    // Remove from collections
    Object.values(this.state.collections).forEach((collection) => {
      if (collection.projectIds.includes(id)) {
        collection.projectIds = collection.projectIds.filter((pid) => pid !== id);
      }
    });
    this.persistCollections();

    this.persistProjects();
    return true;
  }

  getAllProjects(): Project[] {
    return Object.values(this.state.projects);
  }

  getProjectsBySource(source: StudioSource): Project[] {
    return Object.values(this.state.projects).filter((p) => p.source === source);
  }

  getProjectsByStatus(status: Project['status']): Project[] {
    return Object.values(this.state.projects).filter((p) => p.status === status);
  }

  addAssetToProject(projectId: string, assetId: string): boolean {
    const project = this.state.projects[projectId];
    const asset = this.state.assets[assetId];
    if (!project || !asset) return false;

    if (!project.assetIds.includes(assetId)) {
      project.assetIds.push(assetId);
      project.updatedAt = new Date().toISOString();
      asset.projectId = projectId;
      this.persistProjects();
      this.persistAssets();
    }

    return true;
  }

  removeAssetFromProject(projectId: string, assetId: string): boolean {
    const project = this.state.projects[projectId];
    const asset = this.state.assets[assetId];
    if (!project) return false;

    project.assetIds = project.assetIds.filter((id) => id !== assetId);
    project.updatedAt = new Date().toISOString();

    if (asset && asset.projectId === projectId) {
      asset.projectId = undefined;
      this.persistAssets();
    }

    this.persistProjects();
    return true;
  }

  getProjectAssets(projectId: string): Asset[] {
    const project = this.state.projects[projectId];
    if (!project) return [];

    return project.assetIds
      .map((id) => this.state.assets[id])
      .filter(Boolean);
  }

  // ==================== COLLECTION OPERATIONS ====================

  createCollection(
    data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'assetIds' | 'projectIds'>
  ): Collection {
    const now = new Date().toISOString();
    const collection: Collection = {
      ...data,
      id: generateId(),
      assetIds: [],
      projectIds: [],
      createdAt: now,
      updatedAt: now,
    };

    this.state.collections[collection.id] = collection;
    this.persistCollections();

    return collection;
  }

  getCollection(id: string): Collection | undefined {
    return this.state.collections[id];
  }

  updateCollection(
    id: string,
    updates: Partial<Omit<Collection, 'id' | 'createdAt'>>
  ): Collection | undefined {
    const collection = this.state.collections[id];
    if (!collection) return undefined;

    const updated: Collection = {
      ...collection,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.collections[id] = updated;
    this.persistCollections();

    return updated;
  }

  deleteCollection(id: string): boolean {
    if (!this.state.collections[id]) return false;
    delete this.state.collections[id];
    this.persistCollections();
    return true;
  }

  getAllCollections(): Collection[] {
    return Object.values(this.state.collections);
  }

  // ==================== STATS ====================

  getStats(): {
    totalAssets: number;
    totalProjects: number;
    totalCollections: number;
    assetsByType: Record<AssetType, number>;
    assetsBySource: Record<StudioSource, number>;
  } {
    const assets = Object.values(this.state.assets);

    const assetsByType = {} as Record<AssetType, number>;
    const assetsBySource = {} as Record<StudioSource, number>;

    assets.forEach((asset) => {
      assetsByType[asset.type] = (assetsByType[asset.type] || 0) + 1;
      assetsBySource[asset.source] = (assetsBySource[asset.source] || 0) + 1;
    });

    return {
      totalAssets: assets.length,
      totalProjects: Object.keys(this.state.projects).length,
      totalCollections: Object.keys(this.state.collections).length,
      assetsByType,
      assetsBySource,
    };
  }

  // ==================== IMPORT/EXPORT ====================

  exportLibrary(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importLibrary(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as AssetLibraryState;

      // Validate structure
      if (!data.assets || !data.projects || !data.collections) {
        throw new Error('Invalid library data structure');
      }

      this.state = data;
      this.persistAssets();
      this.persistProjects();
      this.persistCollections();
      this.persistRecent();
      this.persistFavorites();

      return true;
    } catch (error) {
      console.error('Failed to import library:', error);
      return false;
    }
  }

  clearLibrary(): void {
    this.state = {
      assets: {},
      projects: {},
      collections: {},
      recentAssetIds: [],
      favoriteAssetIds: [],
    };
    this.persistAssets();
    this.persistProjects();
    this.persistCollections();
    this.persistRecent();
    this.persistFavorites();
  }
}

// ==================== SINGLETON EXPORT ====================

export const assetLibraryService = new AssetLibraryService();
export default assetLibraryService;
