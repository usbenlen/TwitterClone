import type { TrendFeedbackReason } from "@/types/recommendation";

export const TREND_FEEDBACK_OPTIONS: ReadonlyArray<{
  reason: TrendFeedbackReason;
  label: string;
}> = [
  { reason: "irrelevant_content", label: "Вміст не відповідає темі" },
  { reason: "spam", label: "Ця тема — спам" },
  { reason: "abusive", label: "Ця тема образлива або шкідлива" },
  { reason: "not_interested", label: "Мене це не цікавить" },
  { reason: "duplicate", label: "Ця тема дублюється" },
  { reason: "harmful_or_spam", label: "Ця тема шкідлива або містить спам" },
];
