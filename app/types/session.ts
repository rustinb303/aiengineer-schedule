export interface Session {
  "Session ID": string;
  Title: string;
  Description: string;
  "Session Format": string;
  Level: string;
  Scope: string;
  "Assigned Track": string;
  Room: string;
  "Scheduled At": string;
  Speakers: string;
  Companies: string;
  "Company Domains": string;
  Titles: string;
}

export interface Track {
  name: string;
  description: string;
  day: number;
  color: string;
}

export const CONFERENCE_TRACKS: Track[] = [
  // Leadership Tracks (Both Days)
  { name: "Expo Sessions and Hallway Track!", description: "Access to the World's Fair Expo", day: 0, color: "#6366F1" },
  { name: "AI Architects", description: "For senior AI leaders", day: 0, color: "#8B5CF6" },
  { name: "AI in the Fortune 500", description: "AI transformations at scale", day: 0, color: "#EC4899" },
  
  // Day 1 Tracks
  { name: "Tiny Teams", description: "Small teams with big impact", day: 1, color: "#10B981" },
  { name: "MCP", description: "Model Context Protocol", day: 1, color: "#F59E0B" },
  { name: "LLM RecSys", description: "LLMs in recommendation systems", day: 1, color: "#EF4444" },
  { name: "Agent Reliability", description: "Building reliable agents", day: 1, color: "#3B82F6" },
  { name: "AI Infrastructure", description: "Hardware and software stack", day: 1, color: "#8B5CF6" },
  { name: "Product Management", description: "AI Product Management", day: 1, color: "#10B981" },
  { name: "Voice", description: "Voice AI experiences", day: 1, color: "#F59E0B" },
  { name: "GraphRAG", description: "Knowledge graphs and RAG", day: 1, color: "#EC4899" },
  
  // Day 2 Tracks
  { name: "Retrieval + Search", description: "Augmenting LLM knowledge", day: 2, color: "#6366F1" },
  { name: "Design Engineering", description: "AI UX and design", day: 2, color: "#8B5CF6" },
  { name: "SWE Agents", description: "Autonomous software agents", day: 2, color: "#10B981" },
  { name: "Evals", description: "Evaluation systems", day: 2, color: "#F59E0B" },
  { name: "Security", description: "AI security and auth", day: 2, color: "#EF4444" },
  { name: "Generative Media", description: "Image, video, and music generation", day: 2, color: "#3B82F6" },
  { name: "Reasoning + RL", description: "Reasoning models and reinforcement learning", day: 2, color: "#EC4899" },
  { name: "Autonomy + Robotics", description: "Physical AI and robotics", day: 2, color: "#10B981" }
];