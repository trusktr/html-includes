/** @type {import('prettier').Config} */
module.exports = {
	printWidth: 120,
	singleQuote: true,
	trailingComma: 'all',
	semi: false,
	arrowParens: 'avoid',
	useTabs: true,
	bracketSpacing: false,

	overrides: [
		{
			files: '*.md',
			options: {
				tabWidth: 2,
				useTabs: false,
			},
		},
	],
}
