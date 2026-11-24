// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import d2 from 'astro-d2';

const repo = 'https://github.com/Indspl0it/NightJar-Postmark';

// GitHub Pages serves the site from https://indspl0it.github.io/NightJar-Postmark/.
export default defineConfig({
	site: 'https://indspl0it.github.io',
	base: '/NightJar-Postmark',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'NightJar',
			description:
				'NightJar shows every SMS that an Android phone receives, also the hidden types, and can hold or block them.',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				alt: 'NightJar logo',
			},
			favicon: '/favicon.svg',
			social: [{ icon: 'github', label: 'GitHub', href: repo }],
			editLink: { baseUrl: `${repo}/edit/main/website/` },
			lastUpdated: false,
			customCss: ['./src/styles/custom.css'],
			components: { Hero: './src/components/Hero.astro' },
			plugins: [starlightLinksValidator()],
			sidebar: [
				{
					label: 'Get started',
					items: ['intro', 'requirements', 'install', 'first-run'],
				},
				{
					label: 'Architecture',
					items: [
						'internals/architecture',
						'internals/hooks',
						'internals/rules-engine',
						'internals/ipc',
					],
				},
				{
					label: 'Features',
					items: [
						{ label: 'Overview', slug: 'features' },
						'features/message-types',
						'features/detection',
						'features/cell-broadcast',
						'features/outgoing',
					],
				},
				{
					label: 'Using NightJar',
					items: [
						'guide/home',
						'guide/messages',
						'guide/protection',
						'guide/custom-rules',
						'guide/known-senders',
						'guide/held-messages',
						'guide/self-test',
						'guide/protection-status',
						'guide/export',
						'guide/settings',
						'guide/notifications',
					],
				},
				{
					label: 'Safety and privacy',
					items: ['safety/blocking-cautions', 'safety/privacy', 'safety/limitations'],
				},
				{
					label: 'Help',
					items: ['help/troubleshooting', 'help/faq', 'help/compatibility'],
				},
				{
					label: 'Developers',
					items: ['dev/building', 'dev/contributing', 'dev/release'],
				},
				{
					label: 'Project',
					items: ['changelog', 'security', 'license'],
				},
			],
		}),
		// Diagrams: D2 code blocks become SVG files at build time. The build needs the d2 binary on PATH.
		// The diagrams set their own dark colours, so one theme serves the light and the dark page.
		d2({ layout: 'elk', theme: { default: '200', dark: false }, pad: 24 }),
	],
});
