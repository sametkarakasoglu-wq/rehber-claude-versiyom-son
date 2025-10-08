// Test script to check if critical pages load without errors
console.log("=== STARTING APPLICATION TESTS ===\n");

// Test 1: Check if state.settings exists and has proper structure
console.log("Test 1: Checking state.settings structure...");
if (typeof state !== 'undefined') {
    console.log("✓ state exists");
    if (state.settings) {
        console.log("✓ state.settings exists");
        console.log("  - companyInfo:", state.settings.companyInfo ? "exists" : "MISSING");
        console.log("  - pdfSettings:", state.settings.pdfSettings ? "exists" : "MISSING");
        if (state.settings.pdfSettings) {
            console.log("  - pdfSettings.fields:", state.settings.pdfSettings.fields ? "exists" : "MISSING");
        }
    } else {
        console.log("✗ state.settings is undefined!");
    }
} else {
    console.log("✗ state is undefined!");
}

console.log("\n=== TESTS COMPLETED ===");
