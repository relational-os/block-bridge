export interface OSBlock {
  parent?: OSBlock | null;
  creator?: string; // does not need to be included on IPFS, but can be
  datetime?: string;
  type?: string;
  context?: string;
  content?: string;
}

export type IPFSCallback = (hash: string) => void;
export type BlockchainSubmittedCallback = () => void;
export type BlockchainConfirmedCallback = () => void;

export interface NewBlockCallbacks {
  IPFSUploadComplete: IPFSCallback;
  TxSubmitted?: BlockchainSubmittedCallback;
  TxConfirmed?: BlockchainConfirmedCallback;
}

export type BlockValidationResult = {
  valid: boolean;
  errors: [string];
};
