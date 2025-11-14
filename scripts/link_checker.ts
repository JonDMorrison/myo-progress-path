/**
 * Link Checker Utility
 * Validates internal links in Learn Hub content
 */

import fs from 'fs';
import path from 'path';

interface LinkIssue {
  file: string;
  line: number;
  link: string;
  issue: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'public/content/learn');
const LEARN_LIB = path.join(process.cwd(), 'src/lib/learn.ts');

async function checkLinks(): Promise<LinkIssue[]> {
  const issues: LinkIssue[] = [];
  
  // Get all markdown files
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  
  // Load learn.ts to check week mappings
  const learnContent = fs.readFileSync(LEARN_LIB, 'utf-8');
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      // Check for markdown links
      const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
      
      for (const match of linkMatches) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        // Check for placeholder links
        if (linkUrl === '#' || linkUrl.startsWith('#') && linkUrl.length === 1) {
          issues.push({
            file,
            line: idx + 1,
            link: linkUrl,
            issue: 'Placeholder link (empty anchor)'
          });
        }
        
        // Check for broken internal anchors
        if (linkUrl.startsWith('#')) {
          const anchor = linkUrl.slice(1);
          const headingExists = lines.some(l => {
            const heading = l.match(/^#+\s+(.+)$/);
            if (!heading) return false;
            const headingAnchor = heading[1]
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return headingAnchor === anchor;
          });
          
          if (!headingExists) {
            issues.push({
              file,
              line: idx + 1,
              link: linkUrl,
              issue: 'Anchor does not match any heading'
            });
          }
        }
      }
    });
  });
  
  return issues;
}

async function checkWeekLinks(): Promise<LinkIssue[]> {
  const issues: LinkIssue[] = [];
  const learnContent = fs.readFileSync(LEARN_LIB, 'utf-8');
  
  // Extract learnLinksByWeek object
  const weekLinksMatch = learnContent.match(/learnLinksByWeek[^{]*({[\s\S]+?})/);
  if (!weekLinksMatch) {
    issues.push({
      file: 'learn.ts',
      line: 0,
      link: '',
      issue: 'Could not parse learnLinksByWeek'
    });
    return issues;
  }
  
  // Check each slug reference
  const slugMatches = weekLinksMatch[1].matchAll(/"([^"#]+)(#[^"]+)?"/g);
  
  for (const match of slugMatches) {
    const slug = match[1];
    const anchor = match[2];
    
    // Check if file exists
    const mdFile = path.join(CONTENT_DIR, `${slug}.md`);
    if (!fs.existsSync(mdFile)) {
      issues.push({
        file: 'learn.ts',
        line: 0,
        link: `${slug}${anchor || ''}`,
        issue: `File ${slug}.md does not exist`
      });
      continue;
    }
    
    // Check if anchor exists
    if (anchor) {
      const content = fs.readFileSync(mdFile, 'utf-8');
      const anchorId = anchor.slice(1);
      const headingExists = content.split('\n').some(line => {
        const heading = line.match(/^#+\s+(.+)$/);
        if (!heading) return false;
        const headingAnchor = heading[1]
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        return headingAnchor === anchorId;
      });
      
      if (!headingExists) {
        issues.push({
          file: 'learn.ts',
          line: 0,
          link: `${slug}${anchor}`,
          issue: `Anchor ${anchor} not found in ${slug}.md`
        });
      }
    }
  }
  
  return issues;
}

async function main() {
  console.log('🔍 Checking Learn Hub links...\n');
  
  const contentIssues = await checkLinks();
  const weekIssues = await checkWeekLinks();
  
  const allIssues = [...contentIssues, ...weekIssues];
  
  if (allIssues.length === 0) {
    console.log('✅ All links validated successfully!\n');
    return;
  }
  
  console.log(`⚠️  Found ${allIssues.length} issue(s):\n`);
  
  allIssues.forEach(issue => {
    console.log(`${issue.file}:${issue.line}`);
    console.log(`  Link: ${issue.link}`);
    console.log(`  Issue: ${issue.issue}\n`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

export { checkLinks, checkWeekLinks };
