# 🤖 AI Agent Task Manager

> **A sophisticated multi-agent system demonstrating autonomous task planning and execution**

An advanced exploration of agent-driven **backend architecture** where specialized AI agents collaborate to analyze, decompose, and execute tasks autonomously. This **portfolio project** showcases system design patterns and architectural best practices, not a consumer-facing application. 

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)

---

## 👥 Who Is This For?

**This is NOT a consumer todo app.** This is an **architectural demonstration** for:
- 🎯 **Developers** exploring multi-agent systems
- 👔 **Recruiters/Interviewers** evaluating system design skills
- 🏗️ **Engineers** interested in event-driven architectures

**What you'll see:** Behind-the-scenes of how agents coordinate, not a polished end-user interface.

**Think of it as:** Watching a restaurant kitchen operate, not dining in the restaurant.

## 🎯 What Makes This Different?

This isn't a typical todo app. It's an **agent-first architecture** where:

- 🧠 **Planning Agent** autonomously analyzes user input, detects complexity, and breaks down tasks
- 🛠️ **Implementation Agent** executes individual tasks and generates outputs
- 📡 **Event-Driven Communication** enables agents to coordinate without tight coupling
- 📊 **Real-time Activity Monitoring** shows agents thinking and working in real-time

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         User Input                            │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Event Bus       │
                   │ (Observer)      │
                   └────────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Planning   │ │     Agent    │ │ Data Store   │
    │    Agent     │ │   Registry   │ │             │
    └──────┬───────┘ └──────────────┘ └──────────────┘
           │
           │ analyzes, decomposes, routes
           ▼
    ┌──────────────────┐
    │ Implementation   │
    │     Agent        │
    └──────┬───────────┘
           │
           │ executes, generates, reports
           ▼
    ┌──────────────────┐
    │   Task Output    │
    │   + Logs         │
    └──────────────────┘
```

### Core Components

| Component | Responsibility |
|-----------|----------------|
| **Planning Agent** | Task analysis, decomposition, priority assignment, routing |
| **Implementation Agent** | Task execution, code generation, progress reporting |
| **Event Bus** | Decoupled agent-to-agent communication |
| **Agent Registry** | Central registry for agent discovery and status |
| **Data Store** | In-memory storage for tasks and audit logs |

## ✨ Key Features

### 🎯 Intelligent Task Analysis
- Keyword detection for priority and complexity
- Automatic identification of task types (coding, design, documentation)
- Smart decomposition for complex requests

### 🧩 Task Decomposition Patterns
Pre-built decomposition strategies for:
- Authentication systems (7-step breakdown)
- API endpoints (5-step breakdown)
- UI components (5-step breakdown)
- Forms (5-step breakdown)
- Database schemas (4-step breakdown)

### 📡 Event-Driven Architecture
```typescript
Events:
• task.created       → Planning Agent analyzes
• task.analyzed      → Ready for assignment
• task.assigned      → Implementation Agent receives
• task.started       → Execution begins
• task.completed     → Planning Agent routes next task
• agent.idle/busy    → Status tracking
```

### 🎨 Real-Time Monitoring
- Live agent activity feed
- System status dashboard
- Task state visualization
- Agent availability tracking

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Visit http://localhost:3000
```

## 📋 Try These Examples

**How to use:** Type these into the task input and watch the **agent coordination logs** (not typical todo checkboxes).

Watch the agents in action:

| Task Input | Expected Behavior |
|------------|-------------------|
| `Build user authentication` | Decomposed into 7 subtasks (schema, login, signup, UI, validation, tests) |
| `Create login form` | Single focused implementation task |
| `Add API endpoint for users` | Breaks into route design, handlers, validation, error handling |
| `URGENT: Fix broken button` | Detects HIGH priority, routes immediately |

**You'll see:** Real-time logs showing Planning Agent analyzing → decomposing → Implementation Agent executing

## 🗂️ Project Structure

```
ai-agent-task-manager/
├── agents/
│   ├── planning-agent/
│   │   ├── index.ts              # Planning Agent implementation
│   │   ├── task-analyzer.ts      # Task analysis logic
│   │   └── task-decomposer.ts    # Decomposition strategies
│   ├── implementation-agent/
│   │   └── index.ts              # Implementation Agent
│   └── orchestrator.ts           # System coordinator
├── lib/
│   ├── types.ts                  # Core type definitions
│   ├── event-bus.ts              # Observer pattern implementation
│   ├── agent-registry.ts         # Agent management
│   ├── storage.ts                # In-memory data store
│   └── utils.ts                  # Utility functions
├── app/
│   ├── api/
│   │   ├── tasks/route.ts        # Task API endpoints
│   │   └── status/route.ts       # System status
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main UI
└── [config files]
```

## 🎓 Key Technical Concepts

This project demonstrates:

1. **Multi-Agent Coordination**: Designing loosely-coupled agents that work together autonomously
2. **Event-Driven Architecture**: Implementing the Observer pattern for scalable communication
3. **Task Decomposition**: Breaking complex problems into manageable subtasks algorithmically
4. **State Management**: Tracking distributed agent states and task lifecycles
5. **Real-Time Systems**: Building responsive UIs that reflect agent activity

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: In-memory storage (easily replaceable with DB)
- **Patterns**: Observer, Registry, Strategy

## 📦 Milestones Completed

- ✅ **Milestone 1**: Foundation & Architecture
- ✅ **Milestone 2**: Agent Infrastructure (Event Bus, Registry, Storage)
- ✅ **Milestone 3**: Planning Agent MVP
- ✅ **Milestone 4**: Implementation Agent & Integration
- ✅ **Milestone 5**: Polish & Demo (current)

## 🔮 Future Enhancements

- [ ] LLM integration (OpenAI/Claude) for smarter agents
- [ ] Persistent storage (SQLite/PostgreSQL)
- [ ] Task dependency graphs and visualization
- [ ] Agent learning from task history
- [ ] WebSocket for true real-time updates
- [ ] Multi-implementation agent support (load balancing)
- [ ] Task scheduling and deadlines

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system architecture
- [AGENT_PROJECT_SUMMARY.md](AGENT_PROJECT_SUMMARY.md) - Complete project plan
- [agents/planning-agent/SPECIFICATION.md](agents/planning-agent/SPECIFICATION.md) - Planning Agent spec
- [agents/implementation-agent/SPECIFICATION.md](agents/implementation-agent/SPECIFICATION.md) - Implementation Agent spec

## 🤝 About This Project

**Purpose:** This **portfolio project** demonstrates advanced backend architecture and system design patterns, not a production app for end users.

**What it demonstrates:**
- Autonomous agent system design
- Event-driven communication patterns (Observer pattern)
- Intelligent task decomposition strategies
- Real-time monitoring and observability
- Loose coupling and scalability principles

**What it's NOT:**
- ❌ A polished todo app for consumers
- ❌ Full CRUD app with user authentication
- ❌ Production-ready for deployment

**The Value:** Demonstrates architectural thinking and system design skills relevant to building AI-powered backend systems.

---

**Author**: Jennie Safronov  
**Type**: Portfolio Project  
**License**: MIT
