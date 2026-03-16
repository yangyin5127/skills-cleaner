export interface SkillFile {
  id: string;
  name: string;
  path: string;
  size: string;
  lastMod: string;
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export const AGENTS: Agent[] = [
  { id: 'claude', name: 'Claude', icon: 'terminal', category: 'AI AGENTS' },
  { id: 'vscode', name: 'VS Code', icon: 'code', category: 'DEVELOPER TOOLS' },
  { id: 'docker', name: 'Docker', icon: 'package_2', category: 'DEVELOPER TOOLS' },
  { id: 'antigravity', name: 'Antigravity', icon: 'air', category: 'DEVELOPER TOOLS' },
];

export const SKILLS: Skill[] = [
  { id: 'skill-1', name: 'Skill 1' },
  { id: 'skill-2', name: 'Skill 2' },
  { id: 'skill-3', name: 'Skill 3' },
  { id: 'skill-4', name: 'Skill 4' },
];

export const SKILL_FILES: Record<string, SkillFile[]> = {
  'skill-1': [
    { id: '1', name: 'SKILL.md', path: '/claude/skills/skill_1/logs/', size: '124 KB', lastMod: '2 mins ago', icon: 'description' },
    { id: '2', name: 'scripts/', path: '/claude/skills/skill_1/cache/', size: '45.2 MB', lastMod: '1 hour ago', icon: 'folder_zip' },
    { id: '3', name: 'references/', path: '/claude/skills/skill_1/dist/', size: '8 KB', lastMod: 'Yesterday', icon: 'javascript' },
    { id: '4', name: 'metadata.json', path: '/claude/skills/skill_1/', size: '2.1 KB', lastMod: '3 days ago', icon: 'data_object' },
  ],
};
