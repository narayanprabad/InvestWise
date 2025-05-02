// FileExplorerModel.ts
// The Model in MCP handles data and business logic

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  children?: FileNode[];
}

export type FileSystemAction = 
  | { type: 'NAVIGATE_TO'; payload: string }
  | { type: 'CREATE_FOLDER'; payload: { name: string; parentId: string } }
  | { type: 'CREATE_FILE'; payload: { name: string; parentId: string; size: number } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'RENAME_ITEM'; payload: { id: string; newName: string } };

export class FileExplorerModel {
  private rootNode: FileNode;
  private currentPath: string[] = [];
  private listeners: Array<(data: any) => void> = [];
  
  constructor() {
    // Initialize with a demo file structure
    this.rootNode = {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: [
        {
          id: 'documents',
          name: 'Documents',
          type: 'folder',
          children: [
            {
              id: 'report',
              name: 'Annual Report.pdf',
              type: 'file',
              size: 2500000,
              lastModified: new Date('2025-03-15')
            },
            {
              id: 'budget',
              name: 'Budget 2025.xlsx',
              type: 'file',
              size: 1500000,
              lastModified: new Date('2025-02-28')
            }
          ]
        },
        {
          id: 'images',
          name: 'Images',
          type: 'folder',
          children: [
            {
              id: 'vacation',
              name: 'Vacation Photos',
              type: 'folder',
              children: [
                {
                  id: 'beach1',
                  name: 'Beach Sunset.jpg',
                  type: 'file',
                  size: 3500000,
                  lastModified: new Date('2025-01-10')
                }
              ]
            }
          ]
        },
        {
          id: 'readme',
          name: 'README.md',
          type: 'file',
          size: 5000,
          lastModified: new Date('2025-04-01')
        }
      ]
    };
  }
  
  // Subscribe to model changes
  subscribe(listener: (data: any) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Notify all listeners of changes
  private notify() {
    const data = {
      currentContents: this.getCurrentContents(),
      currentPath: [...this.currentPath],
      breadcrumbs: this.getBreadcrumbs()
    };
    
    this.listeners.forEach(listener => listener(data));
  }
  
  // Get contents of current folder
  getCurrentContents(): FileNode[] {
    let current = this.rootNode;
    
    // Navigate to the current path
    for (const segment of this.currentPath) {
      const child = current.children?.find(c => c.id === segment);
      if (child && child.type === 'folder') {
        current = child;
      } else {
        return [];
      }
    }
    
    return current.children || [];
  }
  
  // Get breadcrumb navigation data
  getBreadcrumbs(): Array<{id: string, name: string}> {
    const breadcrumbs = [{id: 'root', name: 'Root'}];
    let current = this.rootNode;
    
    for (const segment of this.currentPath) {
      const child = current.children?.find(c => c.id === segment);
      if (child) {
        breadcrumbs.push({id: child.id, name: child.name});
        current = child;
      }
    }
    
    return breadcrumbs;
  }
  
  // Find a node by ID (used for mutations)
  private findNodeAndParent(id: string, node: FileNode = this.rootNode, parent: FileNode | null = null): 
    {node: FileNode, parent: FileNode | null} | null {
    
    if (node.id === id) {
      return {node, parent};
    }
    
    if (node.children) {
      for (const child of node.children) {
        const result = this.findNodeAndParent(id, child, node);
        if (result) return result;
      }
    }
    
    return null;
  }
  
  // Dispatch method to handle actions
  dispatch(action: FileSystemAction) {
    switch (action.type) {
      case 'NAVIGATE_TO':
        if (action.payload === 'root') {
          this.currentPath = [];
        } else if (action.payload === '..') {
          // Go up one level
          this.currentPath.pop();
        } else {
          // Ensure the target is a folder before navigating
          const current = this.getCurrentContents();
          const target = current.find(item => item.id === action.payload);
          
          if (target && target.type === 'folder') {
            this.currentPath.push(action.payload);
          }
        }
        break;
        
      case 'CREATE_FOLDER':
        const {name, parentId} = action.payload;
        const folderId = `folder-${Date.now()}`;
        
        const folderParent = this.findNodeAndParent(parentId);
        if (folderParent && folderParent.node.type === 'folder') {
          if (!folderParent.node.children) {
            folderParent.node.children = [];
          }
          
          folderParent.node.children.push({
            id: folderId,
            name,
            type: 'folder',
            children: []
          });
        }
        break;
        
      case 'CREATE_FILE':
        const {name: fileName, parentId: fileParentId, size} = action.payload;
        const fileId = `file-${Date.now()}`;
        
        const fileParent = this.findNodeAndParent(fileParentId);
        if (fileParent && fileParent.node.type === 'folder') {
          if (!fileParent.node.children) {
            fileParent.node.children = [];
          }
          
          fileParent.node.children.push({
            id: fileId,
            name: fileName,
            type: 'file',
            size,
            lastModified: new Date()
          });
        }
        break;
        
      case 'DELETE_ITEM':
        const itemToDelete = this.findNodeAndParent(action.payload);
        if (itemToDelete && itemToDelete.parent) {
          const parent = itemToDelete.parent;
          if (parent.children) {
            parent.children = parent.children.filter(child => child.id !== action.payload);
          }
        }
        break;
        
      case 'RENAME_ITEM':
        const {id, newName} = action.payload;
        const itemToRename = this.findNodeAndParent(id);
        if (itemToRename) {
          itemToRename.node.name = newName;
        }
        break;
    }
    
    // Notify listeners about the change
    this.notify();
  }
}