#!/usr/bin/env node

/**
 * Chat System Setup Verification Script
 * Run with: node verify-chat-setup.js
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 Verifying Chat System Setup...\n");

let allChecksPassed = true;

// Check 1: Environment Variables
console.log("1️⃣  Checking environment variables...");
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const requiredVars = [
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
    "SANITY_WRITE_TOKEN",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
  ];

  const missingVars = requiredVars.filter((v) => !envContent.includes(v));

  if (missingVars.length === 0) {
    console.log("   ✅ All required environment variables found");
  } else {
    console.log("   ❌ Missing environment variables:", missingVars.join(", "));
    allChecksPassed = false;
  }
} else {
  console.log("   ❌ .env.local file not found");
  allChecksPassed = false;
}

// Check 2: Schema Files
console.log("\n2️⃣  Checking schema files...");
const schemaFiles = [
  "sanityio/schemaTypes/conversation.ts",
  "sanityio/schemaTypes/message.ts",
];

let allSchemasExist = true;
schemaFiles.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} not found`);
    allSchemasExist = false;
    allChecksPassed = false;
  }
});

// Check 3: Component Files
console.log("\n3️⃣  Checking component files...");
const componentFiles = [
  "components/ChatList.tsx",
  "components/ChatWindow.tsx",
  "components/ChatSearch.tsx",
  "components/providers/SocketProvider.tsx",
];

let allComponentsExist = true;
componentFiles.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} not found`);
    allComponentsExist = false;
    allChecksPassed = false;
  }
});

// Check 4: Server File
console.log("\n4️⃣  Checking custom server...");
if (fs.existsSync(path.join(__dirname, "server.js"))) {
  console.log("   ✅ server.js exists");
} else {
  console.log("   ❌ server.js not found");
  allChecksPassed = false;
}

// Check 5: Dependencies
console.log("\n5️⃣  Checking dependencies...");
const packageJson = require("./package.json");
const requiredDeps = ["socket.io", "socket.io-client", "date-fns"];

const missingDeps = requiredDeps.filter((dep) => !packageJson.dependencies[dep]);

if (missingDeps.length === 0) {
  console.log("   ✅ All required dependencies installed");
} else {
  console.log("   ❌ Missing dependencies:", missingDeps.join(", "));
  console.log("   Run: npm install " + missingDeps.join(" "));
  allChecksPassed = false;
}

// Check 6: Routes
console.log("\n6️⃣  Checking route files...");
const routes = [
  "app/(root)/messages/page.tsx",
  "app/(root)/messages/[id]/page.tsx",
];

let allRoutesExist = true;
routes.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} not found`);
    allRoutesExist = false;
    allChecksPassed = false;
  }
});

// Check 7: Server Actions
console.log("\n7️⃣  Checking server actions...");
if (fs.existsSync(path.join(__dirname, "lib/chat-actions.ts"))) {
  console.log("   ✅ lib/chat-actions.ts exists");
} else {
  console.log("   ❌ lib/chat-actions.ts not found");
  allChecksPassed = false;
}

// Final Summary
console.log("\n" + "=".repeat(50));
if (allChecksPassed) {
  console.log("\n✅ All checks passed! Chat system is ready to use.\n");
  console.log("Next steps:");
  console.log("1. Run: npm run dev");
  console.log("2. Open: http://localhost:3000/messages");
  console.log("3. Test the chat system!");
  console.log("\n📖 Documentation: CHAT_SYSTEM_GUIDE.md");
  console.log("🚀 Quick Start: CHAT_QUICK_START.md\n");
} else {
  console.log("\n❌ Some checks failed. Please fix the issues above.\n");
  process.exit(1);
}

console.log("=".repeat(50) + "\n");
