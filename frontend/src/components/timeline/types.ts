export type StepStatus = 'completed' | 'in_progress' | 'upcoming' | 'action_required' | 'delayed';
export type DateType = 'timestamp' | 'range' | 'estimate' | 'pending';

export interface TimelineDateInfo {
  display: string;
  type: DateType;
  isoDate?: string;
  estimatedCompletion?: string;
}

export interface TimelineIconConfig {
  name: string;
  badge?: 'star' | 'spinning-ring' | 'solid-dot' | 'hollow-dot';
  accentGlow?: boolean;
}

export interface TimelineStepItem {
  id: string;
  stepNumber: number | null;
  title: string;
  subtitle?: string;
  description: string;
  status: StepStatus;
  statusLabel: string;
  dates: TimelineDateInfo;
  icon: TimelineIconConfig;
}

export interface BespokeJourneyOrder {
  orderId: string;
  clientName: string;
  journeyTitle: string;
  garmentTitle: string;
  currentStepId: string;
  progressPercentage: number;
  steps: TimelineStepItem[];
}
