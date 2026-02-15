"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackUsage = exports.generateContent = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const server_1 = require("../server");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
let anthropic = null;
if (CLAUDE_API_KEY) {
    anthropic = new sdk_1.default({ apiKey: CLAUDE_API_KEY });
}
const PROMPT_TEMPLATES = {
    lesson: (config, sourceText) => `
You are an expert curriculum designer. Create a detailed lesson plan based on the following information.

Source Material:
${sourceText}

Configuration:
- Title: ${config.title}
- Subject: ${config.subject || 'Not specified'}
- Grade Level: ${config.gradeLevel || 'Not specified'}
- Duration: ${config.duration || '45 minutes'}
${config.objectives ? `- Learning Objectives: ${config.objectives.join(', ')}` : ''}
${config.additionalInstructions ? `- Additional Instructions: ${config.additionalInstructions}` : ''}

Please create a comprehensive lesson plan with the following sections:
1. **Lesson Title**
2. **Learning Objectives** (3-5 specific, measurable objectives)
3. **Materials Needed**
4. **Lesson Introduction** (hook/engagement activity)
5. **Main Instruction** (step-by-step teaching activities)
6. **Guided Practice** (activities with teacher support)
7. **Independent Practice** (student-led activities)
8. **Assessment** (how to evaluate learning)
9. **Closure** (summary and preview of next lesson)
10. **Differentiation** (accommodations for diverse learners)

Format the response as a structured JSON object with these sections as keys.
`,
    program: (config, sourceText) => `
You are an expert curriculum designer. Create a program outline based on the following information.

Source Material:
${sourceText}

Configuration:
- Title: ${config.title}
- Subject: ${config.subject || 'Not specified'}
- Grade Level: ${config.gradeLevel || 'Not specified'}
${config.additionalInstructions ? `- Additional Instructions: ${config.additionalInstructions}` : ''}

Please create a comprehensive program outline with:
1. **Program Title**
2. **Overview** (program description and goals)
3. **Duration** (total program length)
4. **Unit Breakdown** (list of units with descriptions)
5. **Learning Outcomes** (what students will achieve)
6. **Assessment Strategy** (how progress will be measured)
7. **Resources Required**
8. **Weekly Schedule** (high-level timeline)

Format the response as a structured JSON object with these sections as keys.
`,
    assessment: (config, sourceText) => `
You are an expert curriculum designer. Create an assessment based on the following information.

Source Material:
${sourceText}

Configuration:
- Title: ${config.title}
- Subject: ${config.subject || 'Not specified'}
- Grade Level: ${config.gradeLevel || 'Not specified'}
${config.objectives ? `- Topics to Assess: ${config.objectives.join(', ')}` : ''}
${config.additionalInstructions ? `- Additional Instructions: ${config.additionalInstructions}` : ''}

Please create a comprehensive assessment with:
1. **Assessment Title**
2. **Instructions** (for students)
3. **Multiple Choice Questions** (5-10 questions with answer key)
4. **Short Answer Questions** (3-5 questions with rubric)
5. **Extended Response Questions** (1-2 questions with rubric)
6. **Answer Key** (all correct answers)
7. **Grading Rubric** (point allocation)

Format the response as a structured JSON object with these sections as keys.
`,
};
// Mock response for when API key is not available
const MOCK_RESPONSES = {
    lesson: {
        lessonTitle: 'Sample Lesson Plan',
        learningObjectives: [
            'Students will understand the key concepts',
            'Students will apply knowledge through practice',
            'Students will demonstrate mastery through assessment',
        ],
        materialsNeeded: ['Textbook', 'Whiteboard', 'Worksheets', 'Digital resources'],
        lessonIntroduction: 'Begin with an engaging hook to capture student attention...',
        mainInstruction: 'Provide direct instruction covering the main concepts...',
        guidedPractice: 'Work through examples together as a class...',
        independentPractice: 'Students work independently on practice problems...',
        assessment: 'Formative assessment through observation and exit tickets...',
        closure: 'Review key points and preview next lesson...',
        differentiation: 'Provide scaffolding for struggling learners and extensions for advanced students...',
    },
    program: {
        programTitle: 'Sample Program Outline',
        overview: 'This program covers fundamental concepts and builds toward mastery...',
        duration: '12 weeks',
        unitBreakdown: [
            { name: 'Unit 1: Introduction', description: 'Foundation concepts', weeks: 2 },
            { name: 'Unit 2: Core Concepts', description: 'Main content', weeks: 4 },
            { name: 'Unit 3: Application', description: 'Practical application', weeks: 4 },
            { name: 'Unit 4: Review', description: 'Review and assessment', weeks: 2 },
        ],
        learningOutcomes: ['Understand core concepts', 'Apply knowledge', 'Demonstrate mastery'],
        assessmentStrategy: 'Combination of formative and summative assessments...',
        resourcesRequired: ['Textbooks', 'Digital tools', 'Supplementary materials'],
        weeklySchedule: 'Detailed weekly breakdown...',
    },
    assessment: {
        assessmentTitle: 'Sample Assessment',
        instructions: 'Read each question carefully. Show all work for full credit.',
        multipleChoiceQuestions: [
            { question: 'Sample question 1?', options: ['A', 'B', 'C', 'D'], answer: 'A' },
            { question: 'Sample question 2?', options: ['A', 'B', 'C', 'D'], answer: 'B' },
        ],
        shortAnswerQuestions: [
            { question: 'Explain the concept...', rubric: '2 points for complete answer' },
        ],
        extendedResponseQuestions: [
            { question: 'Analyze and discuss...', rubric: '10 points total' },
        ],
        answerKey: 'See above for individual answers',
        gradingRubric: 'Total: 100 points',
    },
};
const generateContent = async (userId, config, sourceText) => {
    // Track usage
    await (0, exports.trackUsage)(userId, 'generation');
    // If no API key, return mock response
    if (!anthropic) {
        console.log('No Claude API key configured, returning mock response');
        return MOCK_RESPONSES[config.type];
    }
    const prompt = PROMPT_TEMPLATES[config.type](config, sourceText);
    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });
        const textContent = response.content.find((c) => c.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new errorHandler_1.AppError('Failed to generate content', 500);
        }
        // Try to parse as JSON, fall back to text
        try {
            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = textContent.text.match(/```json\n?([\s\S]*?)\n?```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : textContent.text;
            return JSON.parse(jsonStr);
        }
        catch {
            return { content: textContent.text };
        }
    }
    catch (error) {
        console.error('Claude API error:', error);
        throw new errorHandler_1.AppError('Failed to generate content: ' + error.message, 500);
    }
};
exports.generateContent = generateContent;
const trackUsage = async (userId, action) => {
    const month = (0, helpers_1.getCurrentMonth)();
    await server_1.prisma.usageTracking.upsert({
        where: {
            userId_action_month: {
                userId,
                action,
                month,
            },
        },
        update: {
            count: { increment: 1 },
        },
        create: {
            userId,
            action,
            month,
            count: 1,
        },
    });
};
exports.trackUsage = trackUsage;
//# sourceMappingURL=claudeService.js.map