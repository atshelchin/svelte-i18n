# Translation Editor

The svelte-i18n Translation Editor is a powerful web-based tool that allows anyone to create and manage translations without technical knowledge.

## Features

### 🎯 Core Features

- **Visual Translation Interface** - No JSON editing required
- **AI-Powered Translation** - Integrate with OpenAI for instant translations
- **Multiple Source Languages** - Import multiple source files for better context
- **Progress Tracking** - Real-time progress with visual indicators
- **Auto-Save** - Never lose your work with automatic browser caching
- **Resume Capability** - Continue where you left off anytime

### 📥 Import Options

#### 1. File Upload

- Drag and drop or browse to upload JSON translation files
- Support for multiple files (up to 3)
- Automatic validation and structure detection

#### 2. URL Import

- Load translations directly from URLs
- Support for multiple URLs (comma or newline separated)
- Perfect for loading from CDNs or remote repositories

#### 3. Resume Translation

- Continue incomplete translation work
- Import previously exported incomplete translations
- Maintains all metadata and progress

### 💾 Caching & Storage

- **Automatic Saving** - Every change is saved to browser IndexedDB
- **Task History** - View and restore previous translation sessions
- **Export Options**:
  - Complete translations as JSON
  - Incomplete work with `_cache` metadata for resuming
- **Never Lose Work** - Even if browser crashes, your progress is safe

### 📊 Progress Tracking

The editor uses intelligent progress detection:

- **Empty fields** → Counted as untranslated
- **Any content** → Counted as translated (including TODO markers)
- **Real-time updates** → Progress bar updates as you work
- **Visual indicators** → Color-coded fields show translation status

### 🤖 AI Translation

When configured with OpenAI API:

1. **Single Field Translation** - Click the robot icon next to any field
2. **Bulk Translation** - Translate all untranslated fields at once
3. **Context Awareness** - AI considers field paths and neighboring translations
4. **Multiple Sources** - Better translations when multiple source languages are provided

### 📋 Validation

- **Real-time Validation** - Immediate feedback on translation completeness
- **Missing Keys Detection** - Identifies keys present in source but missing in target
- **Extra Keys Warning** - Alerts for keys in target not present in source
- **Visual Indicators** - Color-coded validation status

## Usage Guide

### Starting a New Translation

1. **Choose Target Language**
   - Enter language code (e.g., "ja" for Japanese)
   - Provide native name (e.g., "日本語")
   - Select text direction (LTR/RTL)
   - Choose flag emoji

2. **Load Source Files**
   - Upload one or more source JSON files
   - Or provide URLs to load from
   - Multiple sources provide better context

3. **Configure AI (Optional)**
   - Enter OpenAI API key
   - Select model (GPT-3.5 or GPT-4)
   - Enable for one-click translations

4. **Start Translating**
   - Click on fields to edit
   - Use AI translate button for assistance
   - Progress saves automatically

### Resuming Work

1. **From History**
   - Click "Translation History"
   - Select a previous session
   - Click "Resume" to continue

2. **From File**
   - Export incomplete translation with cache
   - Later, choose "Resume Translation" mode
   - Upload the file to continue

### Exporting Results

1. **Complete Translation**
   - Click "Export Translation"
   - Saves as `[lang-code].json`
   - Ready for production use

2. **Incomplete Translation**
   - Includes `_cache` field with metadata
   - Can be resumed later
   - Preserves all progress

## Best Practices

1. **Use Multiple Sources** - Provide 2-3 source languages for better AI context
2. **Regular Exports** - Export your work periodically as backup
3. **Validate Before Export** - Check validation warnings before finalizing
4. **Test Translations** - Import exported files back to verify structure

## Keyboard Shortcuts

- `Tab` - Move to next field
- `Shift+Tab` - Move to previous field
- `Ctrl/Cmd+S` - Save to browser cache
- `Ctrl/Cmd+E` - Export translation
- `Ctrl/Cmd+G` - Translate current field with AI

## Technical Details

### Cache Structure

Incomplete translations include a `_cache` field:

```json
{
  "_meta": { ... },
  "_cache": {
    "version": "1.0.0",
    "timestamp": 1704067200000,
    "sessionId": "abc-123",
    "sourceLanguages": ["en", "es"],
    "targetLanguage": "ja",
    "untranslatedKeys": ["key1", "key2"],
    "metadata": {
      "totalKeys": 100,
      "translatedKeys": 75,
      "aiEnabled": true
    }
  },
  "welcome": "ようこそ",
  "nav": { ... }
}
```

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires IndexedDB support for caching features.

## Troubleshooting

### Common Issues

1. **Cache not saving**
   - Check browser storage permissions
   - Ensure IndexedDB is not disabled
   - Try different browser if issue persists

2. **AI translation fails**
   - Verify API key is correct
   - Check API rate limits
   - Ensure target language is specified

3. **Import fails**
   - Verify JSON format is valid
   - Check file encoding (UTF-8 required)
   - Ensure \_meta field exists in source

### Getting Help

For issues or feature requests, please visit:

- [GitHub Issues](https://github.com/atshelchin/svelte-i18n/issues)
- [Documentation](https://github.com/atshelchin/svelte-i18n/docs)
