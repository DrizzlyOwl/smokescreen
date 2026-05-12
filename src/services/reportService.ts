import { GoogleGenerativeAI } from '@google/generative-ai';
import { Severity, Stack, stackJargon, commonJargon } from '../data/incidents';

const recoveryTimes = ['5 minutes', '20 minutes', 'an hour', 'the rest of the afternoon', 'a while'];

export const generateTicketId = () => `INC-${Math.floor(Math.random() * 9000 + 1000)}`;

const indefiniteArticle = (word: string) => {
    const firstLetter = word.toLowerCase().charAt(0);
    return ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
};

/**
 * Service for generating incident reports (Mock and AI-based).
 */
export const reportService = {
  generateIncidentReport(severity: Severity, stack: Stack): { text: string; ticketId: string; scoreEarned: number } {
    if (severity === 'NOMINAL') return { text: '', ticketId: '', scoreEarned: 0 };

    const getRand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const useStackSpecific = Math.random() > 0.3;
    
    const system = useStackSpecific ? getRand(stackJargon[stack].systems) : getRand(commonJargon.systems);
    const action = useStackSpecific ? getRand(stackJargon[stack].actions) : getRand(commonJargon.actions);
    const error = useStackSpecific ? getRand(stackJargon[stack].errors[severity]) : getRand(commonJargon.errors[severity]);
    const ttr = getRand(recoveryTimes);
    const ticketId = generateTicketId();

    const article = indefiniteArticle(error);

    const impacts: Record<Severity, string> = {
      NOMINAL: 'NONE',
      P3: 'Minor performance degradation. No immediate user impact.',
      P1: 'Service degradation detected. Elevated 5xx errors on public endpoints.',
      P0: 'TOTAL SYSTEM OUTAGE. Global service unavailability.'
    };

    const status = severity === 'P0' ? 'CRITICAL_TRIAGE' : severity === 'P1' ? 'ACTIVE_INVESTIGATION' : 'MONITORING';

    const report = 
`[${ticketId}] ISSUE_SUMMARY: ${error.toUpperCase()} ON ${system.toUpperCase()}
------------------------------------------------------------
TYPE: INCIDENT | SEVERITY: ${severity} | STATUS: ${status}
STACK: ${stack} | COMPONENT: ${system} | EST_TTR: ${ttr}

DESCRIPTION:
Automated monitoring detected ${article} ${error} within the ${system}.
Incident responders are currently ${action} to mitigate further spread.

IMPACT:
${impacts[severity]}`;

    const scoreEarned = severity === 'P0' ? 60 : severity === 'P1' ? 30 : 15;

    return { text: report, ticketId, scoreEarned };
  },

  async generateAIIncidentReport(severity: Severity, stack: Stack, apiKey: string): Promise<{ text: string; ticketId: string; scoreEarned: number }> {
    if (severity === 'NOMINAL') return { text: '', ticketId: '', scoreEarned: 0 };
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are a senior SRE. Generate a highly technical incident report in a structured Jira Ticket format. 
      Use exactly this template:
      [INC-XXXX] ISSUE_SUMMARY: Short technical summary
      ------------------------------------------------------------
      TYPE: INCIDENT | SEVERITY: [SEV] | STATUS: [STATUS]
      STACK: [STACK] | COMPONENT: [COMPONENT] | EST_TTR: [TIME]

      DESCRIPTION:
      [2-3 sentences explaining the failure and the immediate remediation action.]

      IMPACT:
      [1 sentence explaining the blast radius.]
      
      Use heavy DevOps jargon. Sound urgent but professional.`
    });

    const prompt = `Generate a ${severity} incident report for a ${stack} environment failure.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const ticketId = generateTicketId();
      const scoreEarned = severity === 'P0' ? 60 : severity === 'P1' ? 30 : 15;
      
      return { text: text.trim(), ticketId, scoreEarned };
    } catch (error) {
      console.error("Gemini Error:", error);
      return this.generateIncidentReport(severity, stack);
    }
  }
};
