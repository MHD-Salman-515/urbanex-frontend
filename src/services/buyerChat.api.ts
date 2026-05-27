import api from "@/api/axios";

export interface BuyerChatSession {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  meta?: any;
}

export const buyerChatApi = {
  createSession: (title?: string) =>
    api.post<BuyerChatSession>("/buyer/chat/sessions", { title }),

  getSessions: (limit = 20) =>
    api.get<BuyerChatSession[]>("/buyer/chat/sessions", { params: { limit } }),

  getMessages: (sessionId: number, limit = 50) =>
    api.get<BuyerChatMessage[]>(`/buyer/chat/sessions/${sessionId}/messages`, { params: { limit } }),

  sendMessage: (sessionId: number, message: string) =>
    api.post(`/buyer/chat/sessions/${sessionId}/message`, { message }),
};
