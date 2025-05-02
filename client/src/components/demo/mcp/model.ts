// MCP - Model Implementation

import { FSEntity, FSModel } from './types';
import { generateId } from './utils';

// Initial demo file system with sample files and directories
export function createInitialModel(): FSModel {
  const rootId = 'root';
  const docsId = generateId();
  const imagesId = generateId();
  const projectsId = generateId();
  
  const entities: Record<string, FSEntity> = {
    [rootId]: {
      id: rootId,
      name: 'Root',
      type: 'directory',
      path: '/',
      created: new Date('2025-01-01'),
      modified: new Date('2025-01-01')
    },
    [docsId]: {
      id: docsId,
      name: 'Documents',
      type: 'directory',
      path: '/Documents',
      created: new Date('2025-01-02'),
      modified: new Date('2025-01-02')
    },
    [imagesId]: {
      id: imagesId,
      name: 'Images',
      type: 'directory',
      path: '/Images',
      created: new Date('2025-01-02'),
      modified: new Date('2025-01-02')
    },
    [projectsId]: {
      id: projectsId,
      name: 'Projects',
      type: 'directory',
      path: '/Projects',
      created: new Date('2025-01-03'),
      modified: new Date('2025-01-03')
    },
    [generateId()]: {
      id: generateId(),
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      size: 2048,
      created: new Date('2025-01-04'),
      modified: new Date('2025-01-04'),
      content: '# File System Demo\n\nThis is a demo of a file system using Model Context Protocol (MCP).',
      metadata: {
        type: 'markdown',
        author: 'System'
      }
    },
    [generateId()]: {
      id: generateId(),
      name: 'Report.pdf',
      type: 'file',
      path: '/Documents/Report.pdf',
      size: 1024 * 1024 * 2.5, // 2.5 MB
      created: new Date('2025-01-05'),
      modified: new Date('2025-01-05'),
      metadata: {
        type: 'pdf',
        author: 'John Doe'
      }
    },
    [generateId()]: {
      id: generateId(),
      name: 'Budget.xlsx',
      type: 'file',
      path: '/Documents/Budget.xlsx',
      size: 1024 * 512, // 512 KB
      created: new Date('2025-01-06'),
      modified: new Date('2025-01-06'),
      metadata: {
        type: 'spreadsheet',
        author: 'Financial Team'
      }
    },
    [generateId()]: {
      id: generateId(),
      name: 'Vacation.jpg',
      type: 'file',
      path: '/Images/Vacation.jpg',
      size: 1024 * 1024 * 3.2, // 3.2 MB
      created: new Date('2025-01-07'),
      modified: new Date('2025-01-07'),
      metadata: {
        type: 'image',
        resolution: '1920x1080',
        location: 'Beach'
      }
    },
    [generateId()]: {
      id: generateId(),
      name: 'App.tsx',
      type: 'file',
      path: '/Projects/App.tsx',
      size: 4096, // 4 KB
      created: new Date('2025-01-08'),
      modified: new Date('2025-01-08'),
      content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}',
      metadata: {
        type: 'typescript',
        framework: 'React'
      }
    }
  };
  
  return {
    entities,
    rootId
  };
}

// Model operations - these manipulate the data without any UI concerns
export const modelOperations = {
  // Get all entities in a specific directory
  getDirectoryContents: (model: FSModel, path: string): FSEntity[] => {
    return Object.values(model.entities).filter(entity => {
      const entityPath = entity.path;
      const entityParentPath = entityPath.substring(0, entityPath.lastIndexOf('/'));
      return entityParentPath === path && entity.id !== model.rootId;
    });
  },
  
  // Get a specific entity by ID
  getEntity: (model: FSModel, id: string): FSEntity | undefined => {
    return model.entities[id];
  },
  
  // Get entity by path
  getEntityByPath: (model: FSModel, path: string): FSEntity | undefined => {
    return Object.values(model.entities).find(entity => entity.path === path);
  },
  
  // Create a new file
  createFile: (model: FSModel, directoryPath: string, name: string, content: string = ''): FSModel => {
    const id = generateId();
    const path = `${directoryPath}/${name}`;
    
    // Check if file already exists
    if (Object.values(model.entities).some(entity => entity.path === path)) {
      throw new Error(`File ${path} already exists`);
    }
    
    const newEntity: FSEntity = {
      id,
      name,
      type: 'file',
      path,
      size: content.length,
      created: new Date(),
      modified: new Date(),
      content
    };
    
    return {
      ...model,
      entities: {
        ...model.entities,
        [id]: newEntity
      }
    };
  },
  
  // Create a new directory
  createDirectory: (model: FSModel, parentPath: string, name: string): FSModel => {
    const id = generateId();
    const path = `${parentPath}/${name}`;
    
    // Check if directory already exists
    if (Object.values(model.entities).some(entity => entity.path === path)) {
      throw new Error(`Directory ${path} already exists`);
    }
    
    const newEntity: FSEntity = {
      id,
      name,
      type: 'directory',
      path,
      created: new Date(),
      modified: new Date()
    };
    
    return {
      ...model,
      entities: {
        ...model.entities,
        [id]: newEntity
      }
    };
  },
  
  // Delete an entity (file or directory)
  deleteEntity: (model: FSModel, id: string): FSModel => {
    const entity = model.entities[id];
    if (!entity) {
      return model;
    }
    
    // If it's the root, don't allow deletion
    if (id === model.rootId) {
      throw new Error('Cannot delete root directory');
    }
    
    // If it's a directory, also delete all contained entities
    const newEntities = { ...model.entities };
    delete newEntities[id];
    
    if (entity.type === 'directory') {
      const pathPrefix = entity.path + '/';
      
      Object.values(newEntities).forEach(e => {
        if (e.path.startsWith(pathPrefix)) {
          delete newEntities[e.id];
        }
      });
    }
    
    return {
      ...model,
      entities: newEntities
    };
  },
  
  // Rename an entity
  renameEntity: (model: FSModel, id: string, newName: string): FSModel => {
    const entity = model.entities[id];
    if (!entity) {
      return model;
    }
    
    // Cannot rename root
    if (id === model.rootId) {
      throw new Error('Cannot rename root directory');
    }
    
    const parentPath = entity.path.substring(0, entity.path.lastIndexOf('/'));
    const newPath = `${parentPath}/${newName}`;
    
    // Check if new path already exists
    if (Object.values(model.entities).some(e => e.path === newPath && e.id !== id)) {
      throw new Error(`An entity with name ${newName} already exists in this location`);
    }
    
    const updatedEntity = {
      ...entity,
      name: newName,
      path: newPath,
      modified: new Date()
    };
    
    const newEntities = {
      ...model.entities,
      [id]: updatedEntity
    };
    
    // If it's a directory, update all paths of contained entities
    if (entity.type === 'directory') {
      const oldPathPrefix = entity.path;
      const newPathPrefix = newPath;
      
      Object.values(model.entities).forEach(e => {
        if (e.id !== id && e.path.startsWith(oldPathPrefix + '/')) {
          const updatedPath = e.path.replace(oldPathPrefix, newPathPrefix);
          newEntities[e.id] = {
            ...e,
            path: updatedPath
          };
        }
      });
    }
    
    return {
      ...model,
      entities: newEntities
    };
  },
  
  // Move an entity to a new location
  moveEntity: (model: FSModel, id: string, destinationPath: string): FSModel => {
    const entity = model.entities[id];
    if (!entity) {
      return model;
    }
    
    // Cannot move root
    if (id === model.rootId) {
      throw new Error('Cannot move root directory');
    }
    
    const newPath = `${destinationPath}/${entity.name}`;
    
    // Check if destination already has an entity with the same name
    if (Object.values(model.entities).some(e => e.path === newPath)) {
      throw new Error(`An entity with name ${entity.name} already exists in the destination`);
    }
    
    const updatedEntity = {
      ...entity,
      path: newPath,
      modified: new Date()
    };
    
    const newEntities = {
      ...model.entities,
      [id]: updatedEntity
    };
    
    // If it's a directory, update all paths of contained entities
    if (entity.type === 'directory') {
      const oldPathPrefix = entity.path;
      const newPathPrefix = newPath;
      
      Object.values(model.entities).forEach(e => {
        if (e.id !== id && e.path.startsWith(oldPathPrefix + '/')) {
          const updatedPath = e.path.replace(oldPathPrefix, newPathPrefix);
          newEntities[e.id] = {
            ...e,
            path: updatedPath
          };
        }
      });
    }
    
    return {
      ...model,
      entities: newEntities
    };
  }
};