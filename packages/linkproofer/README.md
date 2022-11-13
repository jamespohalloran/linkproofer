# [![LinkProofer](https://github.com/jamespohalloran/linkproofer/blob/master/assets/logo.svg "LinkProofer")](https://github.com/jamespohalloran/linkproofer)

LinkProofer is a CLI application for proofing links in your project.
Store your links in `js` or `ts` files, and verify the links with the LinkProofer CLI script.

<p align="center">
  <img src="https://media.giphy.com/media/pC4IgjB4fxVZFggIPG/giphy.gif" width="597" alt="linkproofer">
</p>

## ✨ Features

- Out-of-the-box Typescript support.
- Customizable entry (Provide your own filepath glob, or store links in \*.linkproof.<js | ts> files).
- Support for absolute or relative links.
- Run LinkProofer checks locally, or in CI.
- Lightweight! (~50 kB).

## Why use LinkProofer?

There are lots of link checkers out there, and many will scrape your site's html. HTML scraping solutions can fall short when...

- Your site uses SSR, instead of pre-generating all pages
- Your site's pages are behind authentication
- The links on the page are lazy-loaded
- You want to scrape the site before a PR is merged.

Instead of scraping your site, LinkProofer will have you store your links in configured `js` or `ts` files, and check those links via the CLI, or through CI.

## 📦 Installation

```bash
yarn install --dev linkproofer
```

or

```bash
npm install --save-dev linkproofer
```

## 🔧 Setting up your project

Create a `global.linkproof.ts` or `global.linkproof.js` at the root of your project, with the following code:

```ts
const linkproof = {
  MY_PORTFOLIO_URL: "https://johalloran.dev",
};
export default linkproof;
```

> Note ⚠️. The link object needs to be the default export for LinkProofer to work.

You can even use this URL in one of your pages if you want, to get an idea how LinkProofer is used:

```jsx
// ...
<h1>
  Linking to <a href={links.MY_PORTFOLIO_URL}>My Portfolio!</a>
</h1>
```

Now at the root of your project, run:

```bash
npm run linkproofer
```

or

```bash
yarn linkproofer
```

You should see an audit of all your links (just `MY_PORTFOLIO_URL` in our case).

You can create any `*.linkproof.<js | ts>` file in your project, and the containing links will be validated anytime LinkProofer is run.

## ⚙️ Linkproofing our custom files

By default, LinkProofer will look in any `\*_/_.linkproof.<js | ts>` file in your project. You can customize this by passing a custom `--files` flag into the CLI

```bash
npm run linkproofer --files **/*/mylinksfile.ts
```

## 🤖 Automating Checks

Linkproofer can be run in a GitHub action to validate all links are properly working.

Add the following action: `.github/workflows/linkproof.yml`

```yml
name: Check Links
on:
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  linkproofer:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - name: yarn install
        run: |
          yarn install
        env:
          CI: true
      - name: linkproofer
        run: |
          yarn linkproofer
        env:
          CI: true
```

## 📁 Using relative paths

If you have deployment previews setup with a service like Netlify or Vercel, you can configure the LinkProofer `baseURL` to look for relative links in your deployment preview

Your GitHub action step will look something like:

```yml
- name: linkproofer
  run: |
    yarn linkproofer --baseURL https://portfolio-avatar-git-${{ github.head_ref }}-jamespohalloran.vercel.app
  env:
    CI: true
```

In the above example, `https://portfolio-avatar-git` and `-jamespohalloran.vercel.app` will need to be replaced with your Vercel/Netlify project's specific info.

You can use one of the following packages to wait for your deployment to finish, before checking relative links:

- https://github.com/marketplace/actions/wait-for-netlify
- https://github.com/marketplace/actions/await-for-vercel-deployment

## 📖 CLI Usage

```
Usage: linkproofer [options]

Options:
  -V, --version                output the version number
  -f, --files <files>          Filepath pattern for files in which linkproofer should check for links
  -v, --verbose                Log out all checked links (not just the failures)
  -o, --outputDir <outputDir>  Directory to put the compiled output files. (Default dist). This directory should be added to your .gitignore
  -b, --baseURL <baseURL>      baseURL to use for relative links.
  -h, --help                   display help for command
```
