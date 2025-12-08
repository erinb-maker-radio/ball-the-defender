/**
 * 🔒 PROTECTED FILE - MANDATORY PERMISSION REQUIRED 🔒
 * 
 * Supabase Integration Wrapper - Critical for leaderboard functionality
 * This file wraps the existing Supabase system with additional protection
 * 
 * PROTECTED FUNCTIONS:
 * - PROTECTED_supabaseSubmit(): Safe wrapper for Supabase submission
 * - PROTECTED_ensureAuth(): Authentication verification
 * - PROTECTED_validateScore(): Score validation before submission
 */

// ⚠️⚠️⚠️ CRITICAL: Protected Supabase submission wrapper ⚠️⚠️⚠️
window.PROTECTED_supabaseSubmit = async function(playerName, playerScore, gameMode) {
    console.log('🔒 PROTECTED: Supabase submission wrapper called');
    
    // Step 1: Validate inputs
    if (!playerName || typeof playerName !== 'string') {
        console.error('🔒 PROTECTED ERROR: Invalid player name:', playerName);
        throw new Error('Invalid player name');
    }
    
    if (!playerScore || typeof playerScore !== 'number' || playerScore < 0) {
        console.error('🔒 PROTECTED ERROR: Invalid score:', playerScore);
        throw new Error('Invalid score');
    }
    
    if (!gameMode || typeof gameMode !== 'string') {
        console.error('🔒 PROTECTED ERROR: Invalid game mode:', gameMode);
        throw new Error('Invalid game mode');
    }
    
    // Step 2: Ensure authentication system is available
    if (!window.SecureHighScoreAuth) {
        console.error('🔒 PROTECTED ERROR: SecureHighScoreAuth not available');
        throw new Error('Authentication system not available');
    }
    
    // Step 3: Ensure Supabase system is available
    if (!window.addToSupabaseLeaderboard) {
        console.error('🔒 PROTECTED ERROR: addToSupabaseLeaderboard not available');
        throw new Error('Supabase leaderboard system not available');
    }
    
    try {
        // Step 4: Submit through the existing system
        console.log('🔒 PROTECTED: Submitting to Supabase system...');
        const result = await window.addToSupabaseLeaderboard(playerName, playerScore, gameMode);
        
        console.log('🔒 PROTECTED: Supabase submission successful');
        return result;
        
    } catch (error) {
        console.error('🔒 PROTECTED ERROR: Supabase submission failed:', error);
        throw error;
    }
};

// ⚠️⚠️⚠️ CRITICAL: Authentication verification ⚠️⚠️⚠️
window.PROTECTED_ensureAuth = async function() {
    console.log('🔒 PROTECTED: Verifying authentication...');
    
    if (!window.SecureHighScoreAuth) {
        console.error('🔒 PROTECTED ERROR: SecureHighScoreAuth not available');
        return false;
    }
    
    try {
        // Try to authenticate
        await window.SecureHighScoreAuth.authenticate();
        console.log('🔒 PROTECTED: Authentication verified');
        return true;
        
    } catch (error) {
        console.error('🔒 PROTECTED ERROR: Authentication failed:', error);
        return false;
    }
};

// ⚠️⚠️⚠️ CRITICAL: Score validation ⚠️⚠️⚠️
window.PROTECTED_validateScore = function(playerScore, playerName, gameMode) {
    console.log('🔒 PROTECTED: Validating score data...');
    
    const validation = {
        validScore: false,
        validName: false,
        validMode: false,
        errors: []
    };
    
    // Validate score
    if (typeof playerScore === 'number' && playerScore >= 0 && playerScore <= 10000000) {
        validation.validScore = true;
    } else {
        validation.errors.push(`Invalid score: ${playerScore} (must be number 0-10000000)`);
    }
    
    // Validate name
    if (typeof playerName === 'string' && playerName.trim().length > 0 && playerName.length <= 18) {
        validation.validName = true;
    } else {
        validation.errors.push(`Invalid name: ${playerName} (must be 1-18 characters)`);
    }
    
    // Validate mode
    const validModes = ['original', 'iceFrost', 'ballGoBoom'];
    if (typeof gameMode === 'string' && validModes.includes(gameMode)) {
        validation.validMode = true;
    } else {
        validation.errors.push(`Invalid mode: ${gameMode} (must be ${validModes.join(', ')})`);
    }
    
    validation.isValid = validation.validScore && validation.validName && validation.validMode;
    
    if (!validation.isValid) {
        console.error('🔒 PROTECTED: Validation failed:', validation.errors);
    } else {
        console.log('🔒 PROTECTED: Validation passed');
    }
    
    return validation;
};

// ⚠️⚠️⚠️ CRITICAL: Complete protected submission flow ⚠️⚠️⚠️
window.PROTECTED_completeSubmission = async function(playerName, playerScore, gameMode) {
    console.log('🔒 PROTECTED: Starting complete submission flow...');
    
    try {
        // Step 1: Validate all data
        const validation = window.PROTECTED_validateScore(playerScore, playerName, gameMode);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Step 2: Ensure authentication
        const authOk = await window.PROTECTED_ensureAuth();
        if (!authOk) {
            throw new Error('Authentication verification failed');
        }
        
        // Step 3: Submit to Supabase
        const result = await window.PROTECTED_supabaseSubmit(playerName, playerScore, gameMode);
        
        console.log('🔒 PROTECTED: Complete submission successful');
        return result;
        
    } catch (error) {
        console.error('🔒 PROTECTED ERROR: Complete submission failed:', error);
        throw error;
    }
};

console.log('🔒 PROTECTED-supabase-integration.js loaded');