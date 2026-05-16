# NPM PUBLISHING — Options for @renatocaliari/pi-product-workflow

## 1. Manual Publishing

### Steps:
```bash
# 1. Update version in package.json
npm version patch  # or minor, major, prerelease

# 2. Publish
npm publish --access public

# 3. Create GitHub release
gh release create v0.1.0 --title "v0.1.0-alpha" --notes "Alpha release"
```

### Pros:
- Simple
- Full control
- No extra setup

### Cons:
- Manual every time
- Easy to forget steps
- Version sync issues

---

## 2. GitHub Actions — Simple

### Option A: Publish on Version Change
```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install & Publish
        run: |
          npm ci
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pros:
- Automatic on push to main
- Simple setup

### Cons:
- No changelog generation
- No semantic versioning

---

## 3. Semantic Release (Recommended)

### What it does:
- **Automatic versioning** based on commit messages
- **Changelog generation** from commits
- **GitHub Releases** created automatically
- **NPM publishing** on every release

### Commit Message Convention:
```
feat: new feature
fix: bug fix
docs: documentation
refactor: code refactor
test: tests
chore: maintenance
```

### Semantic Version Bumps:
| Commit | Version | Example |
|--------|---------|---------|
| `fix:` | Patch | 0.1.0 → 0.1.1 |
| `feat:` | Minor | 0.1.0 → 0.2.0 |
| `feat!:` or `breaking:` | Major | 0.1.0 → 1.0.0 |

### Setup:
```bash
# Install semantic-release
npm install --save-dev semantic-release @semantic-release/changelog @semantic-release/git

# Initialize (creates .releaserc.json)
npx semantic-release-cli
```

### .releaserc.json:
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      "npmPublish": true
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }],
    "@semantic-release/github"
  ]
}
```

### GitHub Actions Workflow:
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v4
        with:
          npm_token: ${{ secrets.NPM_TOKEN }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Pros:
- Automatic versioning
- Changelog generation
- No manual steps
- Version consistency

### Cons:
- Requires commit convention
- More setup initially

---

## 4. Release-Please (Google)

### What it does:
- Creates/updates PR with changelog
- You merge PR to release
- Semantic versioning from conventional commits

### Setup:
```yaml
# .github/workflows/release-please.yml
name: Release-Please

on:
  push:
    branches: [main]

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-type: node
          package-name: pi-product-workflow
```

### Pros:
- Creates PR with changelog
- You control when to release
- Clear release notes

### Cons:
- Still needs manual merge

---

## 5. Recommendation

### For Alpha/Beta Stage: Manual
- Few releases
- Need to test the package
- No automation needed yet

### For Public/stable: Semantic Release
- Automatic versioning
- Professional changelog
- Full CI/CD

### Suggested Workflow:
```
1. Start with: Manual publishing
2. When stable: Add semantic-release
3. Add CI tests before release
```

---

## 6. NPM Token Setup

To publish automatically, you need an NPM token:

1. Go to [npm.npmjs.com](https://www.npmjs.com)
2. Access Token → Generate New Token → Automation
3. Copy token
4. Add to GitHub: Settings → Secrets → NPM_TOKEN

---

## 7. Current Status

Package is at **version 0.1.0-alpha**

To publish:
```bash
cd ~/Development/pi-product-workflow
npm login
npm publish --access public --tag alpha
```

To publish as latest:
```bash
npm publish --access public
```

---

*Document generated: 2026-05-15*
