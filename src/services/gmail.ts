import { getAccessToken } from './googleAuth';

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  from?: string;
  to?: string;
  subject?: string;
  date?: string;
  isUnread?: boolean;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
}

/**
 * Encodes a string to RFC 4648 Base64URL safe format
 */
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Fetch the authenticated user's Gmail profile
 */
export async function getGmailProfile(): Promise<GmailProfile> {
  const token = await getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'فشل جلب ملف حساب Gmail');
  }

  return res.json();
}

/**
 * List messages with optional search query (e.g. from teacher or unread)
 */
export async function listGmailMessages(query = '', maxResults = 15): Promise<GmailMessageSummary[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const params = new URLSearchParams({
    maxResults: maxResults.toString(),
  });
  if (query) {
    params.append('q', query);
  }

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!listRes.ok) {
    const errorData = await listRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'فشل جلب قائمة رسائل Gmail');
  }

  const listData = await listRes.json();
  const messages: { id: string; threadId: string }[] = listData.messages || [];

  if (messages.length === 0) {
    return [];
  }

  // Fetch details in parallel for the retrieved messages
  const messageDetails: (GmailMessageSummary | null)[] = await Promise.all(
    messages.slice(0, maxResults).map(async (msg): Promise<GmailMessageSummary | null> => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!detailRes.ok) return null;
        const data = await detailRes.json();

        const headers: Array<{ name: string; value: string }> = data.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(بدون عنوان)';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || '';
        const to = headers.find((h) => h.name.toLowerCase() === 'to')?.value || '';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';
        const isUnread = (data.labelIds || []).includes('UNREAD');

        return {
          id: data.id,
          threadId: data.threadId,
          snippet: data.snippet,
          from,
          to,
          subject,
          date,
          isUnread,
        };
      } catch {
        return null;
      }
    })
  );

  return messageDetails.filter((m): m is GmailMessageSummary => m !== null);
}

/**
 * Send an email via Gmail API
 * Note: Caller MUST display an explicit user confirmation dialog beforehand.
 */
export async function sendGmailEmail(options: {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}): Promise<{ id: string; threadId: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const contentType = options.isHtml ? 'text/html; charset=UTF-8' : 'text/plain; charset=UTF-8';

  // Construct RFC 2822 email
  const emailLines = [
    `To: ${options.to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(options.subject)))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: ${contentType}`,
    '',
    options.body,
  ];

  const rawMessage = emailLines.join('\r\n');
  const base64UrlMessage = base64UrlEncode(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64UrlMessage }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'فشل إرسال البريد الإلكتروني عبر Gmail');
  }

  return res.json();
}
