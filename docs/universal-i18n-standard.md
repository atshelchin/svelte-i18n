# Universal i18n JSON Standard

## Cross-Platform Internationalization Standard for Rust, Node.js, Swift, Flutter, and Web Applications

### Version 1.0.0

## Overview

This document defines a universal JSON-based internationalization (i18n) standard that can be used across different programming languages and platforms including Rust, Node.js, Swift (Xcode), Flutter, and web frameworks like Svelte, React, and Vue.

## Core Principles

1. **Platform Agnostic**: Works with any programming language or framework
2. **Type Safety Ready**: Structure supports type generation for TypeScript, Rust, Swift, etc.
3. **Human Readable**: Easy to edit manually or through tools
4. **Extensible**: Supports custom metadata and features
5. **Version Compatible**: Backward compatible with version tracking

## JSON Structure

### Basic Structure

```json
{
	"$schema": "https://example.com/i18n-schema-v1.json",
	"$version": "1.0.0",
	"_meta": {
		"name": "English",
		"englishName": "English",
		"nativeName": "English",
		"code": "en",
		"iso639_1": "en",
		"iso639_2": "eng",
		"direction": "ltr",
		"flag": "🇬🇧",
		"region": "US",
		"pluralRules": "standard",
		"dateFormat": "MM/DD/YYYY",
		"timeFormat": "12h",
		"numberFormat": {
			"decimal": ".",
			"thousand": ",",
			"currency": "USD"
		}
	},
	"translations": {
		// Your actual translations here
	}
}
```

### Translation Keys Structure

#### Simple Key-Value

```json
{
	"translations": {
		"greeting": "Hello, world!",
		"welcome": "Welcome"
	}
}
```

#### Nested Keys (Namespacing)

```json
{
	"translations": {
		"nav": {
			"home": "Home",
			"about": "About",
			"contact": "Contact"
		},
		"user": {
			"profile": {
				"title": "User Profile",
				"name": "Name"
			}
		}
	}
}
```

#### Interpolation (Variables)

```json
{
	"translations": {
		"welcome": "Welcome {name}!",
		"greeting": "Hello, {firstName} {lastName}",
		"balance": "Your balance is {amount, currency}"
	}
}
```

#### Pluralization

```json
{
	"translations": {
		"items": {
			"_type": "plural",
			"zero": "No items",
			"one": "{count} item",
			"other": "{count} items"
		},
		"messages": {
			"_type": "plural",
			"zero": "You have no messages",
			"one": "You have 1 message",
			"few": "You have {count} messages",
			"many": "You have {count} messages",
			"other": "You have {count} messages"
		}
	}
}
```

#### Rich Text Support

```json
{
	"translations": {
		"terms": {
			"_type": "rich",
			"content": "By clicking agree, you accept our <link>terms and conditions</link>",
			"elements": {
				"link": {
					"href": "/terms",
					"target": "_blank"
				}
			}
		}
	}
}
```

#### Context-Based Translations

```json
{
	"translations": {
		"save": {
			"_type": "context",
			"default": "Save",
			"button": "Save",
			"menu": "Save file",
			"tooltip": "Save the current document"
		}
	}
}
```

## Metadata Specification

### Required Metadata Fields

- `code`: ISO language code (e.g., "en", "de", "zh")
- `name`: Display name in the target language
- `englishName`: Display name in English
- `direction`: Text direction ("ltr" or "rtl")

### Optional Metadata Fields

- `nativeName`: Native name of the language
- `iso639_1`: Two-letter ISO code
- `iso639_2`: Three-letter ISO code
- `flag`: Emoji flag or icon identifier
- `region`: Region/country code
- `pluralRules`: Pluralization rule set identifier
- `dateFormat`: Default date format
- `timeFormat`: 12h or 24h
- `numberFormat`: Number formatting rules
- `currency`: Default currency code
- `fallback`: Fallback language code

## File Organization

### Recommended Directory Structure

```
translations/
├── schema/
│   └── i18n-schema-v1.json
├── locales/
│   ├── en.json
│   ├── en-US.json
│   ├── en-GB.json
│   ├── de.json
│   ├── fr.json
│   ├── zh-CN.json
│   └── ...
├── namespaces/           # Optional: for large applications
│   ├── common/
│   │   ├── en.json
│   │   └── de.json
│   ├── auth/
│   │   ├── en.json
│   │   └── de.json
│   └── ...
└── config.json          # Global configuration
```

### Configuration File

```json
{
	"version": "1.0.0",
	"defaultLocale": "en",
	"fallbackLocale": "en",
	"supportedLocales": ["en", "de", "fr", "zh-CN"],
	"namespaces": {
		"enabled": true,
		"default": "common",
		"list": ["common", "auth", "dashboard"]
	},
	"validation": {
		"strictMode": true,
		"missingKeyWarning": true,
		"extraKeyWarning": true
	},
	"build": {
		"outputDir": "./dist/i18n",
		"generateTypes": true,
		"minify": true
	}
}
```

## Platform-Specific Implementation

### TypeScript/JavaScript Type Generation

```typescript
// Auto-generated from JSON
export interface Translations {
	nav: {
		home: string;
		about: string;
		contact: string;
	};
	user: {
		profile: {
			title: string;
			name: string;
		};
	};
	welcome: (params: { name: string }) => string;
	items: (count: number) => string;
}
```

### Rust Structure

```rust
// Auto-generated from JSON
#[derive(Deserialize, Serialize)]
pub struct Translations {
    pub nav: Nav,
    pub user: User,
    #[serde(flatten)]
    pub strings: HashMap<String, String>,
}

#[derive(Deserialize, Serialize)]
pub struct Nav {
    pub home: String,
    pub about: String,
    pub contact: String,
}
```

### Swift Structure

```swift
// Auto-generated from JSON
struct Translations: Codable {
    let nav: Nav
    let user: User

    struct Nav: Codable {
        let home: String
        let about: String
        let contact: String
    }

    struct User: Codable {
        let profile: Profile

        struct Profile: Codable {
            let title: String
            let name: String
        }
    }
}
```

### Flutter/Dart Structure

```dart
// Auto-generated from JSON
class Translations {
  final Nav nav;
  final User user;

  Translations({required this.nav, required this.user});

  factory Translations.fromJson(Map<String, dynamic> json) {
    return Translations(
      nav: Nav.fromJson(json['nav']),
      user: User.fromJson(json['user']),
    );
  }
}

class Nav {
  final String home;
  final String about;
  final String contact;

  Nav({required this.home, required this.about, required this.contact});

  factory Nav.fromJson(Map<String, dynamic> json) {
    return Nav(
      home: json['home'],
      about: json['about'],
      contact: json['contact'],
    );
  }
}
```

## Validation Rules

### Key Validation

- Keys must be valid identifiers (alphanumeric, underscore, no spaces)
- Keys are case-sensitive
- Maximum nesting depth: 5 levels
- Reserved keys start with underscore (e.g., `_meta`, `_type`)

### Value Validation

- All translation values must be strings or objects with `_type`
- Interpolation variables use `{variable}` syntax
- HTML/XML tags should be escaped or use rich text type

### File Validation

- Must be valid JSON
- UTF-8 encoding required
- File size limit: 10MB per locale file
- Must include `_meta` section

## Translation Editor Integration

The Translation Editor should support:

1. **Import/Export**: Support for this JSON format
2. **Validation**: Real-time validation against schema
3. **Type Generation**: Generate types for target platforms
4. **Diff View**: Show changes between versions
5. **Search & Filter**: Find keys across all locales
6. **Batch Operations**: Update multiple translations at once
7. **Comments**: Support for translator notes
8. **Version Control**: Track changes and history
9. **API Access**: REST/GraphQL API for programmatic access
10. **Webhooks**: Notify systems of translation updates

## API Specification for Translation Editor

### REST API Endpoints

```
GET    /api/v1/projects                    # List all projects
POST   /api/v1/projects                    # Create new project
GET    /api/v1/projects/{id}              # Get project details
PUT    /api/v1/projects/{id}              # Update project
DELETE /api/v1/projects/{id}              # Delete project

GET    /api/v1/projects/{id}/locales      # List all locales
POST   /api/v1/projects/{id}/locales      # Add new locale
GET    /api/v1/projects/{id}/locales/{code} # Get locale translations
PUT    /api/v1/projects/{id}/locales/{code} # Update locale translations
DELETE /api/v1/projects/{id}/locales/{code} # Remove locale

POST   /api/v1/projects/{id}/validate     # Validate all translations
POST   /api/v1/projects/{id}/export       # Export translations
POST   /api/v1/projects/{id}/import       # Import translations
GET    /api/v1/projects/{id}/types/{platform} # Generate types for platform
```

### WebSocket Events

```javascript
// Real-time collaboration
ws.on('translation:update', (data) => {
	// { locale: 'en', key: 'nav.home', value: 'Home', user: 'user123' }
});

ws.on('locale:add', (data) => {
	// { locale: 'fr', user: 'user123' }
});

ws.on('validation:error', (data) => {
	// { locale: 'de', errors: [...] }
});
```

## CLI Tool Specification

```bash
# Initialize new i18n project
i18n init --standard universal

# Add new locale
i18n add locale fr

# Validate translations
i18n validate --strict

# Generate types
i18n generate types --platform typescript --output ./src/types
i18n generate types --platform rust --output ./src/i18n
i18n generate types --platform swift --output ./Sources/I18n

# Sync with Translation Editor
i18n sync --api-key YOUR_API_KEY --project my-app

# Extract keys from source code
i18n extract --source ./src --output ./translations/extracted.json

# Check for missing translations
i18n check missing --locale de

# Build optimized bundles
i18n build --output ./dist/i18n --minify
```

## Migration from Other Formats

### From Traditional .properties files

```bash
i18n migrate properties --input ./locales --output ./translations
```

### From .po/.pot files

```bash
i18n migrate gettext --input ./po --output ./translations
```

### From XLIFF files

```bash
i18n migrate xliff --input ./xliff --output ./translations
```

## Best Practices

1. **Version Control**: Always commit translation files to version control
2. **CI/CD Integration**: Validate translations in CI pipeline
3. **Code Review**: Review translation changes like code changes
4. **Naming Convention**: Use consistent key naming (camelCase or snake_case)
5. **Namespace Usage**: Use namespaces for large applications
6. **Fallback Strategy**: Always define fallback locale
7. **Cache Strategy**: Implement appropriate caching for production
8. **Lazy Loading**: Load translations on-demand for better performance
9. **Security**: Sanitize user inputs in interpolated strings
10. **Testing**: Write tests for critical translations

## Example Implementation

### Complete Example File (en.json)

```json
{
	"$schema": "https://example.com/i18n-schema-v1.json",
	"$version": "1.0.0",
	"_meta": {
		"name": "English",
		"englishName": "English",
		"nativeName": "English",
		"code": "en",
		"iso639_1": "en",
		"iso639_2": "eng",
		"direction": "ltr",
		"flag": "🇬🇧",
		"region": "US",
		"pluralRules": "standard",
		"dateFormat": "MM/DD/YYYY",
		"timeFormat": "12h",
		"numberFormat": {
			"decimal": ".",
			"thousand": ",",
			"currency": "USD"
		}
	},
	"translations": {
		"common": {
			"app_name": "My Application",
			"welcome": "Welcome {name}!",
			"greeting": "Hello, world!",
			"loading": "Loading...",
			"error": "An error occurred"
		},
		"nav": {
			"home": "Home",
			"about": "About",
			"contact": "Contact",
			"settings": "Settings"
		},
		"auth": {
			"login": "Log In",
			"logout": "Log Out",
			"signup": "Sign Up",
			"forgot_password": "Forgot Password?",
			"reset_password": "Reset Password",
			"email": "Email",
			"password": "Password",
			"confirm_password": "Confirm Password"
		},
		"user": {
			"profile": {
				"title": "User Profile",
				"name": "Name",
				"email": "Email",
				"bio": "Biography",
				"avatar": "Avatar",
				"joined": "Joined {date}"
			},
			"settings": {
				"title": "Settings",
				"language": "Language",
				"theme": "Theme",
				"notifications": "Notifications",
				"privacy": "Privacy"
			}
		},
		"items": {
			"_type": "plural",
			"zero": "No items",
			"one": "{count} item",
			"other": "{count} items"
		},
		"messages": {
			"success": {
				"saved": "Successfully saved",
				"deleted": "Successfully deleted",
				"updated": "Successfully updated"
			},
			"error": {
				"generic": "An error occurred",
				"network": "Network error",
				"validation": "Validation error",
				"not_found": "Not found"
			},
			"confirm": {
				"delete": "Are you sure you want to delete this item?",
				"logout": "Are you sure you want to log out?"
			}
		},
		"date": {
			"today": "Today",
			"yesterday": "Yesterday",
			"tomorrow": "Tomorrow",
			"days_ago": {
				"_type": "plural",
				"one": "{count} day ago",
				"other": "{count} days ago"
			}
		},
		"time": {
			"seconds_ago": {
				"_type": "plural",
				"one": "{count} second ago",
				"other": "{count} seconds ago"
			},
			"minutes_ago": {
				"_type": "plural",
				"one": "{count} minute ago",
				"other": "{count} minutes ago"
			},
			"hours_ago": {
				"_type": "plural",
				"one": "{count} hour ago",
				"other": "{count} hours ago"
			}
		},
		"actions": {
			"save": {
				"_type": "context",
				"default": "Save",
				"button": "Save",
				"menu": "Save file",
				"tooltip": "Save the current document (Ctrl+S)"
			},
			"cancel": "Cancel",
			"delete": "Delete",
			"edit": "Edit",
			"submit": "Submit",
			"search": "Search",
			"filter": "Filter",
			"sort": "Sort",
			"refresh": "Refresh"
		},
		"validation": {
			"required": "This field is required",
			"email": "Please enter a valid email address",
			"min_length": "Must be at least {min} characters",
			"max_length": "Must be no more than {max} characters",
			"pattern": "Invalid format",
			"number": "Must be a number",
			"integer": "Must be a whole number",
			"positive": "Must be a positive number"
		},
		"accessibility": {
			"close": "Close",
			"open_menu": "Open menu",
			"close_menu": "Close menu",
			"toggle_theme": "Toggle theme",
			"skip_to_content": "Skip to content",
			"back_to_top": "Back to top"
		}
	}
}
```

## License

This standard is released under the MIT License and is free to use for any purpose.

## Contributing

To contribute to this standard, please submit proposals through GitHub issues or pull requests.

## Version History

- **1.0.0** (2024-01): Initial release
  - Core structure definition
  - Platform specifications
  - Validation rules
  - API specifications
