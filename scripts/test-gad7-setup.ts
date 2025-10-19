/**
 * Script to test GAD-7 assessment setup
 * Run with: npx tsx scripts/test-gad7-setup.ts
 */

import { db } from '../lib/db/client';
import { assessmentTypes } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function testGAD7Setup() {
  console.log('🔍 Checking GAD-7 Assessment Setup...\n');

  try {
    // Check if GAD-7 exists
    const [gad7] = await db
      .select()
      .from(assessmentTypes)
      .where(eq(assessmentTypes.code, 'GAD7'))
      .limit(1);

    if (!gad7) {
      console.log('❌ GAD-7 not found in database');
      console.log('\n📋 You need to seed the GAD-7 assessment data.');
      console.log('Run the seed script: npm run db:seed');
      return;
    }

    console.log('✅ GAD-7 Assessment Found!');
    console.log('\n📊 Assessment Details:');
    console.log('  Code:', gad7.code);
    console.log('  Name:', gad7.name);
    console.log('  Category:', gad7.category);
    console.log('  Total Questions:', gad7.totalQuestions);
    console.log('  Score Range:', `${gad7.minScore} - ${gad7.maxScore}`);
    console.log('  Version:', gad7.version);
    console.log('  Active:', gad7.isActive);

    console.log('\n📝 Questions:');
    if (gad7.questions && typeof gad7.questions === 'object') {
      const questions = gad7.questions as any;
      console.log('  Instructions:', questions.instructions);
      console.log('  Number of questions:', questions.items?.length || 0);
      console.log('  Answer options:', questions.options?.length || 0);

      if (questions.items && questions.items.length > 0) {
        console.log('\n  Sample questions:');
        questions.items.slice(0, 3).forEach((q: any, i: number) => {
          console.log(`    ${i + 1}. ${q.text}`);
        });
      }

      if (questions.options && questions.options.length > 0) {
        console.log('\n  Answer options:');
        questions.options.forEach((opt: any) => {
          console.log(`    ${opt.value}: ${opt.label}`);
        });
      }
    }

    console.log('\n📈 Severity Thresholds:');
    if (gad7.scoringRules && typeof gad7.scoringRules === 'object') {
      const scoring = gad7.scoringRules as any;
      if (scoring.thresholds && Array.isArray(scoring.thresholds)) {
        scoring.thresholds.forEach((t: any) => {
          console.log(`  ${t.min}-${t.max}: ${t.severity.toUpperCase()}`);
          console.log(`    → ${t.description}`);
        });
      }
    }

    console.log('\n✅ GAD-7 is properly configured and ready to use!');
    console.log('\n🧪 Next Steps:');
    console.log('  1. Start the dev server: npm run dev');
    console.log('  2. Sign in to the application');
    console.log('  3. Start a conversation');
    console.log('  4. Mention anxiety/worry symptoms');
    console.log('  5. AI should offer the GAD-7 assessment');

  } catch (error) {
    console.error('❌ Error checking GAD-7 setup:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

testGAD7Setup();
