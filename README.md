# stackdiff

> CLI tool to compare environment variable sets across staging and production configs

## Installation

```bash
npm install -g stackdiff
```

## Usage

Compare two environment config files:

```bash
stackdiff .env.staging .env.production
```

Example output:

```
+ API_TIMEOUT        [production only]
- DEBUG_MODE         [staging only]
~ DATABASE_URL       [value differs]
```

### Options

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON |
| `--only-missing` | Show only missing keys |
| `--ignore <key>` | Ignore a specific key |

```bash
stackdiff .env.staging .env.production --only-missing --json
```

## Requirements

- Node.js >= 16
- TypeScript >= 4.5

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)