import { DecisionRequest, ConsentSettings } from '@palm-interview/shared';

export class DecisionRequestDto implements DecisionRequest {
  id: string;
  userId?: string;
  visitorId?: string | null;
  consent?: ConsentSettings;
  context: Record<string, any>;
  timestamp: number;
}
