import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'tasks', 'index.json');
const mdPath = path.join(root, 'TASK_INDEX.md');

function load() { return JSON.parse(fs.readFileSync(indexPath, 'utf8')); }
function save(data) { fs.writeFileSync(indexPath, JSON.stringify(data, null, 2) + '\n'); }
function byId(data, id) { return data.tasks.find(t => t.id === id); }
function depsDone(data, task) { return task.depends_on.every(id => byId(data, id)?.status === 'DONE'); }
function recompute(data) {
  for (const task of data.tasks) {
    if (task.status === 'BACKLOG' && depsDone(data, task)) task.status = 'READY';
  }
  const current = data.tasks.find(t => t.status === 'IN_PROGRESS')
    ?? data.tasks.find(t => t.status === 'READY')
    ?? data.tasks.find(t => t.status === 'BLOCKED')
    ?? null;
  data.current_task = current?.id ?? null;
  return data;
}
function render(data) {
  const current = data.current_task ? byId(data, data.current_task) : null;
  const lines = [
    '# TASK INDEX', '',
    '> Đây là điểm vào cho AI coding agent. Đọc `AGENTS.md` trước, sau đó đọc file task hiện tại.', '',
    '## CURRENT TASK', '',
    current ? `**${current.id} — ${current.title}**  ` : '**Không còn task đang mở.**',
    current ? `File: \`${current.file}\`  ` : '',
    current ? `Status: **${current.status}**` : '', '',
    '## Quy tắc chọn task tiếp theo', '',
    '- Ưu tiên task `IN_PROGRESS`.',
    '- Nếu không có, chọn task `READY` đầu tiên theo thứ tự index.',
    '- Task chỉ chuyển `READY` khi toàn bộ `depends_on` đã `DONE`.',
    '- Không tự bỏ qua task `BLOCKED` mà không ghi rõ blocker.', '',
    '## Danh sách task', '',
    '| ID | Status | Task | Depends on | File |',
    '|---|---|---|---|---|'
  ];
  for (const t of data.tasks) lines.push(`| ${t.id} | ${t.status} | ${t.title} | ${t.depends_on.join(', ') || '-'} | \`${t.file}\` |`);
  lines.push('', '## Commands', '', '```bash', 'npm run task:current', 'npm run task:list', 'npm run task:start -- T001', 'npm run task:done -- T001', 'npm run task:block -- T001 "reason"', 'npm run task:refresh', '```', '');
  fs.writeFileSync(mdPath, lines.filter((v,i,a)=>!(v==='' && a[i-1]==='' && i<10)).join('\n'));
}

let data = recompute(load());
const [cmd = 'current', id, ...rest] = process.argv.slice(2);

if (cmd === 'current') {
  const t = data.current_task ? byId(data, data.current_task) : null;
  console.log(t ? `${t.id} [${t.status}] ${t.title}\n${t.file}` : 'No open task.');
} else if (cmd === 'list') {
  for (const t of data.tasks) console.log(`${t.id}\t${t.status}\t${t.title}`);
} else if (cmd === 'start') {
  if (!id) throw new Error('Usage: task:start -- Txxx');
  const t = byId(data, id); if (!t) throw new Error(`Unknown task ${id}`);
  if (!depsDone(data, t)) throw new Error(`Dependencies not DONE: ${t.depends_on.join(', ')}`);
  if (!['READY','IN_PROGRESS'].includes(t.status)) throw new Error(`${id} status is ${t.status}`);
  for (const other of data.tasks) if (other.status === 'IN_PROGRESS' && other.id !== id) throw new Error(`${other.id} is already IN_PROGRESS`);
  t.status = 'IN_PROGRESS'; data.current_task = id;
  save(data); render(data); console.log(`Started ${id}`);
} else if (cmd === 'done') {
  if (!id) throw new Error('Usage: task:done -- Txxx');
  const t = byId(data, id); if (!t) throw new Error(`Unknown task ${id}`);
  if (!['READY','IN_PROGRESS'].includes(t.status)) throw new Error(`${id} cannot be completed from ${t.status}`);
  if (!depsDone(data, t)) throw new Error(`Dependencies not DONE: ${t.depends_on.join(', ')}`);
  t.status = 'DONE'; data = recompute(data); save(data); render(data);
  console.log(`Done ${id}. Next: ${data.current_task ?? 'none'}`);
} else if (cmd === 'block') {
  if (!id) throw new Error('Usage: task:block -- Txxx "reason"');
  const t = byId(data, id); if (!t) throw new Error(`Unknown task ${id}`);
  t.status = 'BLOCKED'; t.blocker = rest.join(' ') || 'Unspecified blocker';
  data = recompute(data); save(data); render(data); console.log(`Blocked ${id}`);
} else if (cmd === 'refresh') {
  data = recompute(data); save(data); render(data); console.log('TASK_INDEX.md refreshed.');
} else {
  throw new Error(`Unknown command ${cmd}`);
}
