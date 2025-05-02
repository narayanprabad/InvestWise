// Model Context Protocol (MCP) - Types

// Define the core types for our file system MCP implementation

// File System Entity Type
export type FSEntityType = 'file' | 'directory';

// File System Entity
export interface FSEntity {
  id: string;
  name: string;
  type: FSEntityType;
  path: string;
  size?: number;
  created: Date;
  modified: Date;
  content?: string;
  metadata?: Record<string, any>;
}

// File System Context
export interface FSContext {
  currentPath: string;
  selectedEntity: string | null;
  clipboard: {
    operation: 'copy' | 'cut' | null;
    entities: FSEntity[];
  };
  searchQuery: string;
  viewMode: 'list' | 'grid';
  sortBy: 'name' | 'size' | 'type' | 'modified';
  sortDirection: 'asc' | 'desc';
}

// File System Model
export interface FSModel {
  entities: Record<string, FSEntity>;
  rootId: string;
}

// Protocol Action Types
export type FSActionType = 
  | 'CREATE_FILE'
  | 'CREATE_DIRECTORY'
  | 'DELETE'
  | 'RENAME'
  | 'MOVE'
  | 'COPY'
  | 'CUT'
  | 'PASTE'
  | 'NAVIGATE'
  | 'SELECT'
  | 'SEARCH'
  | 'CHANGE_VIEW'
  | 'CHANGE_SORT';

// Protocol Action
export interface FSAction {
  type: FSActionType;
  payload: any;
}