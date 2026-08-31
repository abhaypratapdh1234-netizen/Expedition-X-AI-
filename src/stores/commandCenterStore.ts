// commandCenterStore.ts
// Zustand store for the AI Command Center — command history, active run state, AI memory, approval gate.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type StepStatus = 'pending' | 'running' | 'done' | 'failed'
export type CommandStatus = 'pending' | 'running' | 'awaiting_approval' | 'done' | 'failed'
export type StepType = 'api_call' | 'db_query' | 'algorithm' | 'approval_gate'

export interface StepLog {
  id: string
  name: string
  type: StepType
  status: StepStatus
  input?: unknown
  output?: unknown
  durationMs?: number
  startedAt?: Date
  completedAt?: Date
}

export interface CommandRun {
  id: string
  rawText: string
  detectedIntent: string
  intentLabel: string       // Human-readable label e.g. "🌤 Weather Lookup"
  confidence: number        // 0–1
  slots: Record<string, string>
  status: CommandStatus
  steps: StepLog[]
  createdAt: Date
  completedAt?: Date
  result?: unknown          // final structured result (weather obj, hotel list, etc.)
  errorMessage?: string
}

// AI memory: plain key-value preference store
export interface AIMemory {
  home_city?: string
  preferred_budget_tier?: 'budget' | 'mid-range' | 'luxury'
  avg_trip_duration?: number
  travel_style?: string
  last_destination?: string
  currency?: string
}

interface CommandCenterState {
  // History (persisted, capped at 50)
  commands: CommandRun[]

  // Currently active (running or awaiting approval) command
  activeCommandId: string | null

  // AI Memory (persisted)
  memory: AIMemory

  // Actions
  addCommand: (cmd: CommandRun) => void
  updateCommand: (id: string, patch: Partial<CommandRun>) => void
  updateStep: (commandId: string, stepId: string, patch: Partial<StepLog>) => void
  setActiveCommand: (id: string | null) => void
  approveActiveGate: () => void
  rejectActiveGate: () => void
  updateMemory: (patch: Partial<AIMemory>) => void
  clearHistory: () => void

  // Approval gate promise resolver (not persisted)
  _gateResolve: ((approved: boolean) => void) | null
  _setGateResolve: (fn: ((approved: boolean) => void) | null) => void
}

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

export const useCommandCenterStore = create<CommandCenterState>()(
  persist(
    (set, get) => ({
      commands: [],
      activeCommandId: null,
      memory: {},
      _gateResolve: null,

      addCommand: (cmd) =>
        set((s) => ({
          commands: [cmd, ...s.commands].slice(0, 50),
          activeCommandId: cmd.id,
        })),

      updateCommand: (id, patch) =>
        set((s) => ({
          commands: s.commands.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      updateStep: (commandId, stepId, patch) =>
        set((s) => ({
          commands: s.commands.map((c) =>
            c.id === commandId
              ? {
                  ...c,
                  steps: c.steps.map((step) =>
                    step.id === stepId ? { ...step, ...patch } : step
                  ),
                }
              : c
          ),
        })),

      setActiveCommand: (id) => set({ activeCommandId: id }),

      approveActiveGate: () => {
        const { _gateResolve } = get()
        _gateResolve?.(true)
        set({ _gateResolve: null })
      },

      rejectActiveGate: () => {
        const { _gateResolve } = get()
        _gateResolve?.(false)
        set({ _gateResolve: null })
      },

      updateMemory: (patch) =>
        set((s) => ({ memory: { ...s.memory, ...patch } })),

      clearHistory: () => set({ commands: [], activeCommandId: null }),

      _setGateResolve: (fn) => set({ _gateResolve: fn }),
    }),
    {
      name: 'expedition-x-command-center',
      // Don't persist the gate resolver function
      partialize: (s) => ({
        commands: s.commands,
        memory: s.memory,
      }),
    }
  )
)
