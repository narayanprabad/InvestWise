// FileExplorerController.ts
// The Controller in MCP coordinates between Model and Presenter

import { FileExplorerModel, FileSystemAction } from './FileExplorerModel';

export class FileExplorerController {
  private model: FileExplorerModel;
  
  constructor(model: FileExplorerModel) {
    this.model = model;
  }
  
  // Navigate to a folder
  navigateToFolder(folderId: string) {
    this.model.dispatch({
      type: 'NAVIGATE_TO',
      payload: folderId
    });
  }
  
  // Navigate up one level
  navigateUp() {
    this.model.dispatch({
      type: 'NAVIGATE_TO',
      payload: '..'
    });
  }
  
  // Navigate to root
  navigateToRoot() {
    this.model.dispatch({
      type: 'NAVIGATE_TO',
      payload: 'root'
    });
  }
  
  // Create a new folder
  createFolder(name: string, parentId: string) {
    if (!name.trim()) {
      throw new Error('Folder name cannot be empty');
    }
    
    this.model.dispatch({
      type: 'CREATE_FOLDER',
      payload: {
        name,
        parentId
      }
    });
  }
  
  // Create a new file
  createFile(name: string, parentId: string, size: number = 0) {
    if (!name.trim()) {
      throw new Error('File name cannot be empty');
    }
    
    this.model.dispatch({
      type: 'CREATE_FILE',
      payload: {
        name,
        parentId,
        size
      }
    });
  }
  
  // Delete an item
  deleteItem(itemId: string) {
    this.model.dispatch({
      type: 'DELETE_ITEM',
      payload: itemId
    });
  }
  
  // Rename an item
  renameItem(itemId: string, newName: string) {
    if (!newName.trim()) {
      throw new Error('New name cannot be empty');
    }
    
    this.model.dispatch({
      type: 'RENAME_ITEM',
      payload: {
        id: itemId,
        newName
      }
    });
  }
}