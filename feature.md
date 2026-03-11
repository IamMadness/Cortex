# ChronoLog Features

ChronoLog is a highly interactive, node-based project tracking and knowledge management tool designed with a futuristic, time-machine aesthetic. It allows users to create interconnected timelines of information (Temporal Logs) organized into distinct workspaces (Project Timelines).

## Core Architecture

- **Local-First Storage**: Built on top of IndexedDB using `Dexie.js`, ensuring all data is stored locally in the browser for maximum privacy and offline capability.
- **Real-time Reactivity**: The UI updates instantaneously as data changes, providing a seamless, fluid experience without page reloads.
- **Temporal UI/UX**: Features a dark, neon-accented theme with smooth animations powered by `motion/react`, resembling a futuristic temporal interface.

## Project Timelines (Workspaces)

Project Timelines act as the top-level containers for your projects, similar to folders or workspaces.

- **Initialize Project Timeline**: Create a new, isolated workspace for a specific topic or project.
- **Rename Timeline**: Edit the name of the active timeline directly from the top header.
- **Tag Timelines**: Add custom tags to timelines in the sidebar for better organization.
- **Dissolve Timeline**: Delete an entire timeline. This features a two-step confirmation (click once to arm, click again to confirm) to prevent accidental data loss. Deleting a timeline automatically purges all logs within it.
- **Purge Data**: A global reset button in the sidebar footer that wipes the entire database (all timelines and all logs).

## Temporal Logs (Nodes)

Temporal Logs are the individual blocks of thought, tasks, or milestones within a timeline. They are organized hierarchically.

- **Log Primary Event**: Create a new root-level log at the bottom of the current timeline.
- **Branch Timeline**: Add a child log to an existing log, creating a hierarchical branch of tasks or events.
- **Markdown Support**: Logs support full Markdown formatting (via `react-markdown` and `remark-gfm`), including bold, italics, lists, code blocks, and tables. Click a log to edit, and click away or press `Enter` to save and render.
- **Color Coding**: Click the palette icon on any log to cycle through four distinct neon theme colors (Cyan, Pink, Gold, Purple) to visually categorize states (e.g., Active, Pending, Critical).
- **Tagging**: Add specific tags to individual logs. Tags are displayed as small, glowing pills. Hover over a tag to reveal a removal button.
- **Erase Log (Recursive Delete)**: Delete a log. Like timelines, this features a two-step confirmation. **Crucially, deleting a log recursively deletes all of its child branches**, ensuring no orphaned data remains in the database.
- **Infinite Nesting Support**: The timeline view supports horizontal scrolling, allowing you to nest branches as deeply as needed without breaking the UI.

## Focus Modes

When dealing with complex, deeply nested project structures, Focus Modes help reduce cognitive load by visually isolating specific parts of the network.

- **Isolate Epoch (Eye Icon)**: Isolates all logs that exist at the exact same hierarchical depth as the selected log. All other logs are dimmed, blurred, and made unclickable.
- **Isolate Timeline (GitBranch Icon)**: Isolates the selected log and its entire lineage of descendants (children, grandchildren, etc.). The rest of the tree is dimmed.
- **Reset Focus**: A prominent button appears in the top header whenever a focus mode is active, allowing you to instantly return to the full, unfiltered view of the timeline.
- **Toggle Focus**: Clicking an active focus button on a log will toggle the focus off.

## Search and Navigation

- **Global Command Palette (⌘K)**: A quick-access modal for global actions like creating new timelines or purging data.
- **Thread Search**: A prominent search bar in the top header allows you to filter the currently active timeline.
- **Path-Aware Filtering**: The search logic is intelligent. If a deeply nested child log matches your search query, the system will keep its parent logs visible (even if they don't match the query) so you maintain the structural context of the matching task.
- **Quick Clear**: An 'X' button appears in the search bar when text is entered, allowing for rapid clearing of the search query.
