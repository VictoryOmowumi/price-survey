export const PRODUCTS = [
  "SBC 40cl",
  "NBC 40cl", 
  "RC Cola 40cl",
  "Pop Cola 40cl",
  "Bigi 40cl",
] as const;

export type ProductName = typeof PRODUCTS[number];
