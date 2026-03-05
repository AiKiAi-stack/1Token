import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

describe('CLI Tool Tests', () => {
  const toolScript = `
#!/usr/bin/env node

// Mock the fetch implementation
global.fetch = async (url, options) => {
  // Mock API responses
  if (url.includes('/api/tokens')) {
    if (options?.method === 'POST') {
      // Mock successful token creation
      return {
        ok: true,
        json: () => Promise.resolve({ token: { id: 'mock-id', platform: 'MockPlatform' } }),
        status: 200
      };
    } else if (url.includes('/decrypt')) {
      // Mock decryption success
      return {
        ok: true,
        json: () => Promise.resolve({ decrypted: 'mock-decrypted-token-value' }),
        status: 200
      };
    } else {
      // Mock token list
      return {
        ok: true,
        json: () => Promise.resolve({ 
          tokens: [
            { id: 'mock-id', platform: 'GitHub', purpose: 'Development', tags: 'prod',expiresAt: null },
            { id: 'mock-id-2', platform: 'AWS', purpose: 'Deployment', tags: 'staging', expiresAt: null }
          ]
        }),
        status: 200
      };
    }
  }
  return { ok: false, status: 404, text: () => Promise.resolve('Not found') };
};

// Mock the process.exit
process.exit = (code) => {
  throw new Error(\`Process exit with code \${code}\`);
};

process.stdin = {
  setRawMode: () => {},
};

// Simulate the readline interface
const mockAnswer = process.env.MOCK_INPUT || '';
const originalCreate = require('readline').createInterface;
require('readline').createInterface = (opts) => {
  // Return a mocked readline interface that responds with predetermined answers
  const readline = originalCreate(opts);
  setTimeout(() => {
    opts.input.emit('data', mockAnswer + '\\n');
  }, 100);
  
  return readline;
};

// Import the actual tool.ts after mocking
import('./tool.js');
`;

  it('should handle list command correctly', async () => {
    // Test listing tokens
    const cmd = `MOCK_INPUT="" node -e "${toolScript.replace(/\n/g, '').replace(/"/g, '\\"')}" list`;
    
    console.log('Running test command:', cmd);  // Debugging: log command
    
    try {
      const { stdout, stderr } = await execAsync(cmd, { 
        cwd: path.join(process.cwd(), 'cli/dist'),
        timeout: 15000 // 15s timeout
      });
      
      console.log('stdout:', stdout); // Debug: log output
      console.log('stderr:', stderr); // Debug: log errors
      
      // Expect response indicating tokens found
      expect((stdout + stderr).toLowerCase()).toContain('token');
    } catch (error) {
      console.error('Command failed:', error.message);
      if (error.stdout) console.log('stdout:', error.stdout);
      if (error.stderr) console.log('stderr:', error.stderr);
      throw error;
    }
  });

  it('should display help correctly', async () => {
    // Test help command
    const cmd = `MOCK_INPUT="" node -e "${toolScript.replace(/\n/g, '').replace(/"/g, '\\"')}" help`;
    
    try {
      const { stdout, stderr } = await execAsync(cmd, { 
        cwd: path.join(process.cwd(), 'cli/dist'),
        timeout: 15000 
      });
      
      // Check if help text contains required elements
      expect((stdout + stderr).toLowerCase()).toContain('usage');
      expect((stdout + stderr).toLowerCase()).toContain('commands');
    } catch (error) {
      console.error('Help test failed:', error.message);
      if (error.stdout) console.log('stdout:', error.stdout);
      if (error.stderr) console.log('stderr:', error.stderr);
      throw error;
    }
  });

  it('should handle get command for a platform', async () => {
    // Test getting token for a specific platform
    const cmd = `MOCK_PASSWORD="test123" MOCK_INPUT="test123" node -e "${toolScript.replace(/\n/g, '').replace(/"/g, '\\"')}" get github`;
    
    try {
      const { stdout, stderr } = await execAsync(cmd, { 
        cwd: path.join(process.cwd(), 'cli/dist'),
        timeout: 15000 
      });
      
      // Should not crash and should process the command
      expect((stdout + stderr)).not.toContain('fatal error');
      expect((stdout + stderr)).not.toContain('error:');
    } catch (error) {
      // Command may exit with error code if no token exists, that's expected
      if (error.code !== 1 || !(error.stdout + error.stderr).includes('no token found')) {
        console.error('Get command test failed:', error.message);
        throw error;
      }
    }
  });

  it('should have valid export structure', async () => {
    // Check that the generated .js file doesn't have syntax errors
    const cliDistPath = path.join(process.cwd(), 'cli/dist/tool.js');
    
    if (!fs.existsSync(cliDistPath)) {
      throw new Error('Generated tool.js does not exist!');
    }

    const fileContent = fs.readFileSync(cliDistPath, 'utf8');
    
    // Verify core functions exist
    expect(fileContent).toContain('copyToClipboard');
    expect(fileContent).toContain('askForInput'); 
    expect(fileContent).toContain('getToken');
    expect(fileContent).toContain('listTokens');
    expect(fileContent).toContain('showHelp');
    expect(fileContent).toContain('main');
    
    // Verify import structure is correct
    expect(fileContent).toContain('require(');
    
    console.log('✓ All structural tests passed!');
  });
});