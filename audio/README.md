# Real Audio Samples for Ball Defender

This folder contains real audio recordings that enhance the game's pleasure and ASMR experience.

## How to Add Audio Files

Place .wav or .mp3 files in this directory with these exact names:

### ASMR & Pleasure Sounds
- `soft_impact.wav` - Gentle impact sound (ball hitting block lightly)
- `satisfying_pop.wav` - Satisfying pop/click for block destruction
- `gentle_chime.wav` - Pleasant chime for combos and rewards
- `warm_click.wav` - Warm clicking sound for medium impacts
- `velvet_crush.wav` - Soft crushing sound for tactile satisfaction
- `crystal_ting.wav` - Clear, crystalline ting for special moments
- `bubble_pop.wav` - Bubble popping sound for extra satisfaction
- `silk_rustle.wav` - Gentle rustling for UI interactions
- `reward_chime.wav` - Special reward sound for achievements
- `completion_breath.wav` - Satisfying exhale for level completion
- `perfect_harmony.wav` - Harmonious sound for perfect shots

## Audio Requirements

- **Format**: .wav files preferred (better quality), .mp3 also supported
- **Sample Rate**: 44.1kHz or 48kHz recommended
- **Bit Depth**: 16-bit or 24-bit
- **Duration**: 0.5-3 seconds per sample
- **Volume**: Normalized to avoid clipping

## ASMR Sound Sources

For maximum dopamine response, consider these types of real recordings:
- **Wooden impacts**: Gentle wood tapping/knocking
- **Crystal/glass**: Light crystal bowl sounds, wind chimes
- **Fabric sounds**: Velvet brushing, silk rustling
- **Water**: Small bubble pops, gentle droplets
- **Natural**: Soft finger snaps, quiet mouth sounds

## Fallback System

If audio files are not found, the game will automatically use high-quality synthesized versions of these sounds. Check the browser console to see which files loaded successfully.

## Testing Audio

After adding files, refresh the game and check the console for:
- `✓ Loaded real audio sample: [sound_name]`
- `⚠ Audio file not found: [path] - will use synthesized version`