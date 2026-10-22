# CLUTCH Ringtones Folder

This dedicated directory holds the incoming call ringtones for CLUTCH (such as the 2-player "Call from Clutch" stage summons).

## Default File
- `clutch-finale-ringtone.mp3`: The default looped incoming call ringtone played when only 2 contenders remain in the tournament.

## Customization Instructions
1. Replace `clutch-finale-ringtone.mp3` with your own `.mp3` or `.wav` file of the same name.
2. Or add a new file (e.g. `my-ringtone.wav`) and update the path in:
   `client/src/config/audioConfig.js`:
   ```javascript
   export const FINALE_RINGTONE_PATH = '/audio/ringtones/my-ringtone.wav';
   ```
