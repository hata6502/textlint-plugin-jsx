# textlint-plugin-jsx

JSX and TSX support for textlint.

## Install

```sh
npm i textlint-plugin-jsx
```

## Usage

```json
{
  "plugins": {
    "jsx": true
  }
}
```

```json
{
  "plugins": {
    "jsx": {
      "extensions": [".custom-ext"]
    }
  }
}
```

## Run test

Run all tests.

```
npm test
```

Update snapshots.

```
UPDATE_SNAPSHOT=1 npm test
```
