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

export interface InstallResult {
  results: AddonInstallResult[];
}

export type AddonInstallResult =
  | {
      status: "success";
      id: string;
    }
  | {
      status: "failure";
      file: string;
      error: string;
    };
