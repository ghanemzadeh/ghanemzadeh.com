// Remove every element that a data-sprint-needs / data-sprint-unless hook has
// hidden, so text pulled from a page (the FAQPage schema in render-sprint.mjs,
// the FAQ check in validate-jsonld.mjs, llms-full.txt) matches what a visitor
// sees. Only Sprint hooks are touched; other hidden elements are left alone.
const HIDDEN_HOOK =
  /<([a-z][a-z0-9]*)\b(?=[^>]*\sdata-sprint-(?:needs|unless)="\w+")(?=[^>]*\shidden(?=[\s>/]))[^>]*>/gi;
const VOID = new Set(["area", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

// Index just past the tag that closes the <tag> opened before `from`.
function closeOf(html, tag, from) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

export function stripSprintHidden(html) {
  let out = "";
  let last = 0;
  let m;
  HIDDEN_HOOK.lastIndex = 0;
  while ((m = HIDDEN_HOOK.exec(html))) {
    const tag = m[1].toLowerCase();
    const after = m.index + m[0].length;
    const end = VOID.has(tag) ? after : closeOf(html, tag, after);
    if (end === -1) continue;
    out += html.slice(last, m.index);
    last = end;
    HIDDEN_HOOK.lastIndex = end;
  }
  return out + html.slice(last);
}
