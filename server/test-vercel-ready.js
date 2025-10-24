#!/usr/bin/env node

/**
 * Pre-deployment Test Script
 * Run this before deploying to Vercel to check if everything is ready
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking if your backend is ready for Vercel deployment...\n');

let allChecksPassed = true;
const warnings = [];
const errors = [];

// Check 1: Required files exist
console.log('1️⃣  Checking required files...');
const requiredFiles = [
  'server.js',
  'package.json',
  'vercel.json',
  'api/index.js',
  '.vercelignore'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} found`);
  } else {
    console.log(`   ❌ ${file} missing`);
    errors.push(`Missing required file: ${file}`);
    allChecksPassed = false;
  }
});

// Check 2: package.json has required dependencies
console.log('\n2️⃣  Checking dependencies...');
const packageJson = require('./package.json');
const requiredDeps = [
  'express',
  'mongoose',
  'cors',
  'dotenv',
  'jsonwebtoken'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep} installed`);
  } else {
    console.log(`   ❌ ${dep} not found in dependencies`);
    errors.push(`Missing dependency: ${dep}`);
    allChecksPassed = false;
  }
});

// Check 3: Environment variables template
console.log('\n3️⃣  Checking environment configuration...');
const envExample = path.join(__dirname, '.env.example');
const envFile = path.join(__dirname, '.env');

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  // Check for critical variables
  const criticalVars = ['MONGODB_URI', 'JWT_SECRET'];
  criticalVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`   ✅ ${varName} defined in .env`);
    } else {
      console.log(`   ⚠️  ${varName} not found in .env`);
      warnings.push(`${varName} should be configured in Vercel`);
    }
  });
} else {
  console.log('   ⚠️  .env file not found (this is okay if using Vercel env vars)');
  warnings.push('Make sure to set environment variables in Vercel dashboard');
}

// Check 4: Vercel configuration
console.log('\n4️⃣  Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  
  if (vercelConfig.version === 2) {
    console.log('   ✅ Vercel version 2 configured');
  }
  
  if (vercelConfig.builds && vercelConfig.builds.length > 0) {
    console.log('   ✅ Build configuration found');
  }
  
  if (vercelConfig.routes && vercelConfig.routes.length > 0) {
    console.log('   ✅ Routes configured');
  }
} catch (error) {
  console.log('   ❌ Error reading vercel.json');
  errors.push('Invalid vercel.json file');
  allChecksPassed = false;
}

// Check 5: Potential issues with Socket.IO
console.log('\n5️⃣  Checking for potential Vercel limitations...');
const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

if (serverContent.includes('socket.io')) {
  console.log('   ⚠️  Socket.IO detected');
  warnings.push('Socket.IO will not work on Vercel (serverless limitation)');
  warnings.push('Consider deploying Socket.IO separately on Railway or Render');
}

if (serverContent.includes('setInterval') || serverContent.includes('setTimeout')) {
  console.log('   ⚠️  Scheduled tasks detected');
  warnings.push('Scheduled tasks may not work on Vercel serverless functions');
  warnings.push('Consider using Vercel Cron Jobs or external cron service');
}

// Check 6: Node modules size (important for deployment speed)
console.log('\n6️⃣  Checking node_modules size...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists (will be rebuilt on Vercel)');
} else {
  console.log('   ⚠️  node_modules not found (run npm install)');
  warnings.push('Run npm install before deploying');
}

// Check 7: Git status
console.log('\n7️⃣  Checking Git status...');
const gitPath = path.join(__dirname, '..', '.git');
if (fs.existsSync(gitPath)) {
  console.log('   ✅ Git repository initialized');
} else {
  console.log('   ⚠️  Not a Git repository');
  warnings.push('Initialize Git and push to GitHub/GitLab for Vercel deployment');
}

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(60));

if (errors.length > 0) {
  console.log('\n❌ ERRORS (Must fix before deployment):');
  errors.forEach((error, index) => {
    console.log(`   ${index + 1}. ${error}`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (Review before deployment):');
  warnings.forEach((warning, index) => {
    console.log(`   ${index + 1}. ${warning}`);
  });
}

if (allChecksPassed && warnings.length === 0) {
  console.log('\n✅ All checks passed! Your backend is ready for Vercel deployment.');
  console.log('\n📋 Next Steps:');
  console.log('   1. Run: npm install -g vercel');
  console.log('   2. Run: vercel login');
  console.log('   3. Run: vercel');
  console.log('   4. Add environment variables in Vercel dashboard');
  console.log('   5. Run: vercel --prod');
  console.log('\n📖 Read QUICK_START_VERCEL.md for detailed instructions.');
} else if (allChecksPassed && warnings.length > 0) {
  console.log('\n✅ Basic checks passed, but review warnings above.');
  console.log('   You can proceed with deployment, but be aware of the limitations.');
  console.log('\n📖 Read VERCEL_DEPLOYMENT.md for solutions to common issues.');
} else {
  console.log('\n❌ Some checks failed. Please fix the errors above before deploying.');
  allChecksPassed = false;
}

console.log('\n' + '='.repeat(60) + '\n');

// Exit with appropriate code
process.exit(allChecksPassed ? 0 : 1);

