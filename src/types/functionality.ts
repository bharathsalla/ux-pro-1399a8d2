export interface FunctionalityStrength {
  title: string;
  detail: string;
}

export interface FunctionalityGap {
  issue: string;
  impact: string;
  industryExpectation: string;
  severity: "critical" | "major" | "minor";
  area?: string; // description of where on screen this relates to
}

export interface FunctionalityRecommendation {
  feature: string;
  description: string;
  integration: string;
  userValue: string;
  businessValue: string;
}

export interface EnterpriseReadiness {
  scalability: string;
  compliance: string;
  roleGaps: string;
}

export interface FunctionalityResult {
  screenType: string;
  productDomain: string;
  primaryUserRole: string;
  coreGoal: string;
  verdict: "good" | "mixed" | "bad";
  score: number;
  summary: string;
  strengths: FunctionalityStrength[];
  gaps: FunctionalityGap[];
  recommendations: FunctionalityRecommendation[];
  enterpriseReadiness: EnterpriseReadiness;
}
