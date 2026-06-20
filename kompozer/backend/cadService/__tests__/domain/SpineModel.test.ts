import {
  SHELF_THICKNESS_MM,
  buildSpines,
  computeNextLevelMm,
  deriveSpineBom,
  resolveFirstLevelHeightsMm,
  validateColumnCandidate,
  validateSpine,
} from "../../src/domain/services/SpineModel";

describe("SpineModel", () => {
  const rules = {
    footHeightsMm: [80, 180],
    uprightHeightsMm: [80],
    terminalHeightsMm: [40],
    maxHeightMm: 260,
  };

  it("uses the fixed shelf thickness when computing the next level", () => {
    expect(
      computeNextLevelMm({
        existingLevelsMm: [80],
        candidateHeightMm: 80,
      }),
    ).toBe(80 + SHELF_THICKNESS_MM + 80);
  });

  it("builds a shared interior spine from the merged levels of adjacent columns", () => {
    const spines = buildSpines([
      { levelsMm: [80] },
      { levelsMm: [180] },
    ]);

    expect(spines).toEqual([
      { index: 0, columnIndexes: [0], levelsMm: [80] },
      { index: 1, columnIndexes: [0, 1], levelsMm: [80, 180] },
      { index: 2, columnIndexes: [1], levelsMm: [180] },
    ]);
  });

  it("validates the shared spine example with exact fit segments", () => {
    expect(validateSpine([80, 180], rules)).toEqual({
      valid: true,
      terminalHeightMm: 40,
    });
  });

  it("rejects a candidate when the shared spine split is not an exact catalog upright", () => {
    expect(
      validateColumnCandidate(
        [
          { levelsMm: [80] },
          { levelsMm: [180] },
        ],
        0,
        60,
        rules,
      ),
    ).toMatchObject({
      valid: false,
      reasonCode: "INVALID_SEGMENT",
    });
  });

  it("derives BOM data per spine", () => {
    expect(deriveSpineBom([80, 180], rules)).toEqual({
      footHeightMm: 80,
      uprightHeightsMm: [80],
      terminalHeightMm: 40,
    });
  });

  it("falls back to upright heights when the catalog has no feet", () => {
    const fallbackRules = {
      ...rules,
      footHeightsMm: [],
      uprightHeightsMm: [80, 180],
    };

    expect(resolveFirstLevelHeightsMm(fallbackRules)).toEqual([80, 180]);
    expect(validateSpine([80, 180], fallbackRules)).toEqual({
      valid: true,
      terminalHeightMm: 40,
    });
  });
});