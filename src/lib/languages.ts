/**
 * Comprehensive language database with ISO 639-1/639-2 codes and native names
 * This database is used for language validation and auto-correction
 */

export interface LanguageInfo {
	code: string; // ISO 639-1 code (preferred)
	code3?: string; // ISO 639-2/T code (3-letter)
	name: string; // Native name in the language itself
	englishName: string; // English name
	direction: 'ltr' | 'rtl'; // Text direction
	flag?: string; // Optional flag emoji
}

export const LANGUAGES: Record<string, LanguageInfo> = {
	// A
	aa: { code: 'aa', name: 'Qafaraf', englishName: 'Afar', direction: 'ltr' },
	ab: { code: 'ab', name: 'Аҧсуа', englishName: 'Abkhazian', direction: 'ltr' },
	af: { code: 'af', name: 'Afrikaans', englishName: 'Afrikaans', direction: 'ltr', flag: '🇿🇦' },
	ak: { code: 'ak', name: 'Akan', englishName: 'Akan', direction: 'ltr' },
	am: { code: 'am', name: 'አማርኛ', englishName: 'Amharic', direction: 'ltr', flag: '🇪🇹' },
	ar: { code: 'ar', name: 'العربية', englishName: 'Arabic', direction: 'rtl', flag: '🇸🇦' },
	as: { code: 'as', name: 'অসমীয়া', englishName: 'Assamese', direction: 'ltr' },
	ay: { code: 'ay', name: 'Aymar aru', englishName: 'Aymara', direction: 'ltr' },
	az: { code: 'az', name: 'Azərbaycan', englishName: 'Azerbaijani', direction: 'ltr', flag: '🇦🇿' },

	// B
	ba: { code: 'ba', name: 'Башҡорт', englishName: 'Bashkir', direction: 'ltr' },
	be: { code: 'be', name: 'Беларуская', englishName: 'Belarusian', direction: 'ltr', flag: '🇧🇾' },
	bg: { code: 'bg', name: 'Български', englishName: 'Bulgarian', direction: 'ltr', flag: '🇧🇬' },
	bh: { code: 'bh', name: 'भोजपुरी', englishName: 'Bihari', direction: 'ltr' },
	bi: { code: 'bi', name: 'Bislama', englishName: 'Bislama', direction: 'ltr' },
	bm: { code: 'bm', name: 'Bamanankan', englishName: 'Bambara', direction: 'ltr' },
	bn: { code: 'bn', name: 'বাংলা', englishName: 'Bengali', direction: 'ltr', flag: '🇧🇩' },
	bo: { code: 'bo', name: 'བོད་སྐད', englishName: 'Tibetan', direction: 'ltr' },
	br: { code: 'br', name: 'Brezhoneg', englishName: 'Breton', direction: 'ltr' },
	bs: { code: 'bs', name: 'Bosanski', englishName: 'Bosnian', direction: 'ltr', flag: '🇧🇦' },

	// C
	ca: { code: 'ca', name: 'Català', englishName: 'Catalan', direction: 'ltr', flag: '🇦🇩' },
	ce: { code: 'ce', name: 'Нохчийн', englishName: 'Chechen', direction: 'ltr' },
	ch: { code: 'ch', name: 'Chamoru', englishName: 'Chamorro', direction: 'ltr' },
	co: { code: 'co', name: 'Corsu', englishName: 'Corsican', direction: 'ltr' },
	cr: { code: 'cr', name: 'ᓀᐦᐃᔭᐍᐏᐣ', englishName: 'Cree', direction: 'ltr' },
	cs: { code: 'cs', name: 'Čeština', englishName: 'Czech', direction: 'ltr', flag: '🇨🇿' },
	cu: { code: 'cu', name: 'Словѣньскъ', englishName: 'Church Slavonic', direction: 'ltr' },
	cv: { code: 'cv', name: 'Чăваш', englishName: 'Chuvash', direction: 'ltr' },
	cy: { code: 'cy', name: 'Cymraeg', englishName: 'Welsh', direction: 'ltr', flag: '🏴󐁧󐁢󐁷󐁬󐁳󐁿' },

	// D
	da: { code: 'da', name: 'Dansk', englishName: 'Danish', direction: 'ltr', flag: '🇩🇰' },
	de: { code: 'de', name: 'Deutsch', englishName: 'German', direction: 'ltr', flag: '🇩🇪' },
	dv: { code: 'dv', name: 'ދިވެހި', englishName: 'Divehi', direction: 'rtl', flag: '🇲🇻' },
	dz: { code: 'dz', name: 'རྫོང་ཁ', englishName: 'Dzongkha', direction: 'ltr', flag: '🇧🇹' },

	// E
	ee: { code: 'ee', name: 'Eʋegbe', englishName: 'Ewe', direction: 'ltr' },
	el: { code: 'el', name: 'Ελληνικά', englishName: 'Greek', direction: 'ltr', flag: '🇬🇷' },
	en: { code: 'en', name: 'English', englishName: 'English', direction: 'ltr', flag: '🇬🇧' },
	eo: { code: 'eo', name: 'Esperanto', englishName: 'Esperanto', direction: 'ltr' },
	es: { code: 'es', name: 'Español', englishName: 'Spanish', direction: 'ltr', flag: '🇪🇸' },
	et: { code: 'et', name: 'Eesti', englishName: 'Estonian', direction: 'ltr', flag: '🇪🇪' },
	eu: { code: 'eu', name: 'Euskara', englishName: 'Basque', direction: 'ltr' },

	// F
	fa: { code: 'fa', name: 'فارسی', englishName: 'Persian', direction: 'rtl', flag: '🇮🇷' },
	ff: { code: 'ff', name: 'Fulfulde', englishName: 'Fulah', direction: 'ltr' },
	fi: { code: 'fi', name: 'Suomi', englishName: 'Finnish', direction: 'ltr', flag: '🇫🇮' },
	fj: { code: 'fj', name: 'Vosa Vakaviti', englishName: 'Fijian', direction: 'ltr', flag: '🇫🇯' },
	fo: { code: 'fo', name: 'Føroyskt', englishName: 'Faroese', direction: 'ltr', flag: '🇫🇴' },
	fr: { code: 'fr', name: 'Français', englishName: 'French', direction: 'ltr', flag: '🇫🇷' },
	fy: { code: 'fy', name: 'Frysk', englishName: 'Western Frisian', direction: 'ltr' },

	// G
	ga: { code: 'ga', name: 'Gaeilge', englishName: 'Irish', direction: 'ltr', flag: '🇮🇪' },
	gd: {
		code: 'gd',
		name: 'Gàidhlig',
		englishName: 'Scottish Gaelic',
		direction: 'ltr',
		flag: '🏴󐁧󐁢󐁳󐁣󐁴󐁿'
	},
	gl: { code: 'gl', name: 'Galego', englishName: 'Galician', direction: 'ltr' },
	gn: { code: 'gn', name: "Avañe'ẽ", englishName: 'Guarani', direction: 'ltr' },
	gu: { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', direction: 'ltr' },
	gv: { code: 'gv', name: 'Gaelg', englishName: 'Manx', direction: 'ltr' },

	// H
	ha: { code: 'ha', name: 'Hausa', englishName: 'Hausa', direction: 'ltr' },
	he: { code: 'he', name: 'עברית', englishName: 'Hebrew', direction: 'rtl', flag: '🇮🇱' },
	hi: { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', direction: 'ltr', flag: '🇮🇳' },
	ho: { code: 'ho', name: 'Hiri Motu', englishName: 'Hiri Motu', direction: 'ltr' },
	hr: { code: 'hr', name: 'Hrvatski', englishName: 'Croatian', direction: 'ltr', flag: '🇭🇷' },
	ht: {
		code: 'ht',
		name: 'Kreyòl ayisyen',
		englishName: 'Haitian Creole',
		direction: 'ltr',
		flag: '🇭🇹'
	},
	hu: { code: 'hu', name: 'Magyar', englishName: 'Hungarian', direction: 'ltr', flag: '🇭🇺' },
	hy: { code: 'hy', name: 'Հայերեն', englishName: 'Armenian', direction: 'ltr', flag: '🇦🇲' },
	hz: { code: 'hz', name: 'Otjiherero', englishName: 'Herero', direction: 'ltr' },

	// I
	ia: { code: 'ia', name: 'Interlingua', englishName: 'Interlingua', direction: 'ltr' },
	id: {
		code: 'id',
		name: 'Bahasa Indonesia',
		englishName: 'Indonesian',
		direction: 'ltr',
		flag: '🇮🇩'
	},
	ie: { code: 'ie', name: 'Interlingue', englishName: 'Interlingue', direction: 'ltr' },
	ig: { code: 'ig', name: 'Igbo', englishName: 'Igbo', direction: 'ltr' },
	ii: { code: 'ii', name: 'ꆈꌠꉙ', englishName: 'Sichuan Yi', direction: 'ltr' },
	ik: { code: 'ik', name: 'Iñupiaq', englishName: 'Inupiaq', direction: 'ltr' },
	io: { code: 'io', name: 'Ido', englishName: 'Ido', direction: 'ltr' },
	is: { code: 'is', name: 'Íslenska', englishName: 'Icelandic', direction: 'ltr', flag: '🇮🇸' },
	it: { code: 'it', name: 'Italiano', englishName: 'Italian', direction: 'ltr', flag: '🇮🇹' },
	iu: { code: 'iu', name: 'ᐃᓄᒃᑎᑐᑦ', englishName: 'Inuktitut', direction: 'ltr' },

	// J
	ja: { code: 'ja', name: '日本語', englishName: 'Japanese', direction: 'ltr', flag: '🇯🇵' },
	jv: { code: 'jv', name: 'Basa Jawa', englishName: 'Javanese', direction: 'ltr' },

	// K
	ka: { code: 'ka', name: 'ქართული', englishName: 'Georgian', direction: 'ltr', flag: '🇬🇪' },
	kg: { code: 'kg', name: 'Kikongo', englishName: 'Kongo', direction: 'ltr' },
	ki: { code: 'ki', name: 'Gĩkũyũ', englishName: 'Kikuyu', direction: 'ltr' },
	kj: { code: 'kj', name: 'Kuanyama', englishName: 'Kuanyama', direction: 'ltr' },
	kk: { code: 'kk', name: 'Қазақша', englishName: 'Kazakh', direction: 'ltr', flag: '🇰🇿' },
	kl: { code: 'kl', name: 'Kalaallisut', englishName: 'Greenlandic', direction: 'ltr', flag: '🇬🇱' },
	km: { code: 'km', name: 'ភាសាខ្មែរ', englishName: 'Khmer', direction: 'ltr', flag: '🇰🇭' },
	kn: { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', direction: 'ltr' },
	ko: { code: 'ko', name: '한국어', englishName: 'Korean', direction: 'ltr', flag: '🇰🇷' },
	kr: { code: 'kr', name: 'Kanuri', englishName: 'Kanuri', direction: 'ltr' },
	ks: { code: 'ks', name: 'کٲشُر', englishName: 'Kashmiri', direction: 'rtl' },
	ku: { code: 'ku', name: 'Kurdî', englishName: 'Kurdish', direction: 'ltr' },
	kv: { code: 'kv', name: 'Коми', englishName: 'Komi', direction: 'ltr' },
	kw: { code: 'kw', name: 'Kernewek', englishName: 'Cornish', direction: 'ltr' },
	ky: { code: 'ky', name: 'Кыргызча', englishName: 'Kyrgyz', direction: 'ltr', flag: '🇰🇬' },

	// L
	la: { code: 'la', name: 'Latina', englishName: 'Latin', direction: 'ltr' },
	lb: {
		code: 'lb',
		name: 'Lëtzebuergesch',
		englishName: 'Luxembourgish',
		direction: 'ltr',
		flag: '🇱🇺'
	},
	lg: { code: 'lg', name: 'Luganda', englishName: 'Ganda', direction: 'ltr' },
	li: { code: 'li', name: 'Limburgs', englishName: 'Limburgish', direction: 'ltr' },
	ln: { code: 'ln', name: 'Lingála', englishName: 'Lingala', direction: 'ltr' },
	lo: { code: 'lo', name: 'ລາວ', englishName: 'Lao', direction: 'ltr', flag: '🇱🇦' },
	lt: { code: 'lt', name: 'Lietuvių', englishName: 'Lithuanian', direction: 'ltr', flag: '🇱🇹' },
	lu: { code: 'lu', name: 'Tshiluba', englishName: 'Luba-Katanga', direction: 'ltr' },
	lv: { code: 'lv', name: 'Latviešu', englishName: 'Latvian', direction: 'ltr', flag: '🇱🇻' },

	// M
	mg: { code: 'mg', name: 'Malagasy', englishName: 'Malagasy', direction: 'ltr', flag: '🇲🇬' },
	mh: { code: 'mh', name: 'Kajin M̧ajeļ', englishName: 'Marshallese', direction: 'ltr', flag: '🇲🇭' },
	mi: { code: 'mi', name: 'Te Reo Māori', englishName: 'Māori', direction: 'ltr', flag: '🇳🇿' },
	mk: { code: 'mk', name: 'Македонски', englishName: 'Macedonian', direction: 'ltr', flag: '🇲🇰' },
	ml: { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', direction: 'ltr' },
	mn: { code: 'mn', name: 'Монгол', englishName: 'Mongolian', direction: 'ltr', flag: '🇲🇳' },
	mr: { code: 'mr', name: 'मराठी', englishName: 'Marathi', direction: 'ltr' },
	ms: { code: 'ms', name: 'Bahasa Melayu', englishName: 'Malay', direction: 'ltr', flag: '🇲🇾' },
	mt: { code: 'mt', name: 'Malti', englishName: 'Maltese', direction: 'ltr', flag: '🇲🇹' },
	my: { code: 'my', name: 'ဗမာစာ', englishName: 'Burmese', direction: 'ltr', flag: '🇲🇲' },

	// N
	na: { code: 'na', name: 'Dorerin Naoero', englishName: 'Nauru', direction: 'ltr', flag: '🇳🇷' },
	nb: {
		code: 'nb',
		name: 'Norsk bokmål',
		englishName: 'Norwegian Bokmål',
		direction: 'ltr',
		flag: '🇳🇴'
	},
	nd: { code: 'nd', name: 'isiNdebele', englishName: 'North Ndebele', direction: 'ltr' },
	ne: { code: 'ne', name: 'नेपाली', englishName: 'Nepali', direction: 'ltr', flag: '🇳🇵' },
	ng: { code: 'ng', name: 'Oshiwambo', englishName: 'Ndonga', direction: 'ltr' },
	nl: { code: 'nl', name: 'Nederlands', englishName: 'Dutch', direction: 'ltr', flag: '🇳🇱' },
	nn: {
		code: 'nn',
		name: 'Norsk nynorsk',
		englishName: 'Norwegian Nynorsk',
		direction: 'ltr',
		flag: '🇳🇴'
	},
	no: { code: 'no', name: 'Norsk', englishName: 'Norwegian', direction: 'ltr', flag: '🇳🇴' },
	nr: { code: 'nr', name: 'isiNdebele', englishName: 'South Ndebele', direction: 'ltr' },
	nv: { code: 'nv', name: 'Diné bizaad', englishName: 'Navajo', direction: 'ltr' },
	ny: { code: 'ny', name: 'ChiCheŵa', englishName: 'Chichewa', direction: 'ltr' },

	// O
	oc: { code: 'oc', name: 'Occitan', englishName: 'Occitan', direction: 'ltr' },
	oj: { code: 'oj', name: 'ᐊᓂᔑᓈᐯᒧᐎᓐ', englishName: 'Ojibwe', direction: 'ltr' },
	om: { code: 'om', name: 'Afaan Oromoo', englishName: 'Oromo', direction: 'ltr' },
	or: { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Oriya', direction: 'ltr' },
	os: { code: 'os', name: 'Ирон', englishName: 'Ossetian', direction: 'ltr' },

	// P
	pa: { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', direction: 'ltr' },
	pi: { code: 'pi', name: 'पाऴि', englishName: 'Pali', direction: 'ltr' },
	pl: { code: 'pl', name: 'Polski', englishName: 'Polish', direction: 'ltr', flag: '🇵🇱' },
	ps: { code: 'ps', name: 'پښتو', englishName: 'Pashto', direction: 'rtl', flag: '🇦🇫' },
	pt: { code: 'pt', name: 'Português', englishName: 'Portuguese', direction: 'ltr', flag: '🇵🇹' },

	// Q
	qu: { code: 'qu', name: 'Runa Simi', englishName: 'Quechua', direction: 'ltr' },

	// R
	rm: { code: 'rm', name: 'Rumantsch', englishName: 'Romansh', direction: 'ltr' },
	rn: { code: 'rn', name: 'Ikirundi', englishName: 'Rundi', direction: 'ltr' },
	ro: { code: 'ro', name: 'Română', englishName: 'Romanian', direction: 'ltr', flag: '🇷🇴' },
	ru: { code: 'ru', name: 'Русский', englishName: 'Russian', direction: 'ltr', flag: '🇷🇺' },
	rw: {
		code: 'rw',
		name: 'Ikinyarwanda',
		englishName: 'Kinyarwanda',
		direction: 'ltr',
		flag: '🇷🇼'
	},

	// S
	sa: { code: 'sa', name: 'संस्कृतम्', englishName: 'Sanskrit', direction: 'ltr' },
	sc: { code: 'sc', name: 'Sardu', englishName: 'Sardinian', direction: 'ltr' },
	sd: { code: 'sd', name: 'سنڌي', englishName: 'Sindhi', direction: 'rtl' },
	se: { code: 'se', name: 'Davvisámegiella', englishName: 'Northern Sami', direction: 'ltr' },
	sg: { code: 'sg', name: 'Sängö', englishName: 'Sango', direction: 'ltr' },
	si: { code: 'si', name: 'සිංහල', englishName: 'Sinhala', direction: 'ltr', flag: '🇱🇰' },
	sk: { code: 'sk', name: 'Slovenčina', englishName: 'Slovak', direction: 'ltr', flag: '🇸🇰' },
	sl: { code: 'sl', name: 'Slovenščina', englishName: 'Slovenian', direction: 'ltr', flag: '🇸🇮' },
	sm: { code: 'sm', name: 'Gagana Samoa', englishName: 'Samoan', direction: 'ltr', flag: '🇼🇸' },
	sn: { code: 'sn', name: 'chiShona', englishName: 'Shona', direction: 'ltr' },
	so: { code: 'so', name: 'Soomaali', englishName: 'Somali', direction: 'ltr', flag: '🇸🇴' },
	sq: { code: 'sq', name: 'Shqip', englishName: 'Albanian', direction: 'ltr', flag: '🇦🇱' },
	sr: { code: 'sr', name: 'Српски', englishName: 'Serbian', direction: 'ltr', flag: '🇷🇸' },
	ss: { code: 'ss', name: 'SiSwati', englishName: 'Swati', direction: 'ltr' },
	st: { code: 'st', name: 'Sesotho', englishName: 'Southern Sotho', direction: 'ltr' },
	su: { code: 'su', name: 'Basa Sunda', englishName: 'Sundanese', direction: 'ltr' },
	sv: { code: 'sv', name: 'Svenska', englishName: 'Swedish', direction: 'ltr', flag: '🇸🇪' },
	sw: { code: 'sw', name: 'Kiswahili', englishName: 'Swahili', direction: 'ltr' },

	// T
	ta: { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', direction: 'ltr' },
	te: { code: 'te', name: 'తెలుగు', englishName: 'Telugu', direction: 'ltr' },
	tg: { code: 'tg', name: 'Тоҷикӣ', englishName: 'Tajik', direction: 'ltr', flag: '🇹🇯' },
	th: { code: 'th', name: 'ไทย', englishName: 'Thai', direction: 'ltr', flag: '🇹🇭' },
	ti: { code: 'ti', name: 'ትግርኛ', englishName: 'Tigrinya', direction: 'ltr' },
	tk: { code: 'tk', name: 'Türkmen', englishName: 'Turkmen', direction: 'ltr', flag: '🇹🇲' },
	tl: { code: 'tl', name: 'Tagalog', englishName: 'Tagalog', direction: 'ltr', flag: '🇵🇭' },
	tn: { code: 'tn', name: 'Setswana', englishName: 'Tswana', direction: 'ltr' },
	to: { code: 'to', name: 'lea faka-Tonga', englishName: 'Tongan', direction: 'ltr', flag: '🇹🇴' },
	tr: { code: 'tr', name: 'Türkçe', englishName: 'Turkish', direction: 'ltr', flag: '🇹🇷' },
	ts: { code: 'ts', name: 'Xitsonga', englishName: 'Tsonga', direction: 'ltr' },
	tt: { code: 'tt', name: 'Татарча', englishName: 'Tatar', direction: 'ltr' },
	tw: { code: 'tw', name: 'Twi', englishName: 'Twi', direction: 'ltr' },
	ty: { code: 'ty', name: 'Reo Tahiti', englishName: 'Tahitian', direction: 'ltr' },

	// U
	ug: { code: 'ug', name: 'ئۇيغۇرچە', englishName: 'Uyghur', direction: 'rtl' },
	uk: { code: 'uk', name: 'Українська', englishName: 'Ukrainian', direction: 'ltr', flag: '🇺🇦' },
	ur: { code: 'ur', name: 'اردو', englishName: 'Urdu', direction: 'rtl', flag: '🇵🇰' },
	uz: { code: 'uz', name: 'Oʻzbek', englishName: 'Uzbek', direction: 'ltr', flag: '🇺🇿' },

	// V
	ve: { code: 've', name: 'Tshivenḓa', englishName: 'Venda', direction: 'ltr' },
	vi: { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', direction: 'ltr', flag: '🇻🇳' },
	vo: { code: 'vo', name: 'Volapük', englishName: 'Volapük', direction: 'ltr' },

	// W
	wa: { code: 'wa', name: 'Walon', englishName: 'Walloon', direction: 'ltr' },
	wo: { code: 'wo', name: 'Wolof', englishName: 'Wolof', direction: 'ltr' },

	// X
	xh: { code: 'xh', name: 'isiXhosa', englishName: 'Xhosa', direction: 'ltr' },

	// Y
	yi: { code: 'yi', name: 'ייִדיש', englishName: 'Yiddish', direction: 'rtl' },
	yo: { code: 'yo', name: 'Yorùbá', englishName: 'Yoruba', direction: 'ltr' },

	// Z
	za: { code: 'za', name: '壮语', englishName: 'Zhuang', direction: 'ltr' },
	zh: { code: 'zh', name: '中文', englishName: 'Chinese', direction: 'ltr', flag: '🇨🇳' },
	zu: { code: 'zu', name: 'isiZulu', englishName: 'Zulu', direction: 'ltr' },

	// Common aliases and variations
	'zh-cn': {
		code: 'zh-cn',
		name: '简体中文',
		englishName: 'Chinese (Simplified)',
		direction: 'ltr',
		flag: '🇨🇳'
	},
	'zh-tw': {
		code: 'zh-TW',
		name: '繁體中文',
		englishName: 'Chinese (Traditional)',
		direction: 'ltr',
		flag: '🇹🇼'
	},
	'zh-hk': {
		code: 'zh-HK',
		name: '繁體中文（香港）',
		englishName: 'Chinese (Hong Kong)',
		direction: 'ltr',
		flag: '🇭🇰'
	},
	'pt-br': {
		code: 'pt-BR',
		name: 'Português (Brasil)',
		englishName: 'Portuguese (Brazil)',
		direction: 'ltr',
		flag: '🇧🇷'
	},
	'pt-pt': {
		code: 'pt',
		name: 'Português (Portugal)',
		englishName: 'Portuguese (Portugal)',
		direction: 'ltr',
		flag: '🇵🇹'
	},
	'en-us': {
		code: 'en',
		name: 'English (US)',
		englishName: 'English (United States)',
		direction: 'ltr',
		flag: '🇺🇸'
	},
	'en-gb': {
		code: 'en',
		name: 'English (UK)',
		englishName: 'English (United Kingdom)',
		direction: 'ltr',
		flag: '🇬🇧'
	},
	'en-au': {
		code: 'en',
		name: 'English (Australia)',
		englishName: 'English (Australia)',
		direction: 'ltr',
		flag: '🇦🇺'
	},
	'en-ca': {
		code: 'en',
		name: 'English (Canada)',
		englishName: 'English (Canada)',
		direction: 'ltr',
		flag: '🇨🇦'
	},
	'es-es': {
		code: 'es',
		name: 'Español (España)',
		englishName: 'Spanish (Spain)',
		direction: 'ltr',
		flag: '🇪🇸'
	},
	'es-mx': {
		code: 'es',
		name: 'Español (México)',
		englishName: 'Spanish (Mexico)',
		direction: 'ltr',
		flag: '🇲🇽'
	},
	'es-ar': {
		code: 'es',
		name: 'Español (Argentina)',
		englishName: 'Spanish (Argentina)',
		direction: 'ltr',
		flag: '🇦🇷'
	},
	'fr-fr': {
		code: 'fr',
		name: 'Français (France)',
		englishName: 'French (France)',
		direction: 'ltr',
		flag: '🇫🇷'
	},
	'fr-ca': {
		code: 'fr',
		name: 'Français (Canada)',
		englishName: 'French (Canada)',
		direction: 'ltr',
		flag: '🇨🇦'
	},
	'de-de': {
		code: 'de',
		name: 'Deutsch (Deutschland)',
		englishName: 'German (Germany)',
		direction: 'ltr',
		flag: '🇩🇪'
	},
	'de-at': {
		code: 'de',
		name: 'Deutsch (Österreich)',
		englishName: 'German (Austria)',
		direction: 'ltr',
		flag: '🇦🇹'
	},
	'de-ch': {
		code: 'de',
		name: 'Deutsch (Schweiz)',
		englishName: 'German (Switzerland)',
		direction: 'ltr',
		flag: '🇨🇭'
	}
};

/**
 * Get language info by code (case-insensitive)
 * Supports various formats: 'en', 'EN', 'en-US', 'en_US', etc.
 */
export function getLanguageInfo(code: string): LanguageInfo | null {
	if (!code) return null;

	// Normalize the code: lowercase and replace underscores with hyphens
	const normalized = code.toLowerCase().replace(/_/g, '-');

	// Direct match
	if (LANGUAGES[normalized]) {
		return LANGUAGES[normalized];
	}

	// Try without region code (e.g., 'en-US' -> 'en')
	const baseCode = normalized.split('-')[0];
	if (LANGUAGES[baseCode]) {
		return LANGUAGES[baseCode];
	}

	return null;
}

/**
 * Detect and correct language code
 * Returns the corrected ISO 639-1 code or null if not found
 */
export function detectLanguageCode(input: string): string | null {
	if (!input) return null;

	const normalized = input.toLowerCase().trim();

	// First try direct code lookup
	const info = getLanguageInfo(normalized);
	if (info) return info.code;

	// Try to match by English name (case-insensitive)
	for (const lang of Object.values(LANGUAGES)) {
		if (lang.englishName.toLowerCase() === normalized) {
			return lang.code;
		}
	}

	// Try to match by native name (case-insensitive)
	for (const lang of Object.values(LANGUAGES)) {
		if (lang.name.toLowerCase() === normalized) {
			return lang.code;
		}
	}

	// Try partial match on English name
	for (const lang of Object.values(LANGUAGES)) {
		if (
			lang.englishName.toLowerCase().includes(normalized) ||
			normalized.includes(lang.englishName.toLowerCase())
		) {
			return lang.code;
		}
	}

	return null;
}

/**
 * Pinyin mappings for common Chinese language names
 */
const PINYIN_MAP: Record<string, string[]> = {
	zh: ['zhongwen', 'zhonguo', 'hanyu', 'putonghua', 'guoyu', 'huayu', 'zhong', 'chinese', 'cn'],
	'zh-TW': ['fantizi', 'fanti', 'taiwan', 'tw'],
	ja: ['riyu', 'riben', 'nihongo', 'japanese', 'jp'],
	ko: ['hanyu', 'hanguo', 'korean', 'kr'],
	fr: ['fayu', 'faguo', 'french'],
	de: ['deyu', 'deguo', 'german'],
	es: ['xibanyayu', 'spanish'],
	ru: ['eyu', 'eguo', 'russian'],
	ar: ['alaboyu', 'alabo', 'arabic'],
	pt: ['putaoyayu', 'portuguese'],
	it: ['yidaliyu', 'italian'],
	nl: ['helanyu', 'dutch'],
	pl: ['bolanyu', 'polish'],
	tr: ['tuerqiyu', 'turkish'],
	th: ['taiyu', 'taiguo', 'thai'],
	vi: ['yuenanyu', 'yuenan', 'vietnamese'],
	id: ['yinniyu', 'indonesian'],
	ms: ['malaiyu', 'malay'],
	hi: ['yindiyu', 'hindi'],
	he: ['xibolaiyu', 'hebrew'],
	sv: ['ruidianyu', 'swedish'],
	no: ['nuoweiyu', 'norwegian'],
	da: ['danmaiyu', 'danish'],
	fi: ['fenlanyu', 'finnish'],
	el: ['xilayu', 'greek'],
	cs: ['jiekeyu', 'czech'],
	hu: ['xiongyaliyu', 'hungarian'],
	ro: ['luomaniyayu', 'romanian']
};

/**
 * Fuzzy search for languages
 * Returns an array of matching languages with relevance scores
 */
export function fuzzySearchLanguages(input: string): LanguageInfo[] {
	if (!input || input.length < 1) return [];

	const normalized = input.toLowerCase().trim();
	const results: Array<{ lang: LanguageInfo; score: number }> = [];

	// Check each language
	for (const [, lang] of Object.entries(LANGUAGES)) {
		let score = 0;

		// Exact code match
		if (lang.code.toLowerCase() === normalized) {
			score = 100;
		}
		// Code starts with input
		else if (lang.code.toLowerCase().startsWith(normalized)) {
			score = 90;
		}
		// Exact English name match
		else if (lang.englishName.toLowerCase() === normalized) {
			score = 95;
		}
		// English name starts with input
		else if (lang.englishName.toLowerCase().startsWith(normalized)) {
			score = 85;
		}
		// English name contains input
		else if (lang.englishName.toLowerCase().includes(normalized)) {
			score = 70;
		}
		// Exact native name match
		else if (lang.name.toLowerCase() === normalized) {
			score = 95;
		}
		// Native name starts with input
		else if (lang.name.toLowerCase().startsWith(normalized)) {
			score = 85;
		}
		// Native name contains input
		else if (lang.name.toLowerCase().includes(normalized)) {
			score = 70;
		}

		// Check pinyin mappings
		if (score === 0 && PINYIN_MAP[lang.code]) {
			for (const pinyin of PINYIN_MAP[lang.code]) {
				if (pinyin === normalized) {
					score = 90;
					break;
				} else if (pinyin.startsWith(normalized)) {
					score = 75;
					break;
				} else if (pinyin.includes(normalized)) {
					score = 60;
					break;
				}
			}
		}

		// Check if input is contained in any pinyin (reverse check)
		if (score === 0) {
			for (const [langCode, pinyinList] of Object.entries(PINYIN_MAP)) {
				if (langCode === lang.code) {
					for (const pinyin of pinyinList) {
						if (normalized.includes(pinyin) || pinyin.includes(normalized)) {
							score = 50;
							break;
						}
					}
				}
			}
		}

		if (score > 0) {
			results.push({ lang, score });
		}
	}

	// Sort by score (highest first) and return top matches
	results.sort((a, b) => b.score - a.score);
	return results.slice(0, 10).map((r) => r.lang);
}

/**
 * Get all supported language codes
 */
export function getAllLanguageCodes(): string[] {
	const codes = new Set<string>();
	for (const lang of Object.values(LANGUAGES)) {
		codes.add(lang.code);
	}
	return Array.from(codes).sort();
}

/**
 * Get languages by text direction
 */
export function getLanguagesByDirection(direction: 'ltr' | 'rtl'): LanguageInfo[] {
	return Object.values(LANGUAGES).filter((lang) => lang.direction === direction);
}

/**
 * Check if a language code is valid
 */
export function isValidLanguageCode(code: string): boolean {
	return getLanguageInfo(code) !== null;
}
