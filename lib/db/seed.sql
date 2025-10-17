-- Seed Data for AI Coaching Platform
-- Insert GAD-7 (Generalized Anxiety Disorder 7-item) Assessment

INSERT INTO assessment_types (
    code,
    name,
    description,
    category,
    total_questions,
    min_score,
    max_score,
    version,
    scoring_rules,
    questions
) VALUES (
    'GAD-7',
    'Generalized Anxiety Disorder 7-item Scale',
    'The GAD-7 is a validated screening tool for generalized anxiety disorder. It assesses anxiety symptoms over the past 2 weeks using a 4-point Likert scale.',
    'Mental Health',
    7,
    0,
    21,
    '1.0',
    '{
        "thresholds": [
            {
                "min": 0,
                "max": 4,
                "severity": "minimal",
                "description": "Minimal anxiety symptoms",
                "recommendation": "Continue monitoring. No treatment necessary at this time."
            },
            {
                "min": 5,
                "max": 9,
                "severity": "mild",
                "description": "Mild anxiety symptoms",
                "recommendation": "Watchful waiting. Consider self-help strategies and lifestyle modifications."
            },
            {
                "min": 10,
                "max": 14,
                "severity": "moderate",
                "description": "Moderate anxiety symptoms",
                "recommendation": "Consider professional support. Therapy or counseling may be beneficial."
            },
            {
                "min": 15,
                "max": 21,
                "severity": "severe",
                "description": "Severe anxiety symptoms",
                "recommendation": "Professional treatment recommended. Consult with a mental health professional for evaluation and treatment options."
            }
        ],
        "scoring_note": "Each item is scored 0-3, with total scores ranging from 0-21. Higher scores indicate greater anxiety severity."
    }',
    '{
        "instructions": "Over the last 2 weeks, how often have you been bothered by the following problems?",
        "options": [
            {
                "value": 0,
                "label": "Not at all"
            },
            {
                "value": 1,
                "label": "Several days"
            },
            {
                "value": 2,
                "label": "More than half the days"
            },
            {
                "value": 3,
                "label": "Nearly every day"
            }
        ],
        "items": [
            {
                "id": 1,
                "text": "Feeling nervous, anxious, or on edge",
                "domain": "anxiety"
            },
            {
                "id": 2,
                "text": "Not being able to stop or control worrying",
                "domain": "worry"
            },
            {
                "id": 3,
                "text": "Worrying too much about different things",
                "domain": "worry"
            },
            {
                "id": 4,
                "text": "Trouble relaxing",
                "domain": "tension"
            },
            {
                "id": 5,
                "text": "Being so restless that it is hard to sit still",
                "domain": "restlessness"
            },
            {
                "id": 6,
                "text": "Becoming easily annoyed or irritable",
                "domain": "irritability"
            },
            {
                "id": 7,
                "text": "Feeling afraid, as if something awful might happen",
                "domain": "fear"
            }
        ]
    }'
) ON CONFLICT (code) DO NOTHING;

-- Optional: Insert PHQ-9 (Patient Health Questionnaire-9) for Depression Screening
INSERT INTO assessment_types (
    code,
    name,
    description,
    category,
    total_questions,
    min_score,
    max_score,
    version,
    scoring_rules,
    questions
) VALUES (
    'PHQ-9',
    'Patient Health Questionnaire-9',
    'The PHQ-9 is a validated screening tool for depression. It assesses depressive symptoms over the past 2 weeks using a 4-point Likert scale.',
    'Mental Health',
    9,
    0,
    27,
    '1.0',
    '{
        "thresholds": [
            {
                "min": 0,
                "max": 4,
                "severity": "minimal",
                "description": "Minimal or no depression",
                "recommendation": "No treatment necessary. Continue monitoring."
            },
            {
                "min": 5,
                "max": 9,
                "severity": "mild",
                "description": "Mild depression",
                "recommendation": "Watchful waiting. Consider self-help strategies and lifestyle modifications."
            },
            {
                "min": 10,
                "max": 14,
                "severity": "moderate",
                "description": "Moderate depression",
                "recommendation": "Consider professional support. Therapy or counseling recommended."
            },
            {
                "min": 15,
                "max": 19,
                "severity": "moderately_severe",
                "description": "Moderately severe depression",
                "recommendation": "Professional treatment strongly recommended. Consider therapy and medication."
            },
            {
                "min": 20,
                "max": 27,
                "severity": "severe",
                "description": "Severe depression",
                "recommendation": "Immediate professional treatment recommended. Consult with a mental health professional urgently."
            }
        ],
        "scoring_note": "Each item is scored 0-3, with total scores ranging from 0-27. Higher scores indicate greater depression severity."
    }',
    '{
        "instructions": "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
        "options": [
            {
                "value": 0,
                "label": "Not at all"
            },
            {
                "value": 1,
                "label": "Several days"
            },
            {
                "value": 2,
                "label": "More than half the days"
            },
            {
                "value": 3,
                "label": "Nearly every day"
            }
        ],
        "items": [
            {
                "id": 1,
                "text": "Little interest or pleasure in doing things",
                "domain": "anhedonia"
            },
            {
                "id": 2,
                "text": "Feeling down, depressed, or hopeless",
                "domain": "mood"
            },
            {
                "id": 3,
                "text": "Trouble falling or staying asleep, or sleeping too much",
                "domain": "sleep"
            },
            {
                "id": 4,
                "text": "Feeling tired or having little energy",
                "domain": "energy"
            },
            {
                "id": 5,
                "text": "Poor appetite or overeating",
                "domain": "appetite"
            },
            {
                "id": 6,
                "text": "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
                "domain": "self_worth"
            },
            {
                "id": 7,
                "text": "Trouble concentrating on things, such as reading the newspaper or watching television",
                "domain": "concentration"
            },
            {
                "id": 8,
                "text": "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
                "domain": "psychomotor"
            },
            {
                "id": 9,
                "text": "Thoughts that you would be better off dead, or of hurting yourself in some way",
                "domain": "suicidal_ideation"
            }
        ]
    }'
) ON CONFLICT (code) DO NOTHING;

-- Verify seed data
SELECT code, name, version, is_active, created_at
FROM assessment_types
ORDER BY created_at;
