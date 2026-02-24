/**
 * Dev script: Starts Next.js dev server, waits until ready, then launches Electron.
 */
const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const NEXT_PORT = 3000
const NEXT_URL = `http://localhost:${NEXT_PORT}`
const WRITER_DIR = path.join(__dirname, '..', 'writer')

function waitForServer(url, maxRetries = 60) {
  return new Promise((resolve, reject) => {
    let retries = 0
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          resolve()
        } else {
          retry()
        }
      }).on('error', retry)
    }

    const retry = () => {
      retries++
      if (retries > maxRetries) {
        reject(new Error(`Server not ready after ${maxRetries} retries`))
        return
      }
      setTimeout(check, 500)
    }

    check()
  })
}

async function main() {
  console.log('🚀 Starting Next.js dev server...')

  const nextProcess = spawn('npm', ['run', 'dev'], {
    cwd: WRITER_DIR,
    stdio: 'inherit',
    shell: true,
  })

  nextProcess.on('error', (err) => {
    console.error('Failed to start Next.js:', err)
    process.exit(1)
  })

  try {
    console.log('⏳ Waiting for Next.js to be ready...')
    await waitForServer(NEXT_URL)
    console.log('✅ Next.js is ready!')
  } catch (err) {
    console.error('❌ Next.js failed to start:', err.message)
    nextProcess.kill()
    process.exit(1)
  }

  console.log('🖥️  Launching Electron...')

  const electronProcess = spawn(
    path.join(__dirname, 'node_modules', '.bin', 'electron'),
    ['.'],
    {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    }
  )

  electronProcess.on('close', () => {
    console.log('👋 Electron closed, stopping Next.js...')
    nextProcess.kill()
    process.exit(0)
  })

  // Clean up on exit
  process.on('SIGINT', () => {
    electronProcess.kill()
    nextProcess.kill()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    electronProcess.kill()
    nextProcess.kill()
    process.exit(0)
  })
}

main()
