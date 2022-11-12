# ![LinkProofer](./assets/logo.svg "LinkProofer")

LinkProofer is a CLI application for proofing links in your project

## Installation

```bash
yarn install --dev linkproofer
```

or

```bash
npm install --save-dev linkproofer
```

## Setting up your project

Create a `global.linkproof.ts` or `global.linkproof.js` at the root of your project, with the following code:

```ts
const linkproof = {
  MY_PORTFOLIO_URL: "https://johalloran.dev",
};
export default linkproof;
```

You can even use this URL in one of your pages if you want, to get an idea how linkproofer is used:

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

## Linkproofing our custom files

By default, linkproofer will look in any \*_/_.linkproof.<js | ts> file in your project. You can customize this by passing a custom `--files` flag into the CLI

```bash
npm run linkproofer --files **/*/mylinksfile.ts
```

## Automating LinkProofing

Linkproofer can be run in a GitHub action to validate all links are properly working.

Add the following action: `.github/workflows/linkproof.yml`

```yml
name: Node CI
on:
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  build:
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
      - name: yarn linkproofer
        run: |
          yarn linkproofer
        env:
          CI: true
```

## Checking links on local deployment

TODO