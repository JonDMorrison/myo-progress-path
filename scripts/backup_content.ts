/**
 * Content Backup Utility
 * Creates a snapshot of critical content and configuration
 */

import fs from 'fs';
import path from 'path';

interface BackupData {
  timestamp: string;
  environment: string;
  content: {
    weeks: any[];
    learn: any[];
    exercises: any[];
  };
  config: {
    learn_links: any;
    constants: any;
  };
}

async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backup: BackupData = {
    timestamp,
    environment: process.env.NODE_ENV || 'development',
    content: {
      weeks: [],
      learn: [],
      exercises: []
    },
    config: {
      learn_links: null,
      constants: null
    }
  };
  
  // Backup learn content
  const learnDir = path.join(process.cwd(), 'public/content/learn');
  if (fs.existsSync(learnDir)) {
    const learnFiles = fs.readdirSync(learnDir).filter(f => f.endsWith('.md'));
    backup.content.learn = learnFiles.map(file => ({
      filename: file,
      content: fs.readFileSync(path.join(learnDir, file), 'utf-8')
    }));
    
    // Backup index.json
    const indexPath = path.join(learnDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      backup.content.learn.push({
        filename: 'index.json',
        content: fs.readFileSync(indexPath, 'utf-8')
      });
    }
  }
  
  // Backup learn.ts config
  const learnLibPath = path.join(process.cwd(), 'src/lib/learn.ts');
  if (fs.existsSync(learnLibPath)) {
    backup.config.learn_links = fs.readFileSync(learnLibPath, 'utf-8');
  }
  
  // Backup constants if exists
  const constantsPath = path.join(process.cwd(), 'src/lib/constants.ts');
  if (fs.existsSync(constantsPath)) {
    backup.config.constants = fs.readFileSync(constantsPath, 'utf-8');
  }
  
  // Write backup file
  const backupPath = path.join(backupDir, `pre_revision_${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  
  console.log(`✅ Backup created: ${backupPath}`);
  console.log(`📦 Backed up ${backup.content.learn.length} learn files`);
  
  return backupPath;
}

async function restoreBackup(backupPath: string): Promise<void> {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }
  
  const backup: BackupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  
  console.log(`🔄 Restoring backup from ${backup.timestamp}...`);
  
  // Restore learn content
  const learnDir = path.join(process.cwd(), 'public/content/learn');
  backup.content.learn.forEach(file => {
    const filePath = path.join(learnDir, file.filename);
    fs.writeFileSync(filePath, file.content);
    console.log(`  ✓ Restored ${file.filename}`);
  });
  
  // Restore config files
  if (backup.config.learn_links) {
    const learnLibPath = path.join(process.cwd(), 'src/lib/learn.ts');
    fs.writeFileSync(learnLibPath, backup.config.learn_links);
    console.log(`  ✓ Restored learn.ts`);
  }
  
  if (backup.config.constants) {
    const constantsPath = path.join(process.cwd(), 'src/lib/constants.ts');
    fs.writeFileSync(constantsPath, backup.config.constants);
    console.log(`  ✓ Restored constants.ts`);
  }
  
  console.log(`✅ Restore complete`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'restore' && args[1]) {
    restoreBackup(args[1]).catch(console.error);
  } else {
    createBackup().catch(console.error);
  }
}

export { createBackup, restoreBackup };
