// Test duration conversion function
import { convertDurationToTime } from './src/middleware/validationMiddleware.js';

const testCases = [
    "60 minutes",
    "1 hour",
    "30 minutes",
    "2 hours",
    "1 hour 30 minutes",
    "90 minutes",
    "45 min",
    "2 hr",
    "120",
    "60 minites", // Common typo
    "invalid duration"
];

console.log("Testing duration conversion:");
testCases.forEach(test => {
    const result = convertDurationToTime(test);
    console.log(`"${test}" -> ${result}`);
});
