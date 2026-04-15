---
name: bpom-compliance
description: BPOM (Badan Pengawas Obat dan Makanan) product registration tracker — data models, compliance checklists, e-BPOM integration, and product recall monitoring for Indonesian food/drug/cosmetic apps
user-invocable: true
version: 1.0.0
---

# BPOM Compliance

Generate BPOM product registration and compliance code for Indonesian applications dealing with food, drugs, cosmetics, or supplements.

---

## Phase 1: Scope Detection

Read `package.json`, project files, and `.planning/` to determine:
- Product categories: Makanan (food), Obat (drugs), Kosmetik (cosmetics), Suplemen (supplements), Obat Tradisional (traditional medicine)
- Existing data models and schemas
- Database ORM (Prisma/Drizzle/TypeORM)

## Phase 2: Data Model Generation

Generate schema/models for:

```typescript
// Product Registration
interface BPOMRegistration {
  id: string;
  productName: string;
  registrationNumber: string; // MD/ML for food, DKL/DKI for drugs, CD/CL for cosmetics
  category: 'makanan' | 'obat' | 'kosmetik' | 'suplemen' | 'obat_tradisional';
  registrationType: 'dalam_negeri' | 'impor'; // MD=domestic, ML=import
  registrationDate: Date;
  expiryDate: Date; // Usually 5 years
  status: 'draft' | 'submitted' | 'review' | 'approved' | 'expired' | 'recalled';
  applicant: {
    companyName: string;
    npwp: string;
    address: string;
    apothecaryLicense?: string; // SIPA for drug products
  };
  productDetails: {
    composition: string[];
    dosageForm?: string;
    packaging: string;
    shelfLife: number; // months
    storageConditions: string;
    manufacturer: string;
    manufacturerCountry: string;
  };
  labResults?: {
    testDate: Date;
    laboratory: string;
    results: Record<string, string>;
    passed: boolean;
  };
}
```

## Phase 3: Compliance Checklists

Generate checklist data per category:
- **Food (MD/ML)**: composition safety, labeling (BPOM regulation No. 31/2018), nutrition facts, halal declaration cross-reference
- **Drugs (DKL/DKI)**: clinical trial data, GMP certification, pharmacovigilance plan
- **Cosmetics (CD/CL)**: ingredient safety (negative list per BPOM regulation), CPKB (Good Cosmetic Manufacturing Practice)
- **Supplements**: health claims verification, max dosage limits

## Phase 4: Expiry Notification Logic

Generate cron/scheduler code for:
- 90-day pre-expiry warning
- 30-day urgent renewal reminder
- Expired product auto-flagging
- Recall alert processing

## Phase 5: e-BPOM Integration Stubs

Generate API client stubs for:
- e-BPOM registration portal data structures
- Product search/verification against public BPOM database (https://cekbpom.pom.go.id/)
- Registration status tracking
- Recall notification webhooks

## Phase 6: Cross-reference

- Link with halal-compliance: products needing both BPOM + halal certification
- Link with indonesia-tax: PPN implications for pharmaceutical products (some are tax-exempt)

---

**Key regulations**: PerBPOM No. 30/2017 (registration), No. 31/2018 (labeling), No. 32/2019 (cosmetics safety), UU No. 18/2012 (food), UU No. 36/2009 (health)
