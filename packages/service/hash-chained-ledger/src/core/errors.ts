export class HashChainedLedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HashChainedLedgerError";
  }
}

export class BalanceEquationError extends HashChainedLedgerError {
  constructor(message: string) {
    super(message);
    this.name = "BalanceEquationError";
  }
}

export class ChainTamperedError extends HashChainedLedgerError {
  readonly chainId: string;
  readonly sequence: number;
  readonly warnings: string[];

  constructor(chainId: string, sequence: number, warnings: string[]) {
    super(
      `Hash chain tampered for "${chainId}" at sequence ${sequence}: ${warnings.join("; ")}`,
    );
    this.name = "ChainTamperedError";
    this.chainId = chainId;
    this.sequence = sequence;
    this.warnings = warnings;
  }
}

export class ChainNotFoundError extends HashChainedLedgerError {
  constructor(chainId: string) {
    super(`Ledger chain "${chainId}" not found`);
    this.name = "ChainNotFoundError";
  }
}
