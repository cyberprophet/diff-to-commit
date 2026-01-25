/**
 * WARNING: This uses GitHub Copilot's internal API which is not officially
 * supported for third-party applications. Use at your own risk.
 */

const COPILOT_TOKEN_URL = "https://api.github.com/copilot_internal/v2/token";
const COPILOT_CHAT_URL = "https://api.githubcopilot.com/chat/completions";
const COPILOT_MODELS_URL = "https://api.githubcopilot.com/models";

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

export interface CopilotToken {
  token: string;
  expiresAt: number;
}

export interface CopilotChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CopilotChatResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  model?: string;
}

let cachedCopilotToken: CopilotToken | null = null;

export async function fetchCopilotToken(githubAccessToken: string): Promise<CopilotToken> {
  const response = await fetch(COPILOT_TOKEN_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${githubAccessToken}`,
      Accept: "application/json",
      "Editor-Version": "vscode/1.96.0",
      "User-Agent": "GitHubCopilotChat/0.26.0",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error("GitHub authentication failed. Please sign in again.");
    }
    if (response.status === 403) {
      throw new Error("GitHub Copilot subscription required. Please check your subscription.");
    }
    throw new Error(`Failed to get Copilot token: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    token?: string;
    expires_at?: number | string;
    expires_in?: number;
  };

  if (!data.token) {
    throw new Error("Invalid Copilot token response");
  }

  let expiresAt: number;
  if (typeof data.expires_at === "number") {
    expiresAt = data.expires_at > 1e12 ? data.expires_at : data.expires_at * 1000;
  } else if (typeof data.expires_at === "string") {
    const parsed = Date.parse(data.expires_at);
    expiresAt = isNaN(parsed) ? Date.now() + 3600000 : parsed;
  } else if (typeof data.expires_in === "number") {
    expiresAt = Date.now() + data.expires_in * 1000;
  } else {
    expiresAt = Date.now() + 3600000;
  }

  const token: CopilotToken = { token: data.token, expiresAt };
  cachedCopilotToken = token;
  return token;
}

export async function getValidCopilotToken(githubAccessToken: string): Promise<string> {
  if (
    cachedCopilotToken &&
    cachedCopilotToken.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS
  ) {
    return cachedCopilotToken.token;
  }

  const newToken = await fetchCopilotToken(githubAccessToken);
  return newToken.token;
}

export async function isCopilotAvailable(githubAccessToken: string): Promise<boolean> {
  try {
    await fetchCopilotToken(githubAccessToken);
    return true;
  } catch {
    return false;
  }
}

function buildCopilotHeaders(copilotToken: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${copilotToken}`,
    "User-Agent": "GitHubCopilotChat/0.26.0",
    "Editor-Version": "vscode/1.96.0",
    "Copilot-Integration-Id": "vscode-chat",
    "Openai-Intent": "conversation-panel",
  };
}

export async function sendCopilotChatRequest(
  githubAccessToken: string,
  messages: CopilotChatMessage[],
  model: string = "gpt-4o"
): Promise<CopilotChatResponse> {
  const copilotToken = await getValidCopilotToken(githubAccessToken);

  const response = await fetch(COPILOT_CHAT_URL, {
    method: "POST",
    headers: buildCopilotHeaders(copilotToken),
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      cachedCopilotToken = null;
      const newToken = await getValidCopilotToken(githubAccessToken);
      const retryResponse = await fetch(COPILOT_CHAT_URL, {
        method: "POST",
        headers: buildCopilotHeaders(newToken),
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!retryResponse.ok) {
        const retryText = await retryResponse.text();
        throw new Error(`Copilot API error: ${retryResponse.status} ${retryText}`);
      }

      return (await retryResponse.json()) as CopilotChatResponse;
    }
    throw new Error(`Copilot API error: ${response.status} ${text}`);
  }

  return (await response.json()) as CopilotChatResponse;
}

export async function listCopilotModels(
  githubAccessToken: string
): Promise<{ data: Array<{ id: string; name?: string }> }> {
  const copilotToken = await getValidCopilotToken(githubAccessToken);

  const response = await fetch(COPILOT_MODELS_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${copilotToken}`,
      "Content-Type": "application/json",
      "Copilot-Integration-Id": "vscode-chat",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  return (await response.json()) as { data: Array<{ id: string; name?: string }> };
}

export function clearCopilotTokenCache(): void {
  cachedCopilotToken = null;
}
