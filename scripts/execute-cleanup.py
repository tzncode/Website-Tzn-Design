import os
import re
import subprocess

WORKSPACE = "/Users/tiziano/Documents/Proyectos Code/Website Tzn Design/Website-Tzn-Design"

def execute_block_1():
    print("=== Executing Block 1: Telemetry & Event Neutralization ===")
    
    # script_main.CP55s0ji.mjs
    sm_path = os.path.join(WORKSPACE, "assets/js/script_main.CP55s0ji.mjs")
    with open(sm_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Neutralize events buffer at declaration (100% syntax safe)
    content = content.replace("u.__framer_events=u.__framer_events||[]", "u.__framer_events={push:()=>{}}")
    content = content.replace("https://frameruni.link/cc", "#")
    content = content.replace("https://www.framer.com/contact/", "#")
    with open(sm_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("  [OK] Neutralized telemetry in script_main.CP55s0ji.mjs")

    # framer.Df6B049O.mjs
    fr_path = os.path.join(WORKSPACE, "assets/js/framer.Df6B049O.mjs")
    with open(fr_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("G.__framer_events?.push([e,t,n]),e", "e")
    content = content.replace("https://www.framer.com/contact/", "#")
    content = content.replace("https://www.framer.com/api/animation/", "#")
    content = content.replace("https://www.framer.com/", "#")
    content = content.replace("https://screenshot.framer.invalid", "https://screenshot.invalid")
    with open(fr_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("  [OK] Neutralized telemetry and URLs in framer.Df6B049O.mjs")

    # shared-lib.Cd3CT6B9.mjs
    sl_path = os.path.join(WORKSPACE, "assets/js/shared-lib.Cd3CT6B9.mjs")
    with open(sl_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("https://frameruni.link/cc", "#")
    with open(sl_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("  [OK] Cleaned URLs in shared-lib.Cd3CT6B9.mjs")

    # asCqMnOMTBT2l-lT1vDmIQpzCGmo-PSEJ9tN4722S-w.DIrVvjuc.mjs
    as_path = os.path.join(WORKSPACE, "assets/js/asCqMnOMTBT2l-lT1vDmIQpzCGmo-PSEJ9tN4722S-w.DIrVvjuc.mjs")
    with open(as_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("https://www.framer.com/help/articles/how-are-videos-optimized-in-framer/", "#")
    with open(as_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("  [OK] Cleaned URLs in asCqMnOMTBT2l-lT1vDmIQpzCGmo-PSEJ9tN4722S-w.DIrVvjuc.mjs")

def execute_block_2():
    print("\n=== Executing Block 2: Badge Neutralization ===")
    badge_path = os.path.join(WORKSPACE, "assets/js/PX9hIOIVM.C5a06S2j.mjs")
    null_component = """var Te = () => null;
var $ = {
  exports: {
    Props: { type: "tsType", annotations: { framerContractVersion: "1" } },
    default: {
      type: "reactComponent",
      name: "FramerPX9hIOIVM",
      slots: [],
      annotations: {
        framerAutoSizeImages: "true",
        framerContractVersion: "1",
        framerComponentViewportWidth: "true",
        framerIntrinsicWidth: "140",
        framerIntrinsicHeight: "38",
        framerColorSyntax: "true",
        framerDisplayContentsDiv: "false",
        framerImmutableVariables: "true"
      }
    },
    __FramerMetadata__: { type: "variable" }
  }
};
export { $ as __FramerMetadata__, Te as default };
"""
    with open(badge_path, "w", encoding="utf-8") as f:
        f.write(null_component)
    print("  [OK] Replaced PX9hIOIVM.C5a06S2j.mjs with null component")

def execute_block_3():
    print("\n=== Executing Block 3: Deleting Orphan Editor/Cookie Files ===")
    orphan_files = [
        "assets/js/bootstrap.7affe8500f9eb6193d14c84bc7a3ecb002f4b630.js",
        "assets/js/chunk-2F5FSM3K.mjs",
        "assets/js/chunk-7PFFCVW2.mjs",
        "assets/js/chunk-HMF7T2NG.mjs",
        "assets/js/chunk-L74XAAPZ.mjs",
        "assets/js/chunk-XELMBOBL.mjs",
        "assets/js/editorbar.HNEE3SHE.mjs",
        "assets/js/init.mjs",
    ]
    for rel in orphan_files:
        full = os.path.join(WORKSPACE, rel)
        if os.path.exists(full):
            os.remove(full)
            print(f"  [DELETED] {rel}")
        else:
            print(f"  [SKIP] Not found: {rel}")

def execute_block_4():
    print("\n=== Executing Block 4: Contact Form & CMS Links ===")
    
    # Contact form
    contact_js = os.path.join(WORKSPACE, "assets/js/jFCA_GiTscY30xtPK-9KvQ7Ms_2HLFxGnX8A22b5Fvc.COiglExr.mjs")
    with open(contact_js, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("https://api.framer.com/forms/v1/forms/33281875-97b7-41dc-9625-a1938f9eea36/submit", "/api/send-email")
    with open(contact_js, "w", encoding="utf-8") as f:
        f.write(content)
    print("  [OK] Updated contact form action in jFCA_GiTscY30xtPK-9KvQ7Ms_2HLFxGnX8A22b5Fvc.COiglExr.mjs")

    # CMS chunk binary replacement (exact 23 bytes)
    cms_path = os.path.join(WORKSPACE, "assets/js/Nn7b1zcLz-chunk-default-0.framercms")
    with open(cms_path, "rb") as f:
        data = f.read()
    target = b"https://www.framer.com/"
    replacement = b"https://tzndesign.com/#"
    count = data.count(target)
    new_data = data.replace(target, replacement)
    with open(cms_path, "wb") as f:
        f.write(new_data)
    print(f"  [OK] Replaced {count} occurrences in Nn7b1zcLz-chunk-default-0.framercms")

def execute_block_5():
    print("\n=== Executing Block 5: HTML Cleanup (Protecting SSR CSS) ===")
    html_files = []
    for root, dirs, files in os.walk(WORKSPACE):
        if ".git" in root or "node_modules" in root: continue
        for f in files:
            if f.endswith(".html"):
                html_files.append(os.path.join(root, f))

    for hf in sorted(html_files):
        with open(hf, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Remove meta search index tags
        content = re.sub(r'\s*<meta name="framer-search-index" content="[^"]*">', '', content)
        content = re.sub(r'\s*<meta name="framer-search-index-fallback" content="[^"]*">', '', content)

        # 2. Remove standalone editorbar style blocks (BEFORE SSR block or at head end)
        content = re.sub(r'<style>\s*#__framer-editorbar-container\s*\{.*?</style>', '', content, flags=re.DOTALL)
        content = re.sub(r'<style>\s*#__framer-editorbar\s*\{.*?</style>', '', content, flags=re.DOTALL)

        # 3. Clean and standardize badge hide CSS
        content = re.sub(r'<style data-framer-cleaner="true">.*?</style>', '', content, flags=re.DOTALL)
        content = re.sub(r'<style>\s*\[data-framer-badge\].*?</style>', '', content, flags=re.DOTALL)

        # 4. Replace Live Preview links
        content = content.replace('href="https://www.framer.com/"', 'href="https://tzndesign.com/#"')

        # 5. Add clean non-destructive badge hiding rule before </head>
        badge_hide_css = '<style>#__framer-badge-container, [data-framer-badge], #framer-badge, .framer-badge { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }</style>\n</head>'
        if '</head>' in content:
            content = content.replace('</head>', badge_hide_css, 1)

        with open(hf, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [OK] Cleaned HTML: {os.path.relpath(hf, WORKSPACE)}")

def execute_block_6():
    print("\n=== Executing Block 6: dev-server.js URL routing ===")
    ds_path = os.path.join(WORKSPACE, "scripts/dev-server.js")
    with open(ds_path, "r", encoding="utf-8") as f:
        code = f.read()

    # Ensure clean directory / clean URL support
    old_routing = """  // Handle static file serving
  let filePath = path.join(STATIC_DIR, url.pathname);
  if (url.pathname.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If it doesn't end in .html, try adding .html (clean URLs support)
      if (!path.extname(filePath)) {
        filePath += '.html';
        fs.stat(filePath, (err2, stats2) => {
          if (!err2 && stats2.isFile()) {
            serveFile(filePath, res);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('404 Not Found');
          }
        });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
      }
    } else {
      serveFile(filePath, res);
    }
  });"""

    new_routing = """  function resolvePath(targetPath) {
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) {
        const indexPath = path.join(targetPath, 'index.html');
        if (fs.existsSync(indexPath)) return indexPath;
      } else if (stats.isFile()) {
        return targetPath;
      }
    }
    if (!path.extname(targetPath)) {
      const htmlPath = targetPath + '.html';
      if (fs.existsSync(htmlPath)) return htmlPath;
      const dirIndexPath = path.join(targetPath, 'index.html');
      if (fs.existsSync(dirIndexPath)) return dirIndexPath;
    }
    return null;
  }

  const filePath = path.join(STATIC_DIR, url.pathname);
  const resolved = resolvePath(filePath);
  if (resolved) {
    serveFile(resolved, res);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 Not Found');
  }"""

    if old_routing in code:
        code = code.replace(old_routing, new_routing)
        with open(ds_path, "w", encoding="utf-8") as f:
            f.write(code)
        print("  [OK] Updated dev-server.js static routing")
    else:
        print("  [INFO] dev-server.js already updated or modified")

def validate_all_syntax():
    print("\n=== Validating JS Syntax across entire project ===")
    errors = 0
    checked = 0
    for root, dirs, files in os.walk(WORKSPACE):
        if ".git" in root or "node_modules" in root: continue
        for f in files:
            if f.endswith(".js") or f.endswith(".mjs"):
                path = os.path.join(root, f)
                res = subprocess.run(["node", "--check", path], capture_output=True, text=True)
                checked += 1
                if res.returncode != 0:
                    print(f"  [SYNTAX ERROR] {f}:\n{res.stderr}")
                    errors += 1
    print(f"Checked {checked} JavaScript/ESM files. Errors found: {errors}")
    assert errors == 0, f"Validation failed with {errors} syntax error(s)!"

if __name__ == "__main__":
    execute_block_1()
    execute_block_2()
    execute_block_3()
    execute_block_4()
    execute_block_5()
    execute_block_6()
    validate_all_syntax()
    print("\n[SUCCESS] All execution steps and validations passed successfully!")
