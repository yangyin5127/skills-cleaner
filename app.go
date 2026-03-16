package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type AgentConfig struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Path string `json:"path"`
}

type SkillInfo struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

type FileInfo struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Size    int64  `json:"size"`
	LastMod string `json:"lastMod"`
	IsDir   bool   `json:"isDir"`
}

func (a *App) GetAgents() []AgentConfig {
	home, _ := os.UserHomeDir()

	// 定义所有可能的 agents
	candidates := []struct {
		ID      string
		Name    string
		BaseDir string
	}{
		{ID: "claude", Name: "Claude Code", BaseDir: ".claude"},
		{ID: "vscode", Name: "Visual Studio Code", BaseDir: ".copilot"},
		{ID: "cursor", Name: "Cursor", BaseDir: ".cursor"},
		{ID: "antigravity", Name: "Antigravity", BaseDir: ".antigravity"},
		{ID: "codex", Name: "Codex", BaseDir: ".codex"},
		{ID: "gemini", Name: "Gemini CLI", BaseDir: ".gemini"},
		{ID: "windsurf", Name: "Windsurf", BaseDir: ".codeium/windsurf"},
		{ID: "qwen", Name: "Qwen Code", BaseDir: ".qwen_code"},
		{ID: "opencode", Name: "Open Code", BaseDir: ".config/opencode"},
		{ID: "cline", Name: "Cline", BaseDir: ".cline"},
	}

	var agents []AgentConfig
	for _, candidate := range candidates {
		// 检查根目录是否存在
		basePath := filepath.Join(home, candidate.BaseDir)
		if _, err := os.Stat(basePath); err == nil {
			agents = append(agents, AgentConfig{
				ID:   candidate.ID,
				Name: candidate.Name,
				Path: filepath.Join(home, candidate.BaseDir, "skills/"),
			})
		}
	}

	return agents
}

func (a *App) GetSkills(agentPath string) ([]SkillInfo, error) {
	var skills []SkillInfo
	entries, err := os.ReadDir(agentPath)
	if err != nil {
		if os.IsNotExist(err) {
			return skills, nil
		}
		return nil, err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			skills = append(skills, SkillInfo{
				Name: entry.Name(),
				Path: filepath.Join(agentPath, entry.Name()),
			})
		}
	}
	return skills, nil
}

func (a *App) GetSkillDetails(skillPath string) ([]FileInfo, error) {
	var files []FileInfo
	entries, err := os.ReadDir(skillPath)
	if err != nil {
		if os.IsNotExist(err) {
			return files, nil
		}
		return files, err
	}

	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		path := filepath.Join(skillPath, entry.Name())
		name := entry.Name()
		if entry.IsDir() {
			name += "/"
		}
		files = append(files, FileInfo{
			Name:    name,
			Path:    path,
			Size:    info.Size(),
			LastMod: info.ModTime().Format(time.RFC3339),
			IsDir:   entry.IsDir(),
		})
	}
	return files, nil
}

func (a *App) DeleteSkill(skillPath string) error {
	// 验证路径存在
	if _, err := os.Stat(skillPath); os.IsNotExist(err) {
		return fmt.Errorf("skill path does not exist: %s", skillPath)
	}

	// 删除整个目录
	err := os.RemoveAll(skillPath)
	if err != nil {
		return fmt.Errorf("failed to delete skill: %w", err)
	}

	return nil
}
