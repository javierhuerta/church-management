import { Request } from 'express';

export function extractApiKeyFromRequest(req: Request): string | null {
  const headerVal = req.headers?.['x-api-key'];
  if (typeof headerVal === 'string' && headerVal.trim()) {
    return headerVal.trim();
  }
  if (Array.isArray(headerVal) && headerVal[0]?.trim()) {
    return headerVal[0].trim();
  }

  const authHeader = req.headers?.authorization;
  if (typeof authHeader === 'string') {
    const trimmed = authHeader.trim();
    if (trimmed.toLowerCase().startsWith('apikey ')) {
      return trimmed.slice(7).trim() || null;
    }
    if (trimmed.toLowerCase().startsWith('bearer ch_cms_')) {
      return trimmed.slice(7).trim() || null;
    }
  }

  return null;
}
