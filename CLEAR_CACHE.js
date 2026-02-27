// Run this in the browser console (F12 → Console tab) to reset the app

// 1. Clear localStorage
localStorage.clear();
console.log('✓ localStorage cleared');

// 2. Clear sessionStorage
sessionStorage.clear();
console.log('✓ sessionStorage cleared');

// 3. Reload the page
window.location.href = 'http://localhost:5174';
console.log('✓ Reloading page...');
