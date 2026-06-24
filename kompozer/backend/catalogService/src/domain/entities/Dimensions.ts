/**
 * Value object describing physical component dimensions.
 * All measurements are integer millimeters to avoid floating-point rounding
 * issues in spatial compatibility computations.
 */
export interface Dimensions {
  widthMm:  number; // width
  heightMm: number; // height
  depthMm:  number; // depth
}
