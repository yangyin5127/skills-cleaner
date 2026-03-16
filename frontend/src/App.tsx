import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GetAgents, GetSkills, GetSkillDetails, DeleteSkill } from '../wailsjs/go/main/App';
import { main } from '../wailsjs/go/models';
import geminiIcon from '../assets/gemini.svg';
import claudeIcon from '../assets/claude.svg';
import qwenIcon from '../assets/qwen.svg';
import vscodeIcon from '../assets/vscode.svg';
import antigravityIcon from '../assets/antigravity.svg';
import cursorIcon from '../assets/cursor.svg';
import codexIcon from '../assets/codex.svg';
import opencodeIcon from '../assets/opencode.svg';
import clineIcon from '../assets/cline.svg';
import windsurfIcon from '../assets/windsurf.svg';
import copilotIcon from '../assets/githubcopilot.svg';

type Agent = main.AgentConfig & { icon: string };
type Skill = main.SkillInfo;
type FileInfo = main.FileInfo;

const iconMap: Record<string, string> = {
  'gemini': geminiIcon,
  'claude': claudeIcon,
  'qwen': qwenIcon,
  'vscode': vscodeIcon,
  'antigravity': antigravityIcon,
  'cursor': cursorIcon,
  'codex': codexIcon,
  'opencode': opencodeIcon,
  'cline': clineIcon,
  'windsurf': windsurfIcon,
};

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // 加载agents
  useEffect(() => {
    loadAgents();
  }, []);

  // 当选择agent时，加载skills
  useEffect(() => {
    if (selectedAgent) {
      loadSkills(selectedAgent.path);
    } else {
      setSkills([]);
      setSelectedSkill(null);
    }
  }, [selectedAgent]);

  // 当选择skill时，加载文件
  useEffect(() => {
    if (selectedSkill) {
      loadFiles(selectedSkill.path);
    } else {
      setFiles([]);
    }
  }, [selectedSkill]);

  // 自动清除成功消息
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadAgents = async () => {
    try {
      const agentConfigs = await GetAgents();
      const agentsWithIcons: Agent[] = agentConfigs.map(agent => {
        let icon = 'code';
        switch (agent.id) {
          case 'gemini':
            icon = geminiIcon;
            break;
          case 'claude':
            icon = claudeIcon;
            break;
          case 'qwen':
            icon = qwenIcon;
            break;
          case 'opencode':
            icon = 'terminal';
            break;
        }

        return { ...agent, icon };
      });
      setAgents(agentsWithIcons);
      if (agentsWithIcons.length > 0) {
        setSelectedAgent(agentsWithIcons[0]);
      }
    } catch (err) {
      setError('Failed to load agents: ' + err);
    }
  };

  const loadSkills = async (agentPath: string) => {
    try {
      setLoading(true);
      setError('');
      const skillsList = await GetSkills(agentPath);
      const safeSkillsList = skillsList || [];
      setSkills(safeSkillsList);
      if (safeSkillsList.length > 0) {
        setSelectedSkill(safeSkillsList[0]);
      } else {
        setSelectedSkill(null);
      }
    } catch (err) {
      setError('Failed to load skills: ' + err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (skillPath: string) => {
    try {
      setLoading(true);
      setError('');
      const filesList = await GetSkillDetails(skillPath);
      setFiles(filesList || []);
    } catch (err) {
      setError('Failed to load files: ' + err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = async () => {
    if (selectedAgent) {
      await loadSkills(selectedAgent.path);
    }
  };

  const handleDeleteSkill = async () => {
    if (!selectedSkill) {
      setError('No skill selected');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      console.log('Deleting skill:', selectedSkill.path);

      await DeleteSkill(selectedSkill.path);

      console.log('Skill deleted successfully');
      setSuccessMessage(`Successfully deleted "${selectedSkill.name}"`);
      setShowDeleteConfirm(false);

      // 重新加载skills列表
      if (selectedAgent) {
        await loadSkills(selectedAgent.path);
      }
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setError('Failed to delete skill: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} mins ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (file: FileInfo): string => {
    if (file.isDir) return 'folder';
    if (file.name.endsWith('.md')) return 'description';
    if (file.name.endsWith('.json')) return 'data_object';
    if (file.name.endsWith('.js') || file.name.endsWith('.ts')) return 'javascript';
    return 'insert_drive_file';
  };

  return (
    <div className="flex h-screen overflow-hidden font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Left Sidebar: Developer Tools Navigation */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-5 flex items-center gap-2.5">
          <div className="bg-primary text-white p-1 rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined !text-lg">cleaning_services</span>
          </div>
          <h1 className="font-bold text-base tracking-tight">Skills Cleaner</h1>
        </div>

        <nav className="flex-1 px-2.5 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI AGENTS</p>
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedAgent?.id === agent.id
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              {iconMap[agent.id] ? (
                <img src={iconMap[agent.id]} alt={agent.name} className="w-5 h-5" />
              ) : (
                <span className="material-symbols-outlined !text-xl">{agent.icon}</span>
              )}
              <span>{agent.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Middle Column: Sub-navigation/Skills */}
      <div className="w-60 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
        <div className="p-5">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {selectedAgent?.name || 'Select Agent'}
          </h2>
          <p className="text-[11px] text-slate-400">Environment Skills</p>
        </div>
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
          {loading && skills.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-4">Loading...</div>
          ) : skills.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-4">No skills found</div>
          ) : (
            skills.map((skill) => (
              <button
                key={skill.path}
                onClick={() => setSelectedSkill(skill)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${selectedSkill?.path === skill.path
                  ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
              >
                <span className={`text-xs font-semibold ${selectedSkill?.path === skill.path ? 'text-primary' : ''}`}>
                  {skill.name}
                </span>
                <span className={`material-symbols-outlined !text-base transition-transform ${selectedSkill?.path === skill.path ? 'text-primary' : 'text-slate-300 dark:text-slate-600 group-hover:translate-x-1'
                  }`}>
                  chevron_right
                </span>
              </button>
            ))
          )}
        </nav>
      </div>

      {/* Main Content: File Explorer Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-background-dark overflow-hidden">
        {/* Header & Breadcrumbs */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-[11px] text-slate-400 font-medium">
              <span className="hover:text-primary cursor-pointer">Dashboard</span>
              <span className="material-symbols-outlined !text-xs mx-1 text-slate-300">chevron_right</span>
              <span className="hover:text-primary cursor-pointer">{selectedAgent?.name || 'Agent'}</span>
              <span className="material-symbols-outlined !text-xs mx-1 text-slate-300">chevron_right</span>
              <span className="text-slate-900 dark:text-slate-100">{selectedSkill?.name || 'Skill'}</span>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {/* Table Actions Area */}
        <div className="p-6 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {selectedSkill?.name || 'No Skill Selected'} files
            </h1>
            <p className="text-xs text-slate-400 mt-1">Browse skill files and manage or delete the skill.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRescan}
              disabled={loading || !selectedAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined !text-base">refresh</span>
              Rescan
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || !selectedSkill}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined !text-base">delete</span>
              Delete Skill
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Path</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Mod</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && files.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                      Loading files...
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                      {selectedSkill ? 'No files found' : 'Select a skill to view files'}
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="wait">
                    {files.map((file) => (
                      <motion.tr
                        key={file.path}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-primary !text-lg">{getFileIcon(file)}</span>
                            <span className="text-xs font-medium">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-mono text-slate-400">{file.path}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {file.isDir ? '-' : formatSize(file.size)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{formatDate(file.lastMod)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200">
                            <span className="material-symbols-outlined !text-lg">more_vert</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete Skill
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete "<span className="font-semibold text-slate-900 dark:text-slate-100">{selectedSkill?.name}</span>"?
              This action cannot be undone and will permanently remove all files in this skill.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSkill}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined !text-base">progress_activity</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-base">delete</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
