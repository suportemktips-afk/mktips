import https from 'https'
import fs from 'fs'

const token = process.env.SUPABASE_ACCESS_TOKEN
const project = 'tnkrodykthsgzzjznqjy'
const query =
  process.argv[2] === '--file' ? fs.readFileSync(process.argv[3], 'utf8') : process.argv[2]

function run(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql })
    const req = https.request(
      {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${project}/database/query`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => resolve({ status: res.statusCode, body: d }))
      },
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const r = await run(query)
console.log('STATUS', r.status)
console.log(r.body.slice(0, 4000))
process.exit(r.status >= 400 ? 1 : 0)
