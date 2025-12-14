import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";

const exec = (cmd) =>
  execSync(cmd, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trimEnd();

const getLocalDateStr = (date = new Date()) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseArgs = (argv) => {
  const out = {
    bump: "auto",
    notesFile: ".ydp/changelog-entry.md",
    yes: false,
    noCommit: false,
    noPush: false,
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--no-commit") out.noCommit = true;
    else if (a === "--no-push") out.noPush = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--bump" || a === "-b") out.bump = argv[++i] || "";
    else if (a.startsWith("--bump=")) out.bump = a.split("=", 2)[1] || "";
    else if (a === "--notes-file" || a === "-n")
      out.notesFile = argv[++i] || "";
    else if (a.startsWith("--notes-file="))
      out.notesFile = a.split("=", 2)[1] || "";
    else out.help = true;
  }
  return out;
};

const printHelp = () => {
  console.log(`Usage:
  node scripts/post-chat.mjs [options]

Options:
  -n, --notes-file <path>   Changelog entry markdown file (default: .ydp/changelog-entry.md)
  -b, --bump <auto|patch|minor|major>  Semver bump (default: auto)
  -y, --yes                 Skip confirmation prompt
  --no-commit               Update files but do not commit
  --no-push                 Commit but do not push
  --dry-run                 Print plan only (no file changes)
  -h, --help                Show help

Workflow:
  1) Put your combined notes into .ydp/changelog-entry.md (ignored by git).
  2) Run this script, confirm once, and it will:
     - bump version (index.html + data.json)
     - prepend CHANGELOG.md entry
     - git commit + push (triggering GitHub Pages)

Notes file directives (optional):
  bump: patch|minor|major
  commit: <commit message>
`);
};

const parseSemver = (version) => {
  const raw = String(version || "").trim();
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(raw);
  if (!m) throw new Error(`Invalid version: "${raw}"`);
  return {
    prefix: raw.startsWith("v") ? "v" : "",
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
  };
};

const bumpSemver = (version, bump) => {
  const v = parseSemver(version);
  const b = String(bump || "")
    .trim()
    .toLowerCase();
  if (b === "major") {
    v.major += 1;
    v.minor = 0;
    v.patch = 0;
  } else if (b === "minor") {
    v.minor += 1;
    v.patch = 0;
  } else if (b === "patch") {
    v.patch += 1;
  } else {
    throw new Error(`Invalid bump type: "${bump}" (use patch|minor|major)`);
  }
  return `${v.prefix || "v"}${v.major}.${v.minor}.${v.patch}`;
};

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractDirectives = (notesMd) => {
  const bumpRe =
    /^\s*(?:<!--\s*)?bump\s*[:=]\s*(auto|patch|minor|major)\s*(?:-->\s*)?$/i;
  const commitRe = /^\s*(?:<!--\s*)?commit\s*[:=]\s*(.*?)\s*(?:-->\s*)?$/i;

  let bump = null;
  let commit = null;
  const kept = [];
  for (const line of String(notesMd || "").split("\n")) {
    const bumpMatch = bumpRe.exec(line);
    if (bumpMatch) {
      bump = bumpMatch[1].toLowerCase();
      continue;
    }
    const commitMatch = commitRe.exec(line);
    if (commitMatch) {
      commit = String(commitMatch[1] || "").trim();
      continue;
    }
    kept.push(line);
  }
  const body = kept.join("\n").trim();
  return { bump, commit, body };
};

const inferBumpFromEntry = (entryMd) => {
  const md = String(entryMd || "");
  if (
    /BREAKING CHANGE/i.test(md) ||
    /(^|\n)###\s+(Breaking|Removed)\b/i.test(md)
  )
    return "major";
  if (/(^|\n)###\s+Added\b/i.test(md)) return "minor";
  return "patch";
};

const normalizeCommitMessage = (commitMessage, targetVersion) => {
  const raw = String(commitMessage || "").trim();
  if (!raw) return "";
  const m = /v\d+\.\d+\.\d+/.exec(raw);
  if (!m) return raw;
  return raw.replace(/v\d+\.\d+\.\d+/, String(targetVersion || "").trim());
};

const updateAppVersionInIndexHtml = (content, nextVersion) => {
  const re = /const APP_VERSION = "v\d+\.\d+\.\d+";/;
  if (!re.test(content)) {
    throw new Error(`APP_VERSION not found in index.html`);
  }
  return content.replace(re, `const APP_VERSION = "${nextVersion}";`);
};

const readAppVersionFromIndexHtml = (content) => {
  const m = /const APP_VERSION = "(v\d+\.\d+\.\d+)";/.exec(content);
  if (!m) throw new Error(`APP_VERSION not found in index.html`);
  return m[1];
};

const getFirstMeaningfulLine = (md) => {
  for (const line of String(md || "").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("<!--")) continue;
    if (t.startsWith("#")) continue;
    return t;
  }
  return "";
};

const makeCommitMessage = (nextVersion, notesMd) => {
  const first = getFirstMeaningfulLine(notesMd);
  const fromBullet = first.startsWith("- ") ? first.replace(/^-+\s+/, "") : "";
  const cleaned = (fromBullet || first)
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const summary = cleaned ? cleaned.split(":")[0].trim() : "";
  const base = `Release ${nextVersion}`;
  if (!summary) return base;
  const msg = `${base}: ${summary}`;
  return msg.length > 72 ? base : msg;
};

const prependChangelogEntry = (changelogMd, nextVersion, dateStr, entryMd) => {
  const header = `## [${nextVersion}] - ${dateStr}\n\n`;
  const body = String(entryMd || "").trim();
  if (!body) throw new Error(`Changelog entry is empty`);

  const idx = changelogMd.indexOf("## [");
  if (idx === -1) {
    return `${changelogMd.trimEnd()}\n\n${header}${body}\n`;
  }
  const before = changelogMd.slice(0, idx).trimEnd();
  const after = changelogMd.slice(idx).trimStart();
  return `${before}\n\n${header}${body}\n\n${after}`;
};

const confirm = async (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await new Promise((resolve) => rl.question(question, resolve));
  rl.close();
  return String(answer || "")
    .trim()
    .toLowerCase()
    .startsWith("y");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const repoRoot = exec("git rev-parse --show-toplevel");
  process.chdir(repoRoot);

  const notesPath = path.resolve(repoRoot, args.notesFile);
  if (!fs.existsSync(notesPath)) {
    fs.mkdirSync(path.dirname(notesPath), { recursive: true });
    fs.writeFileSync(
      notesPath,
      `bump: patch\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n`,
    );
    console.error(`Notes file not found, created template: ${args.notesFile}`);
    console.error(`Fill it in, then re-run.`);
    process.exit(1);
  }

  const rawNotesMd = fs.readFileSync(notesPath, "utf8");
  if (!rawNotesMd.trim()) {
    console.error(`Notes file is empty: ${args.notesFile}`);
    process.exit(1);
  }
  const directives = extractDirectives(rawNotesMd);
  const notesMd = directives.body;
  if (!notesMd.trim()) {
    console.error(
      `Notes file has no content after directives: ${args.notesFile}`,
    );
    process.exit(1);
  }

  const indexHtmlPath = path.join(repoRoot, "index.html");
  const dataJsonPath = path.join(repoRoot, "data.json");
  const changelogPath = path.join(repoRoot, "CHANGELOG.md");
  if (!fs.existsSync(indexHtmlPath))
    throw new Error(`Missing file: index.html`);
  if (!fs.existsSync(dataJsonPath)) throw new Error(`Missing file: data.json`);
  if (!fs.existsSync(changelogPath))
    throw new Error(`Missing file: CHANGELOG.md`);

  const committedIndexHtml = exec("git show HEAD:index.html");
  const baseVersion = readAppVersionFromIndexHtml(committedIndexHtml);
  const committedDataObj = JSON.parse(exec("git show HEAD:data.json"));
  const baseDataVersion = String(committedDataObj.version || "").trim();
  if (baseDataVersion && baseDataVersion !== baseVersion) {
    throw new Error(
      `Version mismatch in HEAD: index.html=${baseVersion} vs data.json=${baseDataVersion}`,
    );
  }

  const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
  const workingVersion = readAppVersionFromIndexHtml(indexHtml);

  const dataObj = JSON.parse(fs.readFileSync(dataJsonPath, "utf8"));
  const workingDataVersion = String(dataObj.version || "").trim();
  if (workingDataVersion && workingDataVersion !== workingVersion) {
    throw new Error(
      `Version mismatch in working tree: index.html=${workingVersion} vs data.json=${workingDataVersion}`,
    );
  }

  const bumpType =
    args.bump && args.bump !== "auto"
      ? args.bump
      : directives.bump && directives.bump !== "auto"
        ? directives.bump
        : inferBumpFromEntry(notesMd);

  const plannedVersion = bumpSemver(baseVersion, bumpType);
  const nextVersion =
    workingVersion === baseVersion
      ? plannedVersion
      : workingVersion === plannedVersion
        ? plannedVersion
        : (() => {
            throw new Error(
              `Unexpected working version "${workingVersion}". Expected "${baseVersion}" (clean) or "${plannedVersion}" (resume).`,
            );
          })();
  const dateStr = getLocalDateStr();
  const lastUpdatedIso = new Date().toISOString();

  const statusBefore = exec("git status --short") || "(clean)";
  console.log(`Repo: ${repoRoot}`);
  console.log(`Base:    ${baseVersion}`);
  console.log(`Working: ${workingVersion}`);
  console.log(`Next:    ${nextVersion} (${bumpType})`);
  console.log(`Notes:   ${args.notesFile}`);
  console.log(`\nWorking tree:\n${statusBefore}\n`);

  if (!args.yes) {
    const ok = await confirm(`Proceed with release ${nextVersion}? (y/N) `);
    if (!ok) {
      console.log("Canceled.");
      process.exit(0);
    }
  }

  if (args.dryRun) {
    console.log("Dry run: no changes applied.");
    process.exit(0);
  }

  if (workingVersion !== nextVersion) {
    const nextIndexHtml = updateAppVersionInIndexHtml(indexHtml, nextVersion);
    fs.writeFileSync(indexHtmlPath, nextIndexHtml);
  }

  dataObj.version = nextVersion;
  dataObj.lastUpdated = lastUpdatedIso;
  fs.writeFileSync(dataJsonPath, JSON.stringify(dataObj, null, 2) + "\n");

  const changelogMd = fs.readFileSync(changelogPath, "utf8");
  const entryRe = new RegExp(
    `(^|\\n)## \\[${escapeRegExp(nextVersion)}\\] - `,
    "m",
  );
  if (!entryRe.test(changelogMd)) {
    const nextChangelog = prependChangelogEntry(
      changelogMd,
      nextVersion,
      dateStr,
      notesMd,
    );
    fs.writeFileSync(changelogPath, nextChangelog);
  } else {
    console.log(`CHANGELOG already has ${nextVersion}; skipping prepend.`);
  }

  exec("git add -A");

  const statusAfterAdd = exec("git status --short") || "(clean)";
  console.log(`\nStaged:\n${statusAfterAdd}\n`);

  if (!args.noCommit) {
    const msgFromDirective = normalizeCommitMessage(
      directives.commit,
      nextVersion,
    );
    const msg = msgFromDirective || makeCommitMessage(nextVersion, notesMd);
    exec(`git commit -m ${JSON.stringify(msg)}`);
    console.log(`Committed: ${msg}`);
  }

  if (!args.noPush) {
    exec("git push origin HEAD");
    console.log("Pushed to GitHub. Pages will update shortly.");
  }

  console.log(`Done: ${nextVersion}`);
};

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
