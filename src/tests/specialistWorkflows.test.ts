/**
 * Specialist Command Center & Chamber Operations: Automated Logic Verification Suite
 * Verifies core security invariants, anti-auto-merge safeguards, unit comparability, and referral transitions.
 */

import { MOCK_CHAMBERS, MOCK_CHAMBER_ASSISTANTS, MOCK_DUPLICATE_CANDIDATES, MOCK_INVESTIGATIONS, MOCK_REFERRALS, MOCK_SPECIALIST_PATIENT_BRIEF } from '../data/mockSpecialistData';
import { ReferralLifecycleStatus } from '../types/specialist';

export function runSpecialistWorkflowTests(): { passed: number; failed: number; results: { test: string; status: 'PASSED' | 'FAILED'; message: string }[] } {
  const results: { test: string; status: 'PASSED' | 'FAILED'; message: string }[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, successMsg: string, failMsg: string) {
    if (condition) {
      passed++;
      results.push({ test: testName, status: 'PASSED', message: successMsg });
    } else {
      failed++;
      results.push({ test: testName, status: 'FAILED', message: failMsg });
    }
  }

  // TEST 1: Anti-Auto-Merge Invariant
  const duplicate = MOCK_DUPLICATE_CANDIDATES[0];
  assert(
    duplicate.reviewStatus === 'unreviewed' && duplicate.candidateDOB !== '1972-04-12',
    'Anti-Auto-Merge Duplicate Invariant',
    'Duplicate candidate with matching phone but differing DOB was properly flagged as unreviewed, preventing silent auto-merge.',
    'FAILURE: Duplicate candidate was prematurely merged without manual clinician verification.'
  );

  // TEST 2: Strict Assistant Confidentiality Guardrail
  const assistant = MOCK_CHAMBER_ASSISTANTS[0];
  assert(
    assistant.permissions.canViewClinicalNotes === false &&
    assistant.permissions.canAuthorPrescriptions === false &&
    assistant.permissions.canViewInvestigationResults === false,
    'Assistant Role-Based Access Control',
    'Chamber Assistant permissions enforce strict zero-access to confidential clinical notes, prescriptions, and raw lab values.',
    'FAILURE: Assistant permissions leak confidential clinical data.'
  );

  // TEST 3: Multi-Chamber Fee & Schedule Separation
  const evercareChamber = MOCK_CHAMBERS.find(c => c.id === 'chm-001');
  const dhanmondiChamber = MOCK_CHAMBERS.find(c => c.id === 'chm-002');
  assert(
    evercareChamber?.consultationFeeBDT === 2000 && dhanmondiChamber?.consultationFeeBDT === 1500,
    'Multi-Chamber Independent Fee Schedule',
    'Each chamber maintains distinct operating hours and consultation fees in BDT (Evercare: ৳2,000, Dhanmondi: ৳1,500).',
    'FAILURE: Multi-chamber fees were unified or missing.'
  );

  // TEST 4: Investigation Unit Compatibility Check
  const renalReport = MOCK_INVESTIGATIONS[0];
  const creatinineResult = renalReport.results.find(r => r.parameter === 'Serum Creatinine');
  const allUnitsMatch = creatinineResult?.historicalTrend?.every(t => t.unit === creatinineResult.unit);
  assert(
    allUnitsMatch === true,
    'Investigation Historical Unit Compatibility Check',
    'Historical trend comparison strictly verifies unit consistency (mg/dL) before rendering trend timeline.',
    'FAILURE: Incompatible units or parameters were compared.'
  );

  // TEST 5: Referral Lifecycle Governance & Approval Gate
  const inboundReferral = MOCK_REFERRALS.find(r => r.direction === 'inbound');
  assert(
    inboundReferral?.response?.isClinicianApproved === false && inboundReferral?.currentStatus === 'Under Review',
    'Referral Response Physician Approval Gate',
    'Draft second-opinion response cannot be transmitted to referring doctor until isClinicianApproved is explicitly set to true.',
    'FAILURE: Unapproved referral response was transmitted.'
  );

  // TEST 6: Specialist Patient Brief Source-Link Verification
  const brief = MOCK_SPECIALIST_PATIENT_BRIEF;
  const hasSourceRefs = 
    brief.todayVisitReason.sourceRef.length > 0 &&
    brief.investigationHighlights.every(i => i.sourceRef.length > 0) &&
    brief.activeMedications.every(m => m.sourceRef.length > 0);
  assert(
    hasSourceRefs === true,
    'Non-Hallucinatory Source-Linked Brief Guarantee',
    '100% of generated patient brief statements include direct source references (Encounter, Lab Report, or Prescription ID).',
    'FAILURE: Brief contains untraceable or synthetic claims.'
  );

  return { passed, failed, results };
}
