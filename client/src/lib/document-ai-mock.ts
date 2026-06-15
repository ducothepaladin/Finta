import type { DocumentHistoryItem } from "@/types/document"

export const MOCK_HISTORY_ITEMS: DocumentHistoryItem[] = [
  {
    id: "h1",
    kind: "note",
    text: "Key point about methodology section",
    pageNumber: 2,
  },
  {
    id: "h2",
    kind: "translate",
    text: "Thai → English · legal terminology clause",
    pageNumber: 4,
  },
  {
    id: "h3",
    kind: "summary",
    text: "Overview of research findings paragraph",
    pageNumber: 2,
  },
  {
    id: "h4",
    kind: "note",
    text: "Follow up on this reference later",
    pageNumber: 1,
  },
  {
    id: "h5",
    kind: "summary",
    text: "Introduction section brief overview",
    pageNumber: 1,
  },
]

export const CHAT_SUGGESTIONS = [
  "What is the main argument here?",
  "Summarize this page",
  "Explain the highlighted text",
] as const

const AI_RESPONSES: Record<string, string> = {
  "What is the main argument here?":
    "The main argument on this page is that contextual interpretation of legal documents is essential. The author contends that applying purely literal readings leads to inconsistent outcomes, especially in cross-border agreements where terminology carries different weight across jurisdictions.",
  "Summarize this page":
    "Page 2 introduces the study's core methodology — a qualitative analysis of primary legal documents. It outlines three evaluation criteria: clarity of language, alignment with original intent, and regulatory compliance. The page concludes that existing frameworks are insufficient for digital-first environments.",
  "Explain the highlighted text":
    "The highlighted passage refers to a liability clause that limits recoverable damages to direct losses only, explicitly excluding consequential or indirect claims. This is a standard limitation-of-liability provision common in commercial contracts.",
}

const GENERIC_RESPONSES = [
  "Based on the content of this page, the passage discusses the methodological framework used to evaluate cross-jurisdictional legal clauses, emphasizing the importance of contextual analysis over strict literal interpretation.",
  "This section bridges the literature review and the empirical findings. The author summarizes existing research gaps and positions the study's approach as a novel contribution to the field.",
  "The text on this page introduces a structured three-step evaluation model. Each step builds on the previous, creating a hierarchical framework for clause validity assessment.",
  "This paragraph appears to be responding to a counterargument. The author acknowledges alternative interpretations but argues that purposive reading better serves the underlying contractual intent.",
  "The highlighted portions on this page mark key definitional terms that are used throughout the remainder of the document. Understanding these definitions is critical for interpreting later clauses.",
]

let genericIndex = 0

export function getMockChatReply(text: string): string {
  const trimmed = text.trim()
  if (AI_RESPONSES[trimmed]) return AI_RESPONSES[trimmed]
  const reply = GENERIC_RESPONSES[genericIndex % GENERIC_RESPONSES.length]
  genericIndex += 1
  return reply
}

export function createHistoryId(): string {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createChatMessageId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
