/**
 * Engine constants. Source: NIST SP 811, Appendix B.8 (International Table BTU).
 * Change only with a DECISIONS.md entry and an ENGINE_VERSION bump.
 */
export const ENGINE_VERSION = "1.0.0";

/** US refrigeration ton, exact. */
export const BTUH_PER_TON = 12_000;

/** BTU_IT/h → W (1 BTU_IT = 1,055.05585262 J). */
export const W_PER_BTUH = 0.2930710701722222;

/** 1 ft² = 0.09290304 m² (exact). */
export const FT2_PER_M2 = 10.7639104167;

/** EER (US, BTU/Wh) = COP (W/W) × this. */
export const BTU_WH_PER_W_W = 3.412141633;
