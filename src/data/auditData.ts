import { type PersonaId, type AuditResult } from "@/types/audit";

export function generateAuditResults(personaId: PersonaId): AuditResult {
  const results: Record<PersonaId, AuditResult> = {
    solo: {
      overallScore: 82,
      summary: "Your design is in good shape! A few spacing and contrast issues need attention before handoff.",
      riskLevel: 'Medium',
      categories: [
        {
          name: 'Spacing & Grid',
          score: 75,
          icon: '📐',
          issues: [
            {
              id: '1',
              title: '3 spacing misalignments detected',
              description: 'Some elements don\'t follow the 8pt grid system.',
              severity: 'warning',
              category: 'Spacing',
              suggestion: 'Align all padding and margins to 8px increments.',
            },
            {
              id: '2',
              title: 'Inconsistent card padding',
              description: 'Cards use 16px, 20px, and 24px padding inconsistently.',
              severity: 'info',
              category: 'Spacing',
              suggestion: 'Standardize card padding to 24px for consistency.',
            },
          ],
        },
        {
          name: 'Typography',
          score: 85,
          icon: '🔤',
          issues: [
            {
              id: '3',
              title: 'Body font too small',
              description: 'Body text is 11px, below recommended minimum of 14px.',
              severity: 'warning',
              category: 'Typography',
              suggestion: 'Increase body font from 11px → 14px for readability.',
            },
          ],
        },
        {
          name: 'Contrast',
          score: 78,
          icon: '🎨',
          issues: [
            {
              id: '4',
              title: '1 low contrast text element',
              description: 'Secondary text fails WCAG AA contrast ratio (3.2:1 vs required 4.5:1).',
              severity: 'critical',
              category: 'Contrast',
              suggestion: 'Darken the text color to achieve at least 4.5:1 contrast.',
            },
          ],
        },
        {
          name: 'Components',
          score: 88,
          icon: '🧩',
          issues: [
            {
              id: '5',
              title: '2 inconsistent button radii',
              description: 'Primary buttons use 8px radius, secondary use 4px.',
              severity: 'info',
              category: 'Components',
              suggestion: 'Apply primary button style token consistently.',
            },
          ],
        },
      ],
    },
    lead: {
      overallScore: 76,
      summary: "Team output shows inconsistent patterns across screens. Dashboard and Checkout need attention.",
      riskLevel: 'Medium',
      categories: [
        {
          name: 'Naming Conventions',
          score: 68,
          icon: '📝',
          issues: [
            {
              id: '1',
              title: 'Inconsistent layer naming',
              description: '34% of layers use non-standard naming patterns.',
              severity: 'warning',
              category: 'Naming',
              suggestion: 'Enforce Component/Variant/State naming convention.',
            },
          ],
        },
        {
          name: 'Component Usage',
          score: 72,
          icon: '🧩',
          issues: [
            {
              id: '2',
              title: '7 detached components found',
              description: 'Components have been detached from the design system.',
              severity: 'critical',
              category: 'Components',
              suggestion: 'Re-link detached instances to maintain system integrity.',
            },
          ],
        },
        {
          name: 'Token Consistency',
          score: 80,
          icon: '🎯',
          issues: [
            {
              id: '3',
              title: 'Hard-coded colors detected',
              description: '12 instances of hard-coded hex colors instead of tokens.',
              severity: 'warning',
              category: 'Tokens',
              suggestion: 'Replace hard-coded colors with design token references.',
            },
          ],
        },
        {
          name: 'Screen Quality',
          score: 84,
          icon: '📊',
          issues: [
            {
              id: '4',
              title: 'Checkout screen below threshold',
              description: 'Checkout scored 69/100, below the 75 minimum quality gate.',
              severity: 'critical',
              category: 'Quality',
              suggestion: 'Prioritize checkout redesign before next sprint.',
            },
          ],
        },
      ],
    },
    a11y: {
      overallScore: 61,
      summary: "Multiple accessibility barriers detected. Primary CTA fails WCAG AA and touch targets are too small.",
      riskLevel: 'High',
      categories: [
        {
          name: 'Contrast Ratio',
          score: 52,
          icon: '👁️',
          issues: [
            {
              id: '1',
              title: 'Primary CTA fails WCAG AA',
              description: 'Button contrast is 3.1:1, needs 4.5:1 minimum.',
              severity: 'critical',
              category: 'Contrast',
              suggestion: 'Darken button background or lighten text to achieve 4.5:1.',
            },
            {
              id: '2',
              title: '4 text elements below AA threshold',
              description: 'Light gray text on white backgrounds fails contrast checks.',
              severity: 'critical',
              category: 'Contrast',
              suggestion: 'Use darker shades for all body and caption text.',
            },
          ],
        },
        {
          name: 'Touch Targets',
          score: 58,
          icon: '👆',
          issues: [
            {
              id: '3',
              title: '6 targets below 44px minimum',
              description: 'Small interactive elements may be difficult to tap on mobile.',
              severity: 'critical',
              category: 'Touch',
              suggestion: 'Increase all interactive elements to minimum 44x44px.',
            },
          ],
        },
        {
          name: 'Text Sizing',
          score: 70,
          icon: '🔤',
          issues: [
            {
              id: '4',
              title: '3 text elements under 12px',
              description: 'Caption and helper text is 10px, below accessibility minimum.',
              severity: 'warning',
              category: 'Text',
              suggestion: 'Set minimum text size to 12px across all use cases.',
            },
          ],
        },
        {
          name: 'Focus States',
          score: 65,
          icon: '🎯',
          issues: [
            {
              id: '5',
              title: 'Missing focus indicators',
              description: 'Interactive elements lack visible focus states for keyboard users.',
              severity: 'warning',
              category: 'Focus',
              suggestion: 'Add 2px outline with sufficient contrast for all focusable elements.',
            },
          ],
        },
      ],
    },
    founder: {
      overallScore: 78,
      summary: "Your design looks decent but has some inconsistencies that may affect user trust on mobile. Fix spacing before development.",
      riskLevel: 'Medium',
      categories: [
        {
          name: 'Visual Consistency',
          score: 74,
          icon: '✨',
          issues: [
            {
              id: '1',
              title: 'Screen may look inconsistent on mobile',
              description: 'Spacing irregularities could cause layout shifts on smaller screens.',
              severity: 'warning',
              category: 'Visual',
              suggestion: 'Fix spacing before sending to development.',
            },
          ],
        },
        {
          name: 'User Trust',
          score: 82,
          icon: '🤝',
          issues: [
            {
              id: '2',
              title: 'CTA button could be more prominent',
              description: 'The main action button doesn\'t stand out enough from secondary actions.',
              severity: 'info',
              category: 'Trust',
              suggestion: 'Make your primary CTA larger and use stronger contrast.',
            },
          ],
        },
        {
          name: 'Mobile Readiness',
          score: 70,
          icon: '📱',
          issues: [
            {
              id: '3',
              title: 'Text may be hard to read on phones',
              description: 'Some text is too small for comfortable mobile reading.',
              severity: 'warning',
              category: 'Mobile',
              suggestion: 'Increase minimum font size to 16px for mobile.',
            },
          ],
        },
        {
          name: 'Dev Readiness',
          score: 85,
          icon: '🚀',
          issues: [
            {
              id: '4',
              title: 'Ready for development with minor fixes',
              description: 'Overall structure is solid. Address flagged items for smoother handoff.',
              severity: 'info',
              category: 'Dev',
              suggestion: 'Fix the 3 flagged items, then proceed to development.',
            },
          ],
        },
      ],
    },
    consultant: {
      overallScore: 71,
      summary: "Formal heuristic evaluation reveals key usability and consistency issues. See structured report for client-ready findings.",
      riskLevel: 'High',
      categories: [
        {
          name: 'Usability',
          score: 68,
          icon: '🧪',
          issues: [
            {
              id: '1',
              title: 'Visibility of system status — violated',
              description: 'No loading states or progress indicators for async operations.',
              severity: 'critical',
              category: 'Usability',
              suggestion: 'Add loading skeletons, progress bars, and status indicators.',
            },
            {
              id: '2',
              title: 'Error prevention weak',
              description: 'Form inputs lack validation feedback before submission.',
              severity: 'warning',
              category: 'Usability',
              suggestion: 'Add inline validation and confirmation dialogs for destructive actions.',
            },
          ],
        },
        {
          name: 'Consistency',
          score: 65,
          icon: '🎯',
          issues: [
            {
              id: '3',
              title: '14 design token violations',
              description: 'Hard-coded values bypass the design system in multiple places.',
              severity: 'critical',
              category: 'Consistency',
              suggestion: 'Audit all screens for design token compliance.',
            },
          ],
        },
        {
          name: 'Cognitive Load',
          score: 72,
          icon: '🧠',
          issues: [
            {
              id: '4',
              title: 'High cognitive load on settings page',
              description: 'Too many options visible simultaneously without progressive disclosure.',
              severity: 'warning',
              category: 'Cognitive',
              suggestion: 'Group settings into collapsible sections with sensible defaults.',
            },
          ],
        },
        {
          name: 'Business Impact',
          score: 78,
          icon: '💼',
          issues: [
            {
              id: '5',
              title: 'Conversion path unclear',
              description: 'Primary conversion CTA is not visually dominant on key screens.',
              severity: 'warning',
              category: 'Business',
              suggestion: 'Increase CTA prominence with color, size, and positioning hierarchy.',
            },
          ],
        },
      ],
    },
  };

  return results[personaId];
}
