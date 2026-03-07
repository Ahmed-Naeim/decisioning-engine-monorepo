export interface Claim {
   id: string;
   text: string;
}

export function getAllowedClaims(): Claim[] {
   return [
      { id: "c1", text: "Voted #1 CRM Platform in 2026" },
      { id: "c2", text: "14-day Money Back Guarantee" },
      { id: "c3", text: "Trusted by over 10,000 global businesses" },
      { id: "c4", text: "Bank-level encryption for your data" },
   ];
}
