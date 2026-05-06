/** Agent Sharing type definitions. */

export interface ShareLink {
  token: string;
  created_at: string;
  expires_at: string | null;
}

export interface ShareLinkListResponse {
  agent_name: string;
  shares: ShareLink[];
  count: number;
}

export interface CreateShareResponse {
  token: string;
  url: string;
  created_at: string;
  expires_at: string | null;
}

export interface SharedAgentView {
  agent_name: string;
  description: string;
  model: string | null;
  tool_groups: string[] | null;
  soul: string | null;
  shared_at: string;
  expires_at: string | null;
  expired: boolean;
}

export interface RevokeShareResponse {
  success: boolean;
  token: string;
}
