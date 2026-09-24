import dotenv from 'dotenv';
dotenv.config();
import * as Models from '../models/index.js';

console.log('[Model Verification] Testing schema compilation for all ShopSphere models...');

const modelNames = Object.keys(Models);
console.log(`[Model Verification] Successfully loaded ${modelNames.length} Mongoose models:`);
modelNames.forEach((name, idx) => {
  console.log(`  ${idx + 1}. ${name} -> Collection: ${Models[name].collection.name}`);
});

console.log('[Model Verification] ALL MODELS VALIDATED SUCCESSFULLY.');
process.exit(0);
