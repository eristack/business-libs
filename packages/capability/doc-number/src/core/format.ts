import { ParseMismatchError } from "./errors.js";
import { datePartsUtc } from "./period.js";
import { padSequence, parsePattern, type TokenNode } from "./tokens.js";
import type { FormatDocumentNumberInput, ParsedDocumentNumber } from "./types.js";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatDocumentNumber(input: FormatDocumentNumberInput): string {
  const at = input.at ?? new Date();
  const nodes = parsePattern(input.pattern);
  const parts = datePartsUtc(at);
  let out = "";

  for (const node of nodes) {
    switch (node.kind) {
      case "literal":
        out += node.value;
        break;
      case "YYYY":
        out += parts.YYYY;
        break;
      case "YY":
        out += parts.YY;
        break;
      case "MM":
        out += parts.MM;
        break;
      case "DD":
        out += parts.DD;
        break;
      case "SEQ":
        out += padSequence(input.sequence, node.width);
        break;
      default: {
        const _exhaustive: never = node;
        throw new Error(`Unhandled token: ${JSON.stringify(_exhaustive)}`);
      }
    }
  }

  return out;
}

export function previewDocumentNumber(input: FormatDocumentNumberInput): string {
  return formatDocumentNumber(input);
}

function buildParseRegex(nodes: TokenNode[]): {
  regex: RegExp;
  groupNames: string[];
  seqWidth: number;
} {
  let source = "^";
  const groupNames: string[] = [];
  let seqWidth = 1;

  for (const node of nodes) {
    switch (node.kind) {
      case "literal":
        source += escapeRegExp(node.value);
        break;
      case "YYYY":
        source += "(\\d{4})";
        groupNames.push("YYYY");
        break;
      case "YY":
        source += "(\\d{2})";
        groupNames.push("YY");
        break;
      case "MM":
        source += "(\\d{2})";
        groupNames.push("MM");
        break;
      case "DD":
        source += "(\\d{2})";
        groupNames.push("DD");
        break;
      case "SEQ":
        seqWidth = node.width;
        source += node.width > 1 ? `(\\d{${node.width},})` : "(\\d+)";
        groupNames.push("SEQ");
        break;
      default: {
        const _exhaustive: never = node;
        throw new Error(`Unhandled token: ${JSON.stringify(_exhaustive)}`);
      }
    }
  }

  source += "$";
  return { regex: new RegExp(source), groupNames, seqWidth };
}

export function parseDocumentNumber(
  pattern: string,
  value: string,
): ParsedDocumentNumber {
  const nodes = parsePattern(pattern);
  const { regex, groupNames, seqWidth } = buildParseRegex(nodes);
  const match = regex.exec(value);
  if (!match) {
    throw new ParseMismatchError(
      `Value "${value}" does not match pattern "${pattern}"`,
    );
  }

  const parts: Record<string, string> = {};
  let sequence = 0;

  for (let i = 0; i < groupNames.length; i++) {
    const name = groupNames[i]!;
    const captured = match[i + 1]!;
    parts[name] = captured;
    if (name === "SEQ") {
      if (seqWidth > 1 && captured.length < seqWidth) {
        throw new ParseMismatchError(
          `SEQ segment "${captured}" is shorter than width ${seqWidth}`,
        );
      }
      sequence = Number(captured);
      if (!Number.isInteger(sequence) || sequence < 0) {
        throw new ParseMismatchError(`Invalid sequence in "${value}"`);
      }
    }
  }

  return { sequence, parts };
}
