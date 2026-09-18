import * as XLSX from 'xlsx';
import { Question, Difficulty, QuestionType } from '../types/game';

export interface ParseResult {
  questions: Question[];
  teamAQuestions: Question[];
  teamBQuestions: Question[];
  hasTeamSheets: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Normalizes string keys by stripping spaces, symbols, and lowercasing
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Identify if a sheet name corresponds to Team A or Team B
 */
function matchTeamSheet(name: string): 'A' | 'B' | null {
  const norm = normalizeKey(name);
  if (
    norm.includes('teama') ||
    norm.includes('teamred') ||
    norm.includes('redship') ||
    norm.includes('northstar') ||
    norm === 'a' ||
    norm === 'red' ||
    norm === 'team1'
  ) {
    return 'A';
  }
  if (
    norm.includes('teamb') ||
    norm.includes('teamblue') ||
    norm.includes('blueship') ||
    norm.includes('earthexplorer') ||
    norm === 'b' ||
    norm === 'blue' ||
    norm === 'team2'
  ) {
    return 'B';
  }
  return null;
}

/**
 * Parses correct answer string or number into 0-indexed number (0=A, 1=B, 2=C, 3=D)
 */
function parseCorrectAnswer(val: unknown, maxOptions: number): number | null {
  if (typeof val === 'number') {
    if (val >= 0 && val < maxOptions) return val;
    if (val >= 1 && val <= maxOptions) return val - 1;
    return null;
  }

  const str = String(val).trim().toUpperCase();
  if (str === 'A' || str === 'OPTION A') return 0;
  if (str === 'B' || str === 'OPTION B') return 1;
  if (str === 'C' || str === 'OPTION C') return 2;
  if (str === 'D' || str === 'OPTION D') return 3;

  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    if (num >= 0 && num < maxOptions) return num;
    if (num >= 1 && num <= maxOptions) return num - 1;
  }

  return null;
}

/**
 * Parse raw rows from a single worksheet
 */
function parseSheetRows(
  sheet: XLSX.WorkSheet,
  sheetLabel: string,
  idPrefix: string,
  errors: string[],
  warnings: string[]
): Question[] {
  const questions: Question[] = [];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    warnings.push(`[${sheetLabel}] Sheet contains no data rows.`);
    return questions;
  }

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Excel row 1 is header
    const normalizedRow: Record<string, unknown> = {};

    Object.entries(row).forEach(([k, v]) => {
      normalizedRow[normalizeKey(k)] = v;
    });

    // Question Prompt
    const questionText = String(
      normalizedRow['question'] ||
      normalizedRow['prompt'] ||
      normalizedRow['questionprompt'] ||
      normalizedRow['questiontext'] ||
      ''
    ).trim();

    if (!questionText) {
      warnings.push(`[${sheetLabel}] Row ${rowNum}: Skipped row with empty question.`);
      return;
    }

    // Options A, B, C, D
    const optA = String(normalizedRow['optiona'] || normalizedRow['a'] || '').trim();
    const optB = String(normalizedRow['optionb'] || normalizedRow['b'] || '').trim();
    const optC = String(normalizedRow['optionc'] || normalizedRow['c'] || '').trim();
    const optD = String(normalizedRow['optiond'] || normalizedRow['d'] || '').trim();

    const options: string[] = [];
    if (optA) options.push(optA);
    if (optB) options.push(optB);
    if (optC) options.push(optC);
    if (optD) options.push(optD);

    if (options.length < 2) {
      errors.push(`[${sheetLabel}] Row ${rowNum}: At least 2 options (Option A and Option B) are required.`);
      return;
    }

    // Correct Answer
    const rawCorrect =
      normalizedRow['correctanswer'] ||
      normalizedRow['correct'] ||
      normalizedRow['answer'] ||
      normalizedRow['key'] ||
      '';

    const correctIndex = parseCorrectAnswer(rawCorrect, options.length);
    if (correctIndex === null) {
      errors.push(
        `[${sheetLabel}] Row ${rowNum}: Invalid correct answer "${rawCorrect}". Must be A, B, C, D or 1-${options.length}.`
      );
      return;
    }

    // Difficulty
    const rawDiff = String(normalizedRow['difficulty'] || 'medium').trim().toLowerCase();
    let difficulty: Difficulty = 'medium';
    if (rawDiff === 'easy' || rawDiff === 'medium' || rawDiff === 'hard') {
      difficulty = rawDiff;
    }

    // Category / Topic
    const category = String(
      normalizedRow['category'] ||
      normalizedRow['topic'] ||
      normalizedRow['subject'] ||
      'Locating Places on Earth'
    ).trim();

    // Explanation
    const explanation = String(
      normalizedRow['explanation'] ||
      normalizedRow['hint'] ||
      normalizedRow['note'] ||
      `Correct answer is: ${options[correctIndex]}`
    ).trim();

    const questionType: QuestionType = options.length === 2 ? 'true-false' : 'multiple-choice';

    questions.push({
      id: `${idPrefix}-${Date.now()}-${idx}`,
      question: questionText,
      options,
      correctAnswer: correctIndex,
      correctIndex,
      difficulty,
      category,
      topic: category,
      explanation,
      type: questionType,
      visualType: 'none',
    });
  });

  return questions;
}

/**
 * Parse Excel file (.xlsx, .xls) buffer into validated questions with dual-sheet support
 */
export function parseExcelFile(data: ArrayBuffer): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    if (!sheetNames || sheetNames.length === 0) {
      errors.push('The uploaded Excel workbook contains no sheets.');
      return { questions: [], teamAQuestions: [], teamBQuestions: [], hasTeamSheets: false, errors, warnings };
    }

    // Check for Team A and Team B sheets
    let sheetNameA = sheetNames.find((name) => matchTeamSheet(name) === 'A');
    let sheetNameB = sheetNames.find((name) => matchTeamSheet(name) === 'B');

    // If 2 sheets exist and neither matched explicitly, map sheet 0 to Team A and sheet 1 to Team B
    if ((!sheetNameA || !sheetNameB) && sheetNames.length >= 2) {
      sheetNameA = sheetNames[0];
      sheetNameB = sheetNames[1];
    }

    if (sheetNameA && sheetNameB && sheetNameA !== sheetNameB) {
      // Dual-Sheet (Two-Tab) Mode
      const teamAQuestions = parseSheetRows(
        workbook.Sheets[sheetNameA],
        `Team A (${sheetNameA})`,
        'teamA',
        errors,
        warnings
      );
      const teamBQuestions = parseSheetRows(
        workbook.Sheets[sheetNameB],
        `Team B (${sheetNameB})`,
        'teamB',
        errors,
        warnings
      );

      const allQuestions = [...teamAQuestions, ...teamBQuestions];
      return {
        questions: allQuestions,
        teamAQuestions,
        teamBQuestions,
        hasTeamSheets: true,
        errors,
        warnings,
      };
    } else {
      // Single-Sheet Fallback (Shared Mode)
      const primarySheet = sheetNames[0];
      const sharedQuestions = parseSheetRows(
        workbook.Sheets[primarySheet],
        `Shared (${primarySheet})`,
        'shared',
        errors,
        warnings
      );

      return {
        questions: sharedQuestions,
        teamAQuestions: sharedQuestions,
        teamBQuestions: sharedQuestions,
        hasTeamSheets: false,
        errors,
        warnings,
      };
    }
  } catch (err: unknown) {
    errors.push(`Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`);
    return { questions: [], teamAQuestions: [], teamBQuestions: [], hasTeamSheets: false, errors, warnings };
  }
}

/**
 * Parse JSON text into validated questions with dual-team support
 */
export function parseJsonFile(jsonText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonText);

    // Check if dual-team format: { teamAQuestions: [...], teamBQuestions: [...] }
    if (parsed && (Array.isArray(parsed.teamAQuestions) || Array.isArray(parsed.teamBQuestions))) {
      const rawA: unknown[] = Array.isArray(parsed.teamAQuestions) ? parsed.teamAQuestions : [];
      const rawB: unknown[] = Array.isArray(parsed.teamBQuestions) ? parsed.teamBQuestions : [];

      const teamAQuestions = parseRawQuestionArray(rawA, 'Team A', 'teamA', errors, warnings);
      const teamBQuestions = parseRawQuestionArray(rawB, 'Team B', 'teamB', errors, warnings);

      return {
        questions: [...teamAQuestions, ...teamBQuestions],
        teamAQuestions,
        teamBQuestions,
        hasTeamSheets: true,
        errors,
        warnings,
      };
    }

    // Otherwise flat array: [...] or { questions: [...] }
    const list: unknown[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.questions)
      ? parsed.questions
      : [];

    if (list.length === 0) {
      errors.push('JSON file must contain an array of questions or { teamAQuestions: [], teamBQuestions: [] }.');
      return { questions: [], teamAQuestions: [], teamBQuestions: [], hasTeamSheets: false, errors, warnings };
    }

    const questions = parseRawQuestionArray(list, 'Shared', 'shared', errors, warnings);
    return {
      questions,
      teamAQuestions: questions,
      teamBQuestions: questions,
      hasTeamSheets: false,
      errors,
      warnings,
    };
  } catch (err: unknown) {
    errors.push(`JSON parsing error: ${err instanceof Error ? err.message : String(err)}`);
    return { questions: [], teamAQuestions: [], teamBQuestions: [], hasTeamSheets: false, errors, warnings };
  }
}

function parseRawQuestionArray(
  list: unknown[],
  label: string,
  idPrefix: string,
  errors: string[],
  warnings: string[]
): Question[] {
  const questions: Question[] = [];

  list.forEach((item: any, idx: number) => {
    const rowNum = idx + 1;
    const questionText = String(item.question || item.prompt || '').trim();

    if (!questionText) {
      warnings.push(`[${label}] Item ${rowNum}: Skipped question with empty prompt.`);
      return;
    }

    const options: string[] = Array.isArray(item.options)
      ? item.options.map((o: unknown) => String(o).trim()).filter(Boolean)
      : [];

    if (options.length < 2) {
      errors.push(`[${label}] Item ${rowNum}: At least 2 options are required.`);
      return;
    }

    const rawCorrect = item.correctAnswer !== undefined ? item.correctAnswer : item.correctIndex;
    const correctIndex = parseCorrectAnswer(rawCorrect, options.length);
    if (correctIndex === null) {
      errors.push(`[${label}] Item ${rowNum}: Invalid correctAnswer field.`);
      return;
    }

    const rawDiff = String(item.difficulty || 'medium').toLowerCase();
    const difficulty: Difficulty =
      rawDiff === 'easy' || rawDiff === 'medium' || rawDiff === 'hard' ? rawDiff : 'medium';

    const category = String(item.category || item.topic || 'Geography').trim();
    const explanation = String(
      item.explanation || `Correct answer is: ${options[correctIndex]}`
    ).trim();

    questions.push({
      id: item.id || `${idPrefix}-json-${Date.now()}-${idx}`,
      question: questionText,
      options,
      correctAnswer: correctIndex,
      correctIndex,
      difficulty,
      category,
      topic: category,
      explanation,
      type: item.type || (options.length === 2 ? 'true-false' : 'multiple-choice'),
      visualType: item.visualType || 'none',
      gridTarget: item.gridTarget,
    });
  });

  return questions;
}

/**
 * Unified Ingestion: Routes based on file extension
 */
export async function parseQuestionsFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();
    return parseExcelFile(buffer);
  }

  if (ext === 'json') {
    const text = await file.text();
    return parseJsonFile(text);
  }

  return {
    questions: [],
    teamAQuestions: [],
    teamBQuestions: [],
    hasTeamSheets: false,
    errors: [`Unsupported file format .${ext}. Please upload a .xlsx, .xls, or .json file.`],
    warnings: [],
  };
}

/**
 * Generate and trigger download of pre-formatted 2-Sheet question_template.xlsx
 */
export function generateTemplateExcel(): void {
  const teamASample = [
    {
      Question: 'Which imaginary line divides the Earth into Northern and Southern Hemispheres?',
      'Option A': 'Prime Meridian',
      'Option B': 'Equator',
      'Option C': 'Tropic of Cancer',
      'Option D': 'Arctic Circle',
      'Correct Answer': 'B',
      Difficulty: 'easy',
      Category: 'Latitudes',
      Explanation: 'The Equator is at 0° latitude and splits Earth into Northern & Southern Hemispheres.',
    },
    {
      Question: 'The Tropic of Cancer is situated at which parallel of latitude?',
      'Option A': '23½° North',
      'Option B': '23½° South',
      'Option C': '66½° North',
      'Option D': '90° North',
      'Correct Answer': 'A',
      Difficulty: 'medium',
      Category: 'Latitudes',
      Explanation: 'The Tropic of Cancer lies at 23½° N in the Northern Hemisphere.',
    },
    {
      Question: 'Earth rotates through 15 degrees of longitude in how much time?',
      'Option A': '15 minutes',
      'Option B': '1 hour',
      'Option C': '2 hours',
      'Option D': '4 minutes',
      'Correct Answer': 'B',
      Difficulty: 'hard',
      Category: 'Longitudes',
      Explanation: '360° / 24 hours = 15° per hour (or 1° every 4 minutes).',
    },
  ];

  const teamBSample = [
    {
      Question: 'Which meridian passes through Greenwich near London and has a value of 0°?',
      'Option A': 'Equator',
      'Option B': 'International Date Line',
      'Option C': 'Prime Meridian',
      'Option D': 'Tropic of Capricorn',
      'Correct Answer': 'C',
      Difficulty: 'easy',
      Category: 'Longitudes',
      Explanation: 'The Prime Meridian has 0° longitude and divides Eastern and Western Hemispheres.',
    },
    {
      Question: 'The magnetic needle of a compass always points towards which direction?',
      'Option A': 'East',
      'Option B': 'West',
      'Option C': 'North',
      'Option D': 'South',
      'Correct Answer': 'C',
      Difficulty: 'easy',
      Category: 'Directions',
      Explanation: 'The magnetic compass needle aligns with Earth’s magnetic field to point North.',
    },
    {
      Question: 'The Tropic of Capricorn is located at which parallel?',
      'Option A': '23½° North',
      'Option B': '23½° South',
      'Option C': '66½° South',
      'Option D': '0°',
      'Correct Answer': 'B',
      Difficulty: 'medium',
      Category: 'Latitudes',
      Explanation: 'The Tropic of Capricorn lies at 23½° S in the Southern Hemisphere.',
    },
  ];

  const colWidths = [
    { wch: 45 }, // Question
    { wch: 22 }, // Option A
    { wch: 22 }, // Option B
    { wch: 22 }, // Option C
    { wch: 22 }, // Option D
    { wch: 16 }, // Correct Answer
    { wch: 12 }, // Difficulty
    { wch: 18 }, // Category
    { wch: 42 }, // Explanation
  ];

  const wsA = XLSX.utils.json_to_sheet(teamASample);
  wsA['!cols'] = colWidths;

  const wsB = XLSX.utils.json_to_sheet(teamBSample);
  wsB['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsA, 'Team A (Red Ship)');
  XLSX.utils.book_append_sheet(workbook, wsB, 'Team B (Blue Ship)');

  XLSX.writeFile(workbook, 'question_template.xlsx');
}

/**
 * Generate and trigger download of formatted dual-team question_template.json
 */
export function generateTemplateJson(): void {
  const sampleJson = {
    teamAQuestions: [
      {
        question: 'Which imaginary line divides the Earth into the Northern and Southern Hemispheres?',
        options: ['Prime Meridian', 'Equator', 'Tropic of Cancer', 'Arctic Circle'],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'Latitudes',
        explanation: 'The Equator is at 0° latitude and splits Earth into Northern & Southern Hemispheres.',
        type: 'multiple-choice',
      },
      {
        question: 'The Tropic of Cancer is situated at which parallel of latitude?',
        options: ['23½° North', '23½° South', '66½° North', '90° North'],
        correctAnswer: 0,
        difficulty: 'medium',
        category: 'Latitudes',
        explanation: 'The Tropic of Cancer lies at 23½° N in the Northern Hemisphere.',
        type: 'multiple-choice',
      },
    ],
    teamBQuestions: [
      {
        question: 'Which meridian passes through Greenwich near London and has a value of 0°?',
        options: ['Equator', 'International Date Line', 'Prime Meridian', 'Tropic of Capricorn'],
        correctAnswer: 2,
        difficulty: 'easy',
        category: 'Longitudes',
        explanation: 'The Prime Meridian has 0° longitude and divides Eastern and Western Hemispheres.',
        type: 'multiple-choice',
      },
      {
        question: 'The magnetic needle of a compass always points towards which direction?',
        options: ['East', 'West', 'North', 'South'],
        correctAnswer: 2,
        difficulty: 'easy',
        category: 'Directions',
        explanation: 'The magnetic compass needle aligns with Earth’s magnetic field to point North.',
        type: 'multiple-choice',
      },
    ],
  };

  const blob = new Blob([JSON.stringify(sampleJson, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_template.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports detailed match results, accuracy, and missed questions guide to an Excel workbook
 */
export function exportRaceReportToExcel(report: import('./analytics').MatchReportData) {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryRows = [
    ['OCEAN & CONTINENT GLOBE RACERS - MATCH REPORT'],
    ['Generated At', report.timestamp],
    ['Game PIN / Code', report.gameCode || 'Standard'],
    ['Match Duration', `${Math.floor(report.durationSeconds / 60)} minutes`],
    ['Winner', report.winner === 'tie' ? 'TIE' : report.winner === 'northStar' ? 'Team North Star (Red)' : 'Team Earth Explorers (Blue)'],
    [],
    ['TEAM PERFORMANCE BREAKDOWN'],
    ['Metric', 'Team North Star (Red)', 'Team Earth Explorers (Blue)'],
    ['Laps Completed', `${report.teamNorthStar.laps} (${report.teamNorthStar.quarterLaps} quarters)`, `${report.teamEarthExplorers.laps} (${report.teamEarthExplorers.quarterLaps} quarters)`],
    ['Score (Points)', report.teamNorthStar.score, report.teamEarthExplorers.score],
    ['Correct Answers', report.teamNorthStar.correctAnswers, report.teamEarthExplorers.correctAnswers],
    ['Total Attempted', report.teamNorthStar.totalAnswers, report.teamEarthExplorers.totalAnswers],
    ['Accuracy Rate', `${report.teamNorthStar.accuracyPercent}%`, `${report.teamEarthExplorers.accuracyPercent}%`],
    ['Longest Answer Streak', `${report.teamNorthStar.maxStreak} in a row`, `${report.teamEarthExplorers.maxStreak} in a row`],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 32 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Match Summary');

  // 2. Missed Questions Review Sheet
  const letters = ['A', 'B', 'C', 'D'];
  const missedHeader = ['Team', 'Question', 'Student Selection', 'Correct Answer', 'Topic / Category', 'Explanation'];
  const missedRows = (report.missedQuestions || []).map((m) => {
    const q = m.question;
    const teamLabel = m.team === 'northStar' ? 'Team Red' : 'Team Blue';
    const studentChoice = q.options[m.selectedOption] ? `${letters[m.selectedOption]}: ${q.options[m.selectedOption]}` : `Option ${m.selectedOption + 1}`;
    const correctChoice = q.options[m.correctAnswer] ? `${letters[m.correctAnswer]}: ${q.options[m.correctAnswer]}` : `Option ${m.correctAnswer + 1}`;

    return [
      teamLabel,
      q.question,
      studentChoice,
      correctChoice,
      q.category || q.topic || 'Geography',
      q.explanation || 'N/A',
    ];
  });

  const wsMissed = XLSX.utils.aoa_to_sheet([
    ['MISSED QUESTIONS CLASSROOM REVIEW GUIDE'],
    ['Review these questions with students during classroom debrief:'],
    [],
    missedHeader,
    ...missedRows,
  ]);

  wsMissed['!cols'] = [
    { wch: 14 },
    { wch: 45 },
    { wch: 28 },
    { wch: 28 },
    { wch: 20 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMissed, 'Missed Questions Review');

  const safeCode = (report.gameCode || 'Game').replace(/[^a-zA-Z0-9]/g, '');
  XLSX.writeFile(wb, `Race_Report_PIN_${safeCode}.xlsx`);
}

