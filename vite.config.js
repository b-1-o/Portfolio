import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function githubProjectsPlugin() {
  return {
    name: 'github-projects',
    transform(code, id) {
      if (!id.endsWith('/src/App.jsx')) return null;

      const dataPath = path.resolve(process.cwd(), 'src/projects.auto.json');
      if (!fs.existsSync(dataPath)) return null;

      const projects = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const start = code.indexOf('const projects = [');
      const end = code.indexOf('const services = [', start);
      if (start === -1 || end === -1) return null;

      const replacement = `const projects = ${JSON.stringify(projects, null, 2)};\n\n`;
      return code.slice(0, start) + replacement + code.slice(end);
    },
  };
}

export default defineConfig({
  base: '/portfolio/',
  plugins: [react(), githubProjectsPlugin()],
});
