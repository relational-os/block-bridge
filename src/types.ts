export interface Block {
  parent: Block | null;
  //   creator: string; QUESTION DOES THIS FIELD NEED TO BE INCLUDED?
  datetime?: string;
  type: string;
  context: string;
  content: string;
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
