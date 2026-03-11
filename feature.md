# NeuralCortex Features

NeuralCortex is a highly interactive, node-based thought mapping and knowledge management tool designed with a futuristic, cybernetic aesthetic. It allows users to create interconnected clusters of information (Neurons) organized into distinct workspaces (Synaptic Clusters).

## Core Architecture

- **Local-First Storage**: Built on top of IndexedDB using `Dexie.js`, ensuring all data is stored locally in the browser for maximum privacy and offline capability.
- **Real-time Reactivity**: The UI updates instantaneously as data changes, providing a seamless, fluid experience without page reloads.
- **Cybernetic UI/UX**: Features a dark, neon-accented theme with smooth animations powered by `motion/react`.

## Synaptic Clusters (Workspaces)

Synaptic Clusters act as the top-level containers for your thoughts, similar to folders or workspaces.

- **Initialize Cluster**: Create a new, isolated workspace for a specific topic or project.
- **Rename Cluster**: Edit the name of the active cluster directly from the top header.
- **Tag Clusters**: Add custom tags to clusters in the sidebar for better organization.
- **Dissolve Cluster**: Delete an entire cluster. This features a two-step confirmation (click once to arm, click again to confirm) to prevent accidental data loss. Deleting a cluster automatically purges all neurons within it.
- **Purge Cortex**: A global reset button in the sidebar footer that wipes the entire database (all clusters and all neurons).

## Neurons (Nodes)

Neurons are the individual blocks of thought or information within a cluster. They are organized hierarchically.

- **Initialize Neuron Soma**: Create a new root-level neuron at the bottom of the current cluster.
- **Create Synapse**: Add a child neuron to an existing neuron, creating a hierarchical branch of thought.
- **Markdown Support**: Neurons support full Markdown formatting (via `react-markdown` and `remark-gfm`), including bold, italics, lists, code blocks, and tables. Click a neuron to edit, and click away or press `Enter` to save and render.
- **Color Coding**: Click the palette icon on any neuron to cycle through four distinct neon theme colors (Cyan, Pink, Gold, Purple) to visually categorize thoughts.
- **Tagging**: Add specific tags to individual neurons. Tags are displayed as small, glowing pills. Hover over a tag to reveal a removal button.
- **Sever Connection (Recursive Delete)**: Delete a neuron. Like clusters, this features a two-step confirmation. **Crucially, deleting a neuron recursively deletes all of its child synapses**, ensuring no orphaned data remains in the database.

## Focus Modes

When dealing with complex, deeply nested thought structures, Focus Modes help reduce cognitive load by visually isolating specific parts of the network.

- **Level Focus (Eye Icon)**: Isolates all neurons that exist at the exact same hierarchical depth as the selected neuron. All other neurons are dimmed, blurred, and made unclickable.
- **Branch Focus (GitBranch Icon)**: Isolates the selected neuron and its entire lineage of descendants (children, grandchildren, etc.). The rest of the tree is dimmed.
- **Reset Focus**: A prominent button appears in the top header whenever a focus mode is active, allowing you to instantly return to the full, unfiltered view of the cluster.
- **Toggle Focus**: Clicking an active focus button on a neuron will toggle the focus off.

## Search and Navigation

- **Global Command Palette (⌘K)**: A quick-access modal for global actions like creating new clusters or purging data.
- **Thread Search**: A prominent search bar in the top header allows you to filter the currently active cluster.
- **Path-Aware Filtering**: The search logic is intelligent. If a deeply nested child neuron matches your search query, the system will keep its parent neurons visible (even if they don't match the query) so you maintain the structural context of the matching thought.
- **Quick Clear**: An 'X' button appears in the search bar when text is entered, allowing for rapid clearing of the search query.
