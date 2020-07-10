import fs from 'fs'
import ts from 'typescript'

const sourceFile = ts.createSourceFile(
  'foo.tsx',
  fs.readFileSync('src/example.txt').toString(),
  ts.ScriptTarget.Latest,
  true
)

console.log(sourceFile)
