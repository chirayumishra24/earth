import * as XLSX from 'xlsx';
import { Question, Difficulty, QuestionType } from '../types/game';

export interface ParseResult {
  questions: Question[];
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
 * Parse Excel file (.xlsx, .xls) buffer into validated questions
 */
export function parseExcelFile(data: ArrayBuffer): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const questions: Question[] = [];

  try {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      errors.push('The uploaded Excel workbook contains no sheets.');
      return { questions, errors, warnings };
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      errors.push('No data rows found in the first sheet.');
      return { questions, errors, warnings };
    }

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2; // Row 1 is header in Excel
      const normalizedRow: Record<string, unknown> = {};

      Object.entries(row).forEach(([k, v]) => {
        normalizedRow[normalizeKey(k)] = v;
      });

      // Find Question Prompt
      const questionText = String(
        normalizedRow['question'] ||
        normalizedRow['prompt'] ||
        normalizedRow['questionprompt'] ||
        normalizedRow['questiontext'] ||
        ''
      ).trim();

      if (!questionText) {
        warnings.push(`Row ${rowNum}: Skipped row with empty question.`);
        return;
      }

      // Find Options
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
        errors.push(`Row ${rowNum}: At least 2 options (Option A and Option B) are required.`);
        return;
      }

      // Find Correct Answer
      const rawCorrect =
        normalizedRow['correctanswer'] ||
        normalizedRow['correct'] ||
        normalizedRow['answer'] ||
        normalizedRow['key'] ||
        '';

      const correctIndex = parseCorrectAnswer(rawCorrect, options.length);
      if (correctIndex === null) {
        errors.push(
          `Row ${rowNum}: Invalid correct answer "${rawCorrect}". Must be A, B, C, D or 1-${options.length}.`
        );
        return;
      }

      // Find Difficulty
      const rawDiff = String(normalizedRow['difficulty'] || 'medium').trim().toLowerCase();
      let difficulty: Difficulty = 'medium';
      if (rawDiff === 'easy' || rawDiff === 'medium' || rawDiff === 'hard') {
        difficulty = rawDiff;
      }

      // Find Category / Topic
      const category = String(
        normalizedRow['category'] ||
        normalizedRow['topic'] ||
        normalizedRow['subject'] ||
        'Locating Places on Earth'
      ).trim();

      // Find Explanation
      const explanation = String(
        normalizedRow['explanation'] ||
        normalizedRow['hint'] ||
        normalizedRow['note'] ||
        `Correct answer is: ${options[correctIndex]}`
      ).trim();

      const questionType: QuestionType = options.length === 2 ? 'true-false' : 'multiple-choice';

      questions.push({
        id: `custom-xl-${Date.now()}-${idx}`,
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
  } catch (err: unknown) {
    errors.push(`Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { questions, errors, warnings };
}

/**
 * Parse JSON text into validated questions
 */
export function parseJsonFile(jsonText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const questions: Question[] = [];

  try {
    const parsed = JSON.parse(jsonText);
    const list: unknown[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.questions)
      ? parsed.questions
      : [];

    if (list.length === 0) {
      errors.push('JSON file must contain an array of question objects or a { questions: [] } object.');
      return { questions, errors, warnings };
    }

    list.forEach((item: any, idx: number) => {
      const rowNum = idx + 1;
      const questionText = String(item.question || item.prompt || '').trim();

      if (!questionText) {
        warnings.push(`Item ${rowNum}: Skipped question with empty prompt.`);
        return;
      }

      const options: string[] = Array.isArray(item.options)
        ? item.options.map((o: unknown) => String(o).trim()).filter(Boolean)
        : [];

      if (options.length < 2) {
        errors.push(`Item ${rowNum}: At least 2 options are required.`);
        return;
      }

      const rawCorrect = item.correctAnswer !== undefined ? item.correctAnswer : item.correctIndex;
      const correctIndex = parseCorrectAnswer(rawCorrect, options.length);
      if (correctIndex === null) {
        errors.push(`Item ${rowNum}: Invalid correctAnswer field.`);
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
        id: item.id || `custom-json-${Date.now()}-${idx}`,
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
  } catch (err: unknown) {
    errors.push(`JSON parsing error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { questions, errors, warnings };
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
    errors: [`Unsupported file format .${ext}. Please upload a .xlsx, .xls, or .json file.`],
    warnings: [],
  };
}

/**
 * Generate and trigger download of pre-formatted question_template.xlsx
 */
export function generateTemplateExcel(): void {
  const sampleData = [
    {
      Question: 'Which imaginary line divides the Earth into the Northern and Southern Hemispheres?',
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
      Question: 'Which meridian passes through Greenwich near London and has a value of 0°?',
      'Option A': 'Equator',
      'Option B': 'International Date Line',
      'Option C': 'Prime Meridian',
      'Option D': 'Tropic of Capricorn',
      'Correct Answer': 'C',
      Difficulty: 'easy',
      Category: 'Longitudes',
      Explanation: 'The Prime Meridian has 0° longitude and divides the Eastern and Western Hemispheres.',
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

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set optimal column widths
  worksheet['!cols'] = [
    { wch: 45 }, // Question
    { wch: 20 }, // Option A
    { wch: 20 }, // Option B
    { wch: 20 }, // Option C
    { wch: 20 }, // Option D
    { wch: 15 }, // Correct Answer
    { wch: 12 }, // Difficulty
    { wch: 16 }, // Category
    { wch: 40 }, // Explanation
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

  XLSX.writeFile(workbook, 'question_template.xlsx');
}

/**
 * Generate and trigger download of formatted question_template.json
 */
export function generateTemplateJson(): void {
  const sampleJson = {
    questions: [
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
        question: 'Which meridian passes through Greenwich near London and has a value of 0°?',
        options: ['Equator', 'International Date Line', 'Prime Meridian', 'Tropic of Capricorn'],
        correctAnswer: 2,
        difficulty: 'easy',
        category: 'Longitudes',
        explanation: 'The Prime Meridian has 0° longitude and divides Eastern and Western Hemispheres.',
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
