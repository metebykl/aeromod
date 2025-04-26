export interface Addon {
  id: string;
  name: string;
  creator: string;
  version: string;
  content_type: string;
  enabled: boolean;
  size: number;
}

export interface VerificationResult {
  verified: boolean;
  files: VerificationNode[];
}

export interface VerificationNode {
  status: "Ok" | "SizeMismatch" | "NotFound";
  path: string;
  size: number;
}
