import { createServer } from 'node:http'
import { createAiClient } from '../server/ai-client.js'

const server = createServer(async (req, res) => {
  let body = ''
  for await (const chunk of req) body += chunk
  const payload = JSON.parse(body || '{}')
  const hasTools = Array.isArray(payload.tools) && payload.tools.length > 0
  const hasToolResult = Array.isArray(payload.messages)
    && payload.messages.some((message: any) => message.role === 'tool')

  const response = hasToolResult
    ? {
        choices: [{
          message: {
            content: 'Tool result was received and converted correctly.',
          },
        }],
      }
    : hasTools
    ? {
        choices: [{
          message: {
            content: '',
            tool_calls: [{
              id: 'call_smoke',
              type: 'function',
              function: { name: 'read_file', arguments: '{"path":"demo.md"}' },
            }],
          },
        }],
      }
    : {
        choices: [{ message: { content: 'OpenAI-compatible smoke response' } }],
      }

  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify(response))
})

await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
if (!address || typeof address === 'string') throw new Error('Mock server did not start')

const client = createAiClient({
  apiKey: 'SMOKE_TEST_TOKEN',
  baseURL: `http://127.0.0.1:${address.port}/v1`,
  model: 'smoke-model',
  provider: 'openai-compatible',
})

const textResponse = await client.messages.create({
  model: 'smoke-model',
  max_tokens: 32,
  system: 'Return a short response.',
  messages: [{ role: 'user', content: 'hello' }],
})
if (textResponse.content[0]?.type !== 'text' || textResponse.content[0].text !== 'OpenAI-compatible smoke response') {
  throw new Error('Text response mapping failed')
}

const toolResponse = await client.messages.create({
  model: 'smoke-model',
  max_tokens: 32,
  messages: [{ role: 'user', content: 'read demo.md' }],
  tools: [{
    name: 'read_file',
    description: 'Read a file',
    input_schema: { type: 'object', properties: { path: { type: 'string' } } },
  }],
})
if (toolResponse.content[0]?.type !== 'tool_use' || toolResponse.content[0].name !== 'read_file') {
  throw new Error('Tool call mapping failed')
}

const continuationResponse = await client.messages.create({
  model: 'smoke-model',
  max_tokens: 32,
  messages: [
    { role: 'user', content: 'read demo.md' },
    { role: 'assistant', content: toolResponse.content },
    { role: 'user', content: [{
      type: 'tool_result',
      tool_use_id: toolResponse.content[0].id,
      content: 'demo file content',
    }] },
  ],
  tools: [{
    name: 'read_file',
    description: 'Read a file',
    input_schema: { type: 'object', properties: { path: { type: 'string' } } },
  }],
})
if (continuationResponse.content[0]?.type !== 'text' || !continuationResponse.content[0].text.includes('received')) {
  throw new Error('Tool result continuation mapping failed')
}

server.close()
console.log('PASS openai-compatible text, tool-call, and tool-result continuation mapping')
