---
name: bi-reporting
description: Bank Indonesia regulatory reporting — transaction reporting, PBI compliance, SKNBI/RTGS templates, and fintech licensing requirements for Indonesian payment/fintech apps
user-invocable: true
version: 1.0.0
---

# Bank Indonesia Reporting

Generate BI regulatory compliance code for Indonesian fintech and payment applications.

---

## Phase 1: Scope Detection

Determine which BI regulations apply:
- Payment system license type: PJP (Payment Service Provider), PIPP (Payment Infrastructure Provider)
- Transaction types: transfer, e-money, QRIS, cards
- Reporting obligations per license type

## Phase 2: Data Models

```typescript
// BI Transaction Report
interface BITransactionReport {
  reportPeriod: { month: number; year: number };
  reportType: 'bulanan' | 'harian' | 'insidentil'; // monthly/daily/incident
  submissionDeadline: Date;
  status: 'draft' | 'submitted' | 'accepted' | 'revision_required';

  transactions: {
    totalVolume: number;
    totalValue: number; // in IDR
    byChannel: Record<string, { volume: number; value: number }>;
    byType: Record<string, { volume: number; value: number }>;
  };

  compliance: {
    maxTransactionLimit: number; // per PBI regulation
    fraudCases: number;
    disputeCases: number;
    systemDowntime: number; // minutes
    slaCompliance: number; // percentage
  };
}

// E-Money Report (PBI 20/6/PBI/2018)
interface EMoneyReport {
  totalFloat: number; // total e-money outstanding
  registeredUsers: number;
  unregisteredUsers: number;
  maxBalanceRegistered: 10000000; // IDR 10M
  maxBalanceUnregistered: 2000000; // IDR 2M
  monthlyTopUp: { registered: number; unregistered: number };
}

// QRIS Report
interface QRISReport {
  totalMerchants: number;
  totalTransactions: number;
  totalValue: number;
  mdr: { onUs: number; offUs: number }; // Merchant Discount Rate
  settlementData: { t0: number; t1: number }; // same-day vs next-day
}
```

## Phase 3: Reporting Templates

Generate report templates matching BI's required formats:
- LHBU (Laporan Harian Bank Umum) — daily bank report
- LBU (Laporan Bulanan Bank Umum) — monthly bank report
- Transaction monitoring report (anti-money laundering)
- SKNBI clearing report
- RTGS settlement report

## Phase 4: Regulatory Limits

Generate validation code for:
- E-money balance limits (registered: IDR 10M, unregistered: IDR 2M)
- Transaction limits per PBI
- MDR caps for QRIS (0.7% for micro merchants)
- Settlement timeline requirements (T+0 for QRIS)

## Phase 5: AML/CFT Compliance

Generate patterns for:
- Customer Due Diligence (CDD) triggers
- Suspicious Transaction Report (LTKM) to PPATK
- Transaction monitoring thresholds (IDR 100M cash, IDR 500M transfer)
- PEP (Politically Exposed Person) screening interface

## Phase 6: Cross-reference

- Link with indonesia-tax: tax reporting on financial transactions
- Link with xendit-integrate: payment gateway reporting data

---

**Key regulations**: PBI 23/6/PBI/2021 (payment system), PBI 20/6/PBI/2018 (e-money), PADG 6/2019 (QRIS), UU 8/2010 (AML/CFT)
