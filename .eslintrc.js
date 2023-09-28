/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	$schema: 'https://json.schemastore.org/eslintrc',
	root: true,
	extends: [
		'next/core-web-vitals',
		'prettier',
		'plugin:@typescript-eslint/recommended',
		'plugin:tailwindcss/recommended',
	],
	plugins: ['@typescript-eslint', 'tailwindcss'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
		'tailwindcss/no-custom-classname': 'off',
		'tailwindcss/classnames-order': 'error',
		'no-unused-vars': 'off',
		'no-duplicate-imports': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-var-requires': 'off',
	},
	settings: {
		tailwindcss: {
			callees: ['cn', 'cva'],
			config: 'tailwind.config.js',
		},
		next: {
			rootDir: ['./src/'],
		},
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			parser: '@typescript-eslint/parser',
		},
	],
}
