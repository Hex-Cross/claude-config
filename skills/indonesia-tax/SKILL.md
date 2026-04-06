---
name: indonesia-tax
description: Indonesian tax compliance — PPh/PPN calculations, e-Faktur, Coretax DJP integration, BPJS, THR for SME apps
user-invocable: true
version: 1.0.0
---

# Indonesia Tax — Tax Compliance Code Generator

## Step 1: Detect Scope

From user request, identify which tax components are needed:
- **PPN** (VAT 12%) — output tax, input tax, e-Faktur
- **PPh 21** — employee income tax (TER method since Jan 2024)
- **PPh 23** — withholding tax on services (2%)
- **PPh 25** — monthly installment of annual tax
- **PPh 4(2)** — final tax (construction, rent, etc.)
- **BPJS** — social security contributions (Kesehatan + Ketenagakerjaan)
- **THR** — holiday bonus calculation per labor law
- **Severance** — severance pay calculation per PP 35/2021

## Step 2: Generate Tax Calculation Module

Generate TypeScript functions for each applicable tax:
- PPh 21 with TER (Tarif Efektif Rata-rata) brackets: 0%, 0.25%, 0.5%, ... 34%
- PPN 12% with taxable/non-taxable item classification
- BPJS rates: JKK (0.24-1.74%), JKM (0.3%), JHT (5.7%), JP (3%), JKN (5%)
- PTKP (non-taxable income) thresholds: TK/0, K/0, K/1, K/2, K/3

## Step 3: Generate e-Faktur Data Structures

Create types/schemas matching DJP e-Faktur format:
- Faktur Pajak Keluaran (output tax invoice)
- Faktur Pajak Masukan (input tax invoice)
- NPWP/NIK validation
- Nomor Seri Faktur Pajak format
- QR code data structure for e-Faktur

## Step 4: Generate Coretax DJP Integration Stubs

Create API client stubs for Coretax integration:
- Authentication (OAuth2 with DJP)
- SPT Masa submission (monthly tax return)
- e-Faktur upload/download
- Tax payment (billing code generation)
- Taxpayer profile lookup

Mark all stubs with `// TODO: Verify against latest Coretax API docs` since the API is new and evolving.

## Step 5: Generate Reporting Period Tracker

Create a reporting schedule module:
- Monthly: SPT Masa PPh 21 (due 20th), SPT Masa PPN (due end of month)
- Annual: SPT Tahunan (due March 31 for individuals, April 30 for companies)
- BPJS: monthly contribution (due 15th)
- THR: 7 days before Hari Raya

## Step 6: Validate Against Current Regulations

Cross-check generated code against known regulation references:
- UU HPP (tax harmonization law)
- PMK rates for current year
- PP 58/2023 (TER method for PPh 21)
- PP 35/2021 (severance)
- Permenaker for BPJS rates
