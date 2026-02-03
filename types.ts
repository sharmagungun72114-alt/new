
export enum DetectionResult {
  AI_GENERATED = 'AI_GENERATED',
  HUMAN = 'HUMAN'
}

export interface AnalysisResponse {
  classification: DetectionResult;
  confidence_score: number;
  explanation?: string;
}

export interface AudioMetadata {
  name: string;
  size: number;
  type: string;
  duration?: number;
}
