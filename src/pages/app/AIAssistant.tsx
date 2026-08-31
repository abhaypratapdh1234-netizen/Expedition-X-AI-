import { AICommandCenter } from './ai/AICommandCenter'

// AI Command Center — full-page task executor at /app/assistant
// The floating AIFloatingWidget (chat) remains unchanged elsewhere in the app.
export function AIAssistant() {
  return <AICommandCenter />
}
