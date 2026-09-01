/**
 * Tone.js Integration Test
 * 
 * This script tests the Tone.js audio pipeline that was implemented
 * in the chord progression tool to verify it works correctly.
 */

// Test 1: Verify Tone.js is available
console.log('=== Test 1: Tone.js Availability ===');
if (typeof Tone !== 'undefined') {
    console.log('✅ Tone.js is available');
    console.log('Tone.js version:', Tone.version);
} else {
    console.log('❌ Tone.js not available');
    process.exit(1);
}

// Test 2: Test basic synth creation and playback
console.log('\n=== Test 2: Basic Synth Test ===');
async function testBasicSynth() {
    try {
        // Start audio context
        await Tone.start();
        console.log('✅ Audio context started');
        
        // Create synth (same settings as in PlaybackControls.jsx)
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }).connect(Tone.Destination);
        synth.volume.value = -20;
        console.log('✅ Synth created with settings');
        
        // Test duration conversion function (from PlaybackControls.jsx)
        const beatsToToneNotation = (beats) => {
            if (beats === 4) return '1n';    // Whole note
            if (beats === 2) return '2n';    // Half note
            if (beats === 1) return '4n';    // Quarter note
            if (beats === 0.5) return '8n';   // Eighth note
            if (beats === 0.25) return '16n'; // Sixteenth note
            return `${beats}n`; // Custom duration
        };
        
        console.log('✅ Duration conversion function created');
        
        // Test duration conversion
        console.log('Duration conversion tests:');
        console.log('4 beats ->', beatsToToneNotation(4));   // Should be '1n'
        console.log('2 beats ->', beatsToToneNotation(2));   // Should be '2n'
        console.log('1 beat ->', beatsToToneNotation(1));    // Should be '4n'
        console.log('0.5 beats ->', beatsToToneNotation(0.5)); // Should be '8n'
        
        // Test playing a C Major chord
        console.log('\n🎵 Playing C Major chord for 1 second...');
        synth.triggerAttackRelease(['C4', 'E4', 'G4'], '1n');
        
        // Wait for chord to play
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('✅ Basic synth test completed');
        
        // Test 3: Test chord progression sequence
        console.log('\n=== Test 3: Chord Progression Sequence ===');
        
        // Create test progression (C-G-Am-F)
        const testProgression = [
            { time: 0, notes: ['C4', 'E4', 'G4'], duration: '1n', index: 0 },    // C Major
            { time: 1, notes: ['G4', 'B4', 'D5'], duration: '1n', index: 1 },    // G Major  
            { time: 2, notes: ['A4', 'C5', 'E5'], duration: '1n', index: 2 },    // A Minor
            { time: 3, notes: ['F4', 'A4', 'C5'], duration: '1n', index: 3 }     // F Major
        ];
        
        console.log('Creating chord progression sequence...');
        
        // Create sequence (same as in PlaybackControls.jsx)
        const seq = new Tone.Sequence((time, chord) => {
            if (chord.notes && chord.notes.length > 0) {
                synth.triggerAttackRelease(chord.notes, chord.duration, time);
                console.log(`🎵 Playing chord at index ${chord.index}:`, chord.notes);
            }
        }, testProgression, '1n');
        
        // Set tempo and play
        Tone.Transport.bpm.value = 120;
        Tone.Transport.start();
        seq.start(0);
        
        console.log('✅ Chord progression started');
        console.log('🎵 Playing C-G-Am-F progression at 120 BPM...');
        
        // Wait for progression to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Cleanup
        seq.stop();
        Tone.Transport.stop();
        seq.dispose();
        synth.dispose();
        
        console.log('✅ Chord progression test completed');
        console.log('\n=== All Tests Completed Successfully ===');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run tests
testBasicSynth().catch(console.error);