export const SHELF_THICKNESS_MM = 20;
export const SPINE_COMPONENT_MULTIPLIER = 2;

export type SpineReasonCode =
  | "INVALID_FIRST_LEVEL"
  | "INVALID_SEGMENT"
  | "MAX_HEIGHT_EXCEEDED"
  | "NO_TERMINAL_FIT";

export interface SpineRules {
  footHeightsMm: readonly number[];
  uprightHeightsMm: readonly number[];
  terminalHeightsMm: readonly number[];
  maxHeightMm: number;
}

export interface ColumnLevels {
  levelsMm: readonly number[];
}

export interface SpineModel {
  index: number;
  columnIndexes: readonly number[];
  levelsMm: readonly number[];
}

export interface SpineValidationResult {
  valid: boolean;
  reasonCode?: SpineReasonCode;
  reason?: string;
  terminalHeightMm?: number;
}

export interface NextLevelInput {
  existingLevelsMm: readonly number[];
  candidateHeightMm: number;
}

export interface SpineBom {
  footHeightMm: number;
  uprightHeightsMm: readonly number[];
  terminalHeightMm: number;
}

export interface ColumnSpineValidationResult {
  valid: boolean;
  spineIndex?: number;
  reasonCode?: SpineReasonCode;
  reason?: string;
}

export function computeNextLevelMm(input: NextLevelInput): number {
  const sortedLevels = sortLevels(input.existingLevelsMm);
  if (sortedLevels.length === 0) {
    return input.candidateHeightMm;
  }

  return sortedLevels[sortedLevels.length - 1] + SHELF_THICKNESS_MM + input.candidateHeightMm;
}

export function buildSpines(columnLevels: readonly ColumnLevels[]): SpineModel[] {
  const spines: SpineModel[] = [];

  for (let spineIndex = 0; spineIndex <= columnLevels.length; spineIndex += 1) {
    const columnIndexes = resolveAdjacentColumnIndexes(spineIndex, columnLevels.length);
    const levelsMm = sortLevels(
      columnIndexes.flatMap((columnIndex) => columnLevels[columnIndex]?.levelsMm ?? []),
    );

    spines.push({
      index: spineIndex,
      columnIndexes,
      levelsMm,
    });
  }

  return spines;
}

export function validateSpine(levelsMm: readonly number[], rules: SpineRules): SpineValidationResult {
  const sortedLevels = sortLevels(levelsMm);
  if (sortedLevels.length === 0) {
    return { valid: true };
  }

  if (!rules.footHeightsMm.includes(sortedLevels[0])) {
    return {
      valid: false,
      reasonCode: "INVALID_FIRST_LEVEL",
      reason: `First level ${sortedLevels[0]}mm is not a valid foot height`,
    };
  }

  for (let index = 1; index < sortedLevels.length; index += 1) {
    const previousLevel = sortedLevels[index - 1];
    const currentLevel = sortedLevels[index];
    const segmentHeight = currentLevel - previousLevel - SHELF_THICKNESS_MM;

    if (!rules.uprightHeightsMm.includes(segmentHeight)) {
      return {
        valid: false,
        reasonCode: "INVALID_SEGMENT",
        reason: `Segment ${segmentHeight}mm between ${previousLevel}mm and ${currentLevel}mm is not a valid upright height`,
      };
    }
  }

  const terminalHeightMm = pickTerminalHeight(sortedLevels[sortedLevels.length - 1], rules);
  if (terminalHeightMm == null) {
    return {
      valid: false,
      reasonCode: "NO_TERMINAL_FIT",
      reason: `No terminal fits above ${sortedLevels[sortedLevels.length - 1]}mm`,
    };
  }

  if (sortedLevels[sortedLevels.length - 1] + SHELF_THICKNESS_MM + terminalHeightMm > rules.maxHeightMm) {
    return {
      valid: false,
      reasonCode: "MAX_HEIGHT_EXCEEDED",
      reason: `Max height ${rules.maxHeightMm}mm exceeded`,
    };
  }

  return {
    valid: true,
    terminalHeightMm,
  };
}

export function validateColumnCandidate(
  columnLevels: readonly ColumnLevels[],
  columnIndex: number,
  candidateHeightMm: number,
  rules: SpineRules,
): SpineValidationResult {
  const targetColumn = columnLevels[columnIndex];
  if (!targetColumn) {
    return {
      valid: false,
      reasonCode: "INVALID_FIRST_LEVEL",
      reason: `Column ${columnIndex} does not exist`,
    };
  }

  const nextLevelMm = computeNextLevelMm({
    existingLevelsMm: targetColumn.levelsMm,
    candidateHeightMm,
  });

  const nextColumns = columnLevels.map((column, currentIndex) => {
    if (currentIndex !== columnIndex) {
      return column;
    }

    return {
      levelsMm: [...column.levelsMm, nextLevelMm],
    };
  });

  const affectedSpineIndexes = new Set<number>([columnIndex, columnIndex + 1]);
  const spines = buildSpines(nextColumns);

  for (const spine of spines) {
    if (!affectedSpineIndexes.has(spine.index)) {
      continue;
    }

    const validation = validateSpine(spine.levelsMm, rules);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
}

export function validateColumnDesigns(
  columnLevels: readonly ColumnLevels[],
  rules: SpineRules,
): ColumnSpineValidationResult {
  const spines = buildSpines(columnLevels);

  for (const spine of spines) {
    const validation = validateSpine(spine.levelsMm, rules);
    if (!validation.valid) {
      return {
        valid: false,
        spineIndex: spine.index,
        reasonCode: validation.reasonCode,
        reason: validation.reason,
      };
    }
  }

  return { valid: true };
}

export function deriveSpineBom(levelsMm: readonly number[], rules: SpineRules): SpineBom | null {
  const validation = validateSpine(levelsMm, rules);
  if (!validation.valid || validation.terminalHeightMm == null) {
    return null;
  }

  const sortedLevels = sortLevels(levelsMm);
  if (sortedLevels.length === 0) {
    return null;
  }

  return {
    footHeightMm: sortedLevels[0],
    uprightHeightsMm: sortedLevels.slice(1).map((levelMm, index) => {
      return levelMm - sortedLevels[index] - SHELF_THICKNESS_MM;
    }),
    terminalHeightMm: validation.terminalHeightMm,
  };
}

function pickTerminalHeight(topLevelMm: number, rules: SpineRules): number | null {
  const sortedTerminalHeights = [...rules.terminalHeightsMm].sort((left, right) => left - right);

  for (const terminalHeightMm of sortedTerminalHeights) {
    if (topLevelMm + SHELF_THICKNESS_MM + terminalHeightMm <= rules.maxHeightMm) {
      return terminalHeightMm;
    }
  }

  return null;
}

function resolveAdjacentColumnIndexes(spineIndex: number, columnCount: number): number[] {
  if (columnCount === 0) {
    return [];
  }

  if (spineIndex === 0) {
    return [0];
  }

  if (spineIndex === columnCount) {
    return [columnCount - 1];
  }

  return [spineIndex - 1, spineIndex];
}

function sortLevels(levelsMm: readonly number[]): number[] {
  return [...new Set(levelsMm)].sort((left, right) => left - right);
}