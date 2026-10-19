import { runSpecialistWorkflowTests } from './specialistWorkflows.test';
import { runLocalizationTests } from './localization.test';

const result = runSpecialistWorkflowTests();

for (const item of result.results) {
  console.log(`${item.status}: ${item.test}`);
}

if (result.failed > 0) {
  process.exitCode = 1;
}

console.log(`Specialist workflow tests: ${result.passed} passed, ${result.failed} failed`);

const localization = runLocalizationTests();
console.log(`Localization tests: ${localization.passed} passed, ${localization.failed} failed`);
if (localization.failed > 0) process.exitCode = 1;
