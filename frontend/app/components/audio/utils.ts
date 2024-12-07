export function transformAudioLevel(input: number) {
  // Input validation
  if (input > 0 || input < -160) {
    throw new Error("Input must be between -160 and 0");
  }

  // Constants for input range
  const INPUT_MIN = -160;
  const INPUT_MAX = 0;
  const FOCUS_MIN = -50;
  const FOCUS_MAX = -5;

  // Constants for output range
  const OUTPUT_MIN = 5;
  const OUTPUT_MAX = 55;
  const OUTPUT_FOCUS_MIN = 20; // Allocate more range to the focus area
  const OUTPUT_FOCUS_MAX = 45;

  // Transform based on which range the input falls into
  if (input < FOCUS_MIN) {
    // Map lower range (-160 to -50) to (5 to 20)
    return mapRange(input, INPUT_MIN, FOCUS_MIN, OUTPUT_MIN, OUTPUT_FOCUS_MIN);
  } else if (input <= FOCUS_MAX) {
    // Map focus range (-50 to -5) to (20 to 45)
    return mapRange(
      input,
      FOCUS_MIN,
      FOCUS_MAX,
      OUTPUT_FOCUS_MIN,
      OUTPUT_FOCUS_MAX
    );
  } else {
    // Map upper range (-5 to 0) to (45 to 55)
    return mapRange(input, FOCUS_MAX, INPUT_MAX, OUTPUT_FOCUS_MAX, OUTPUT_MAX);
  }
}

export function transformAudioLevelWithExponentialScaling(input: number) {
  // First get the base transformation
  const baseValue = transformAudioLevel(input);

  // Normalize to 0-1 range
  const normalizedBase = (baseValue - 5) / (55 - 5);

  // Apply sigmoid transformation
  const k = 8; // Steepness of sigmoid curve
  const midpoint = 0.5; // Center point of sigmoid
  const sigmoidValue = 1 / (1 + Math.exp(-k * (normalizedBase - midpoint)));

  // Map back to original range
  return 5 + (55 - 5) * sigmoidValue;
}

// Helper function to map a value from one range to another
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

const mockData = [
  -120, -120, -44.15557861328125, -38.46628952026367, -42.41999816894531,
  -44.713863372802734, -42.62982940673828, -24.892704010009766,
  -19.77961540222168, -21.624128341674805, -18.776508331298828,
  -22.366600036621094, -19.193727493286133, -21.920007705688477,
  -25.72174835205078, -21.718612670898438, -21.944381713867188,
  -23.434335708618164, -21.763416290283203, -20.770099639892578,
  -20.05274200439453, -24.234039306640625, -29.312068939208984,
  -34.35288619995117,
];

console.log(mockData.map(transformAudioLevel));
