---
name: nib-oss
description: Indonesian business licensing (NIB/OSS) workflow — OSS RBA integration, KBLI classification, risk-based licensing tiers, and compliance tracking for Indonesian business apps
user-invocable: true
version: 1.0.0
---

# NIB/OSS — Indonesian Business Licensing

Generate business licensing workflow code for Indonesian applications.

---

## Phase 1: Scope Detection

Determine business context:
- Single-company app vs multi-tenant platform
- Industry sectors (KBLI codes)
- Business scale: Mikro, Kecil, Menengah, Besar

## Phase 2: Data Model Generation

```typescript
// Business License (NIB)
interface NIBRecord {
  id: string;
  nib: string; // 13-digit NIB number
  companyName: string;
  npwp: string;
  address: string;
  kbliCodes: KBLIEntry[]; // Can have multiple business activities
  riskLevel: 'rendah' | 'menengah_rendah' | 'menengah_tinggi' | 'tinggi';
  scale: 'mikro' | 'kecil' | 'menengah' | 'besar';
  ossStatus: 'draft' | 'submitted' | 'nib_issued' | 'sertifikat_standar' | 'izin_usaha';
  issuedDate: Date;
  documents: LicenseDocument[];
}

interface KBLIEntry {
  code: string; // e.g., "62011" for software development
  description: string;
  riskLevel: 'rendah' | 'menengah_rendah' | 'menengah_tinggi' | 'tinggi';
  requiresStandard: boolean; // Sertifikat Standar needed?
  requiresPermit: boolean; // Izin Usaha needed?
}

interface LicenseDocument {
  type: 'nib' | 'sertifikat_standar' | 'izin_usaha' | 'izin_lokasi' | 'izin_lingkungan';
  status: 'required' | 'submitted' | 'approved' | 'expired';
  issuedDate?: Date;
  expiryDate?: Date;
  documentUrl?: string;
}
```

## Phase 3: Risk-Based Licensing Flow

Generate the PP 5/2021 (OSS RBA) workflow:
- **Low risk (Rendah)**: NIB only — auto-issued, no further permits
- **Medium-Low (Menengah Rendah)**: NIB + Sertifikat Standar (self-declaration)
- **Medium-High (Menengah Tinggi)**: NIB + Sertifikat Standar (verified)
- **High (Tinggi)**: NIB + Izin Usaha (full permit process)

Generate decision tree code that maps KBLI code -> risk level -> required documents.

## Phase 4: KBLI Code Reference

Generate searchable KBLI 2020 reference for common tech/business sectors:
- 62011: Software development
- 62012: Computer consulting
- 63111: Data processing
- 47911: E-commerce retail
- 56101: Restaurant/food service
- 46100: Wholesale trade

## Phase 5: Compliance Calendar

Generate tracking for:
- Annual LKPM (Investment Activity Report) due dates
- Sertifikat Standar renewal
- OSS system changes/updates
- New regulation alerts

## Phase 6: Cross-reference

- Link with indonesia-tax: NIB-NPWP validation
- Link with halal-compliance: food businesses need both NIB + halal

---

**Key regulations**: PP 5/2021 (OSS RBA), PP 6/2021 (licensing), PerBKPM 4/2021 (OSS procedures), KBLI 2020
