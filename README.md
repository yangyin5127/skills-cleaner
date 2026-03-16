# Skills Cleaner

English | [简体中文](./README_CN.md)

A desktop application for  cleaning AI Agent Skills.

![preview](./preview/ui.png)

## Features

- 🔍 **Multiple Agent Support**: Supports Claude Code, Visual Studio Code, Cursor, Antigravity, and more AI Agents
- 📁 **Visual Management**: Intuitively browse all Skills and their files under each Agent
- 🗑️ **Quick Delete**: One-click delete unwanted Skills
- 🔄 **Real-time Refresh**: Use the "Rescan" button to refresh the current Agent's Skills list

## Tech Stack

- **Backend**: Go + Wails v2
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Motion (Framer Motion)
- **UI Components**: Material Symbols Icons

## Quick Start

### Requirements

- Go 1.18+
- Node.js 20+
- Wails v2

### Development Mode

1. Clone the project and enter the directory:
```bash
cd skills-cleaner
```

2. Install frontend dependencies:
```bash
cd frontend && npm install
```

3. Start the development server:
```bash
cd .. && wails dev
```

The application will start in development mode with hot reload support. Frontend dev server: http://localhost:34115

### Build for Production

```bash
wails build
```

After building, the executable will be located in the `build/bin/` directory.

## Usage

1. After launching the app, the left sidebar shows a list of supported AI Agents
2. Select an Agent, and the middle panel will display all installed Skills for that Agent
3. Click on a Skill, and the right panel will show all files and details for that Skill
4. To delete a Skill, click the "Delete Skill" button in the top right corner
5. Use the "Rescan" button to refresh the current Agent's Skills list

## Supported Agent Paths

- **Claude Code**: `~/.claude/skills/`
- **Visual Studio Code**: `~/.copilot/skills/`
- **Cursor**: `~/.cursor/skills/`
- **Antigravity**: `~/.antigravity/skills/`
- more ...

## Project Structure

```
skills-cleaner/
├── app.go              # Go backend logic
├── main.go             # Application entry point
├── frontend/           # React frontend
│   ├── src/
│   │   ├── App.tsx     # Main application component
│   │   └── ...
│   └── ...
└── build/              # Build output directory
```

## Development

### Modifying Configuration

Edit `wails.json` to configure project settings.

### Frontend Development

The frontend uses Vite as the build tool with Hot Module Replacement (HMR) support. Frontend code changes will auto-refresh in development mode.

### Backend Development

After modifying Go code, you need to restart `wails dev` to apply changes.

## License

MIT
