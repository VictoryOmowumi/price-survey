export const PRODUCTS = [
  "SBC 40cl",
  "NBC 35cl", 
  "CocaCola Original RGB 35cl",
  "CocaCola Original PET 35cl",
  "RC Cola 40cl",
  "LaCasera 35cl",
  "Bigi 35cl",
] as const;

export type ProductName = typeof PRODUCTS[number];
