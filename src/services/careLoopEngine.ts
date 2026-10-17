import { CareGap, CareJourneyEvent, PatientContinuityMetrics, PatientBarrierType } from '../types/careLoop';

export interface BarrierRecommendation {
  barrierType: PatientBarrierType;
  interventionTitle: string;
  interventionDescription: string;
  recommendedChannel: 'WhatsApp' | 'SMS' | 'Phone Call' | 'In-Person';
  actionButtonLabel: string;
}

export class CareLoopEngine {
  /**
   * Calculates Patient Continuity Index (PCI) score (0-100)
   */
  public static calculatePCI(
    gaps: CareGap[],
    events: CareJourneyEvent[]
  ): { score: number; riskLevel: PatientContinuityMetrics['riskLevel']; activeGaps: number; criticalGaps: number } {
    const activeGaps = gaps.filter(g => g.status === 'active' || g.status === 'in_progress');
    const criticalGaps = activeGaps.filter(g => g.severity === 'critical');
    const highGaps = activeGaps.filter(g => g.severity === 'high');

    // Base score starts at 100
    let score = 100;

    // Deduct penalties for active gaps
    score -= criticalGaps.length * 28;
    score -= highGaps.length * 16;
    score -= (activeGaps.length - criticalGaps.length - highGaps.length) * 8;

    // Bonus for completed events (up to +15)
    const completedEvents = events.filter(e => e.status === 'completed');
    score += Math.min(15, completedEvents.length * 2);

    // Clamp between 0 and 100
    score = Math.max(10, Math.min(100, Math.round(score)));

    let riskLevel: PatientContinuityMetrics['riskLevel'] = 'Optimal';
    if (score < 50 || criticalGaps.length >= 2) {
      riskLevel = 'Critical Risk';
    } else if (score < 70 || criticalGaps.length === 1) {
      riskLevel = 'High Risk';
    } else if (score < 85 || activeGaps.length > 0) {
      riskLevel = 'Moderate Risk';
    }

    return {
      score,
      riskLevel,
      activeGaps: activeGaps.length,
      criticalGaps: criticalGaps.length,
    };
  }

  /**
   * Generates AI Next Best Action recommendation based on gaps and barriers
   */
  public static getNextBestAction(patientName: string, gaps: CareGap[]): {
    recommendation: string;
    rationale: string;
    priority: 'Immediate' | 'Within 24 Hours' | 'Routine';
    suggestedGapId?: string;
  } {
    const activeGaps = gaps.filter(g => g.status === 'active');
    
    // Check for critical gaps first
    const criticalGap = activeGaps.find(g => g.severity === 'critical');
    if (criticalGap) {
      if (criticalGap.gapType === 'unclosed_referral') {
        return {
          recommendation: `Fast-track ophthalmology referral for ${patientName} via weekend clinic booking or CareFlow tele-ophthalmology`,
          rationale: `Referral is ${criticalGap.daysOverdue} days overdue. Immediate intervention is required to prevent progressive diabetic retinal microvascular damage.`,
          priority: 'Immediate',
          suggestedGapId: criticalGap.id
        };
      }
      if (criticalGap.gapType === 'overdue_follow_up') {
        return {
          recommendation: `Schedule home-visit clinical triage or priority cardiology slot for ${patientName}`,
          rationale: `High cardiovascular risk profile. Patient is ${criticalGap.daysOverdue} days overdue for critical diagnostic assessment.`,
          priority: 'Immediate',
          suggestedGapId: criticalGap.id
        };
      }
    }

    // High gaps next
    const highGap = activeGaps.find(g => g.severity === 'high');
    if (highGap) {
      if (highGap.gapType === 'unreviewed_lab') {
        return {
          recommendation: `Sign off renal diagnostic panel in EMR consultation workspace`,
          rationale: `Serum Creatinine / eGFR result is pending clinician review. Essential before titrating nephroactive oral agents.`,
          priority: 'Within 24 Hours',
          suggestedGapId: highGap.id
        };
      }
      if (highGap.gapType === 'unfilled_prescription') {
        return {
          recommendation: `Initiate pharmacy outreach with DGDA-approved generic alternative switch`,
          rationale: `Patient has discontinued maintenance respiratory therapy due to cost barrier. Generic substitution restores adherence.`,
          priority: 'Within 24 Hours',
          suggestedGapId: highGap.id
        };
      }
    }

    // Fallback if all resolved
    return {
      recommendation: `Care loop continuity is stabilized. Maintain routine surveillance and scheduled quarterly review.`,
      rationale: `All critical care gaps have been documented or resolved with verified clinical evidence.`,
      priority: 'Routine'
    };
  }

  /**
   * Provides intelligent barrier resolution heuristics
   */
  public static getBarrierResolution(barrierType: PatientBarrierType): BarrierRecommendation {
    switch (barrierType) {
      case 'financial':
        return {
          barrierType,
          interventionTitle: 'DGDA Bioequivalent Generic Switch & Pharmacy Subsidy',
          interventionDescription: 'Switch to top-tier Bangladeshi manufacturers (Beximco, Incepta, Square, Renata) providing identical efficacy at 40-60% lower out-of-pocket cost.',
          recommendedChannel: 'WhatsApp',
          actionButtonLabel: 'Apply Generic Switch'
        };
      case 'transport':
        return {
          barrierType,
          interventionTitle: 'CareFlow Tele-Consultation or Home Sample Phlebotomy',
          interventionDescription: 'Eliminate Dhaka traffic hurdles by booking an encrypted HD video consultation or dispatching a phlebotomist to the patient doorstep.',
          recommendedChannel: 'Phone Call',
          actionButtonLabel: 'Schedule Home Phlebotomy'
        };
      case 'scheduling_conflict':
        return {
          barrierType,
          interventionTitle: 'Weekend Chamber or Priority Fast-Track Booking',
          interventionDescription: 'Reserve Friday or Saturday morning slots or late evening telemedicine slots to accommodate corporate office schedules.',
          recommendedChannel: 'WhatsApp',
          actionButtonLabel: 'Propose Weekend Slot'
        };
      case 'clinical_hesitancy':
        return {
          barrierType,
          interventionTitle: 'Bilingual Clinical Counseling & Patient Education Handout',
          interventionDescription: 'Deliver structured Bengali educational guidelines explaining treatment necessity, mitigating side-effect anxiety with nurse reassurance.',
          recommendedChannel: 'Phone Call',
          actionButtonLabel: 'Trigger Nurse Outreach'
        };
      case 'system_delay':
        return {
          barrierType,
          interventionTitle: 'Automated EMR Expedite & Supervisor Escalation',
          interventionDescription: 'Elevate ticket priority directly on laboratory or pharmacy worklists with audit-trailed clinical supervisor notification.',
          recommendedChannel: 'In-Person',
          actionButtonLabel: 'Fast-Track Lab/Rx'
        };
      default:
        return {
          barrierType: 'none',
          interventionTitle: 'Standard Care Coordination',
          interventionDescription: 'No systemic barrier reported. Proceed with standard clinical protocol.',
          recommendedChannel: 'SMS',
          actionButtonLabel: 'Send Reminder'
        };
    }
  }

  /**
   * Generates bilingual communication templates for patient outreach
   */
  public static generateOutreachTemplate(
    gap: CareGap,
    language: 'en' | 'bn',
    channel: 'WhatsApp' | 'SMS' | 'Phone Call'
  ): string {
    const doctorName = gap.accountableOwner.name;
    const patientName = gap.patientName;

    if (language === 'bn') {
      if (channel === 'WhatsApp') {
        return `আসসালামু আলাইকুম ${patientName} সাহেব,\n` +
          `কেয়ারফ্লো হেলথ ও ${doctorName}-এর পক্ষ থেকে আপনার জন্য গুরুত্বপূর্ণ স্বাস্থ্য বার্তা:\n` +
          `আপনার জন্য নির্ধারিত "${gap.title}" এর সময়সূচি অতিক্রান্ত হয়েছে।\n\n` +
          `চিকিৎসকের পরামর্শ: ${gap.clinicalRationale}\n\n` +
          `সহজেই নতুন তারিখ নির্ধারণ বা সরাসরি কথা বলতে নিচের লিংকে চাপ দিন অথবা উত্তর লিখুন '১':\n` +
          `https://careflow.health.bd/careloop/${gap.id}\n` +
          `হটলাইন: ১৬২৬৩ | জরুরি: ৯৯৯`;
      }
      if (channel === 'SMS') {
        return `কেয়ারফ্লো হেলথ: ${patientName}, আপনার "${gap.title}" সম্পন্ন করার জন্য চিকিৎসকের তাগিদ রয়েছে। অ্যাপয়েন্টমেন্টের জন্য ১৬২৬৩ নম্বরে কল করুন।`;
      }
      return `[নার্স/কোঅর্ডিনেটর টেলিফোন স্ক্রিপ্ট]\n` +
        `আসসালামু আলাইকুম ${patientName} সাহেব, আমি কেয়ারফ্লো হেলথ ও ${doctorName}-এর ক্লিনিক থেকে নার্স নুসরাত বলছি। ` +
        `আপনার সর্বশেষ পর্যালোচনার পর "${gap.title}" ফলো-আপটি বাকি রয়েছে। আপনি কি আগামী শনিবার সকালে চেম্বারে আসতে পারবেন নাকি ভিডিও কনসালটেশন সুবিধাজনক হবে?`;
    }

    // English
    if (channel === 'WhatsApp') {
      return `Dear ${patientName},\n` +
        `This is an essential care continuity update from ${doctorName} at CareFlow Health Network.\n\n` +
        `Action Needed: "${gap.title}" (Due: ${gap.dueDate})\n` +
        `Clinical Note: ${gap.clinicalRationale}\n\n` +
        `To confirm your appointment slot or discuss assistance options, tap here:\n` +
        `https://careflow.health.bd/careloop/${gap.id}\n` +
        `Care Helpline: 16263 | National Emergency: 999`;
    }
    if (channel === 'SMS') {
      return `CareFlow Health: ${patientName}, follow-up needed for "${gap.title}". Tap careflow.health.bd/careloop/${gap.id} or call 16263 to schedule.`;
    }
    return `[Care Coordinator Telephone Script]\n` +
      `Hello ${patientName}, this is Nurse Coordinator Nusrat calling on behalf of ${doctorName} at CareFlow Health. ` +
      `We noticed your "${gap.title}" is currently pending. We want to ensure your care journey stays seamless. Would a Saturday slot or a virtual video consult work best for you?`;
  }
}
