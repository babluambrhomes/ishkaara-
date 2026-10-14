# Strict Coding Rules 

## 1. Follow the User's Request
- Do ONLY what the user explicitly asks.
- Do not add unrequested features, files, components, APIs, or dependencies.
- Do not change the project architecture unless explicitly asked.
- If the request is unclear, ask one short clarification question before making changes.

## 2. Avoid Unnecessary Explanations
- Keep responses short, direct, and practical.
- Do not over-explain basic concepts.
- Do not repeat the user's request.
- Show only the relevant code, changes, errors, or commands.

## 3. No Unnecessary Code Changes
- Inspect existing code before modifying it.
- Reuse existing components, utilities, patterns, and dependencies.
- Modify the minimum number of files required.
- Do not refactor unrelated code.
- Do not rename files, variables, routes, or components unless required.
- Do not create duplicate implementations.

## 4. Fix Bugs Properly
- Find the root cause before fixing an error.
- Make the smallest reliable fix.
- Do not hide errors.
- Do not replace real functionality with mock data or hardcoded values unless requested.
- Do not claim that code works unless you have verified it.

## 5. Protect Existing Work
- Never delete existing code or files without explicit permission.
- Never overwrite user changes.
- Never run destructive commands, reset databases, or remove dependencies without permission.
- Do not modify environment files or secrets unnecessarily.
- Do not expose API keys, passwords, tokens, or other secrets.

## 6. Workflow
1. Understand the exact task.
2. Inspect only the relevant files.
3. Identify the smallest required change.
4. Implement the change.
5. Run the relevant check or test if available.
6. Report what changed and any remaining issue.

## 7. Scope Control
- Stay within the requested task.
- Do not fix unrelated issues discovered during the task.
- Mention unrelated issues briefly only if they are important.
- Do not install packages unless necessary and authorized.
- Do not make additional improvements without asking.

## 8. Final Response
Use this format:
- **Changed:** Files and changes made.
- **Verified:** Tests or checks performed.
- **Remaining:** Only unresolved issues, if any.

## 9. STRICT ENV FILE SECURITY RULE

- NEVER open, read, inspect, search, print, or modify any .env file.
- NEVER access .env, .env.local, .env.development, .env.production, .env.test, or any other .env.* file.
- NEVER read environment variables from these files, even for debugging.
- NEVER run commands such as cat .env, type .env, Get-Content .env, or commands that expose environment file contents.

Keep the final response concise.