# Nuxt Editor Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

A rich text editor template built with [Nuxt UI](https://ui.nuxt.com) and [TipTap](https://tiptap.dev), showcasing the powerful `UEditor` component with advanced editing capabilities.

- [Live demo](https://editor-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/components/editor)

<a href="https://editor-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/editor-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/editor-light.png">
    <img alt="Nuxt Editor Template" src="https://ui.nuxt.com/assets/templates/nuxt/editor-light.png">
  </picture>
</a>

## Features

- **Rich Text Editing** - Full formatting support with headings, lists, blockquotes, and code blocks
- **Bubble & Fixed Toolbars** - Contextual toolbars that adapt to your selection
- **Drag Handle** - Easily reorder, duplicate, or delete content blocks
- **Slash Commands** - Type `/` to access quick insertion commands
- **Image Upload** - Custom image upload node with replace and delete actions
- **Mentions** - `@mention` support with user suggestions
- **Emoji Picker** - Full GitHub emoji set with `:emoji:` syntax
- **Text Alignment** - Left, center, right, and justify alignment options
- **Markdown Support** - Content type set to markdown for easy serialization

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/editor
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=editor&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Feditor&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Feditor-dark.png&demo-url=https%3A%2F%2Feditor-template.nuxt.dev%2F&demo-title=Nuxt%20Editor%20Template&demo-description=A%20rich%20text%20editor%20template%20built%20with%20Nuxt%20UI%20and%20TipTap.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
