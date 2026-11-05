# External link check: project pages

Checked 2026-11-05T10:11Z from a local copy of branch site-v7. Scope: every external href in projects/ember.html, projects/the-search.html and projects/web-cad.html.

Method: one GET per unique URL with redirects followed (curl -L), fragment stripped, so a GitHub blob link with a #L anchor counts as 200 when the file at the pinned commit resolves. Whether the anchored line still says what the page quotes was not checked.

| page | external links | unique URLs (all pages) |
|---|---:|---:|
| projects/ember.html | 24 | |
| projects/the-search.html | 17 | |
| projects/web-cad.html | 20 | |
| total | 61 | 28 |

Result: 28 of 28 unique URLs returned HTTP 200. Failures: none. No link was changed.

## URLs checked

- 200 https://github.com/wordingone/WEB-CAD
- 200 https://github.com/wordingone/WEB-CAD/blob/c672cb9b3c16c96a5ea86696a556329d6a9a2e9b/README.md
- 200 https://github.com/wordingone/WEB-CAD/blob/c672cb9b3c16c96a5ea86696a556329d6a9a2e9b/docs/kern-parity-report.md
- 200 https://github.com/wordingone/WEB-CAD/blob/c672cb9b3c16c96a5ea86696a556329d6a9a2e9b/docs/measurements/baseline-tps-2026-05-25.json
- 200 https://github.com/wordingone/WEB-CAD/tree/c672cb9b3c16c96a5ea86696a556329d6a9a2e9b/kern
- 200 https://github.com/wordingone/ember
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/README.md
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/baseline/4090-ceiling-v0.md
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/docs/domains/governance/anatomy/14_MODEL_CARD.md
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/docs/domains/governance/authority/CONTINUITY.md
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/docs/domains/lab/research/export/research-index.json
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/receipts/CLAIMS.md
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/receipts/genesis/genesis-audit-20260706.md
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/receipts/legb-scorer/legb-scorer-evaluator-run-arc-full-20260711T080900Z.json
- 200 https://github.com/wordingone/ember/blob/df2a2d69603ffe8c1eca0faa54eb44837a0bd9b3/src/ember/infrastructure/tools/ember-restart-3b/lineage_candidate_audit.py
- 200 https://github.com/wordingone/ember/blob/e555de431bc7b7bde86362a218f93c888870f936/docs/ember-cli/INSTALL.md
- 200 https://github.com/wordingone/ember/tree/feat/ember-cli-open-weights-mode
- 200 https://github.com/wordingone/gemma-architect
- 200 https://github.com/wordingone/gemma-architect/blob/3f43ee6feb4187154b4ce7d3f86c9e484cec5b6a/README.md
- 200 https://github.com/wordingone/gemma-architect/blob/3f43ee6feb4187154b4ce7d3f86c9e484cec5b6a/submission/README.md
- 200 https://github.com/wordingone/the-search
- 200 https://github.com/wordingone/the-search/blob/0c1a96402bfd6606c18029fa62c801500258544d/README.md
- 200 https://github.com/wordingone/the-search/blob/0c1a96402bfd6606c18029fa62c801500258544d/docs/PAPER.md
- 200 https://github.com/wordingone/the-search/blob/0c1a96402bfd6606c18029fa62c801500258544d/docs/STAGE_MAP.md
- 200 https://github.com/wordingone/the-search/blob/0c1a96402bfd6606c18029fa62c801500258544d/docs/paper.pdf
- 200 https://github.com/wordingone/the-search/blob/0c1a96402bfd6606c18029fa62c801500258544d/docs/paper.tex
- 200 https://wordingone.github.io/WEB-CAD/
- 200 https://wordingone.github.io/ember/
