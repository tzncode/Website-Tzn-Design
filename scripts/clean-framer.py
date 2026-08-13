import os
import re

WORKSPACE = "/Users/tiziano/Documents/Proyectos Code/Website Tzn Design/Website-Tzn-Design"

def clean_script_main():
    path = os.path.join(WORKSPACE, "assets/js/script_main.CP55s0ji.mjs")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Telemetry push
    old_push = r"u\.__framer_events\.push\(\[`published_site_pageview`.*?`eager`\]\)"
    content = re.sub(old_push, "/* pageview telemetry removed */", content)

    # 2. Badge injection
    target_badge = '(function(){nr&&x(()=>{re(document.getElementById(`__framer-badge-container`),b(g,{},b(y(()=>import(`./PX9hIOIVM.C5a06S2j.mjs`)))))})})()'
    content = content.replace(target_badge, "(function(){/* framer badge mount removed */})()")

    # 3. Framer URLs
    content = content.replace("https://frameruni.link/cc", "#")
    content = content.replace("https://www.framer.com/contact/", "#")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Cleaned assets/js/script_main.CP55s0ji.mjs")

def clean_framer_mjs():
    path = os.path.join(WORKSPACE, "assets/js/framer.Df6B049O.mjs")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("G.__framer_events?.push([e,t,n])", "/* telemetry push removed */")
    content = content.replace("https://www.framer.com/contact/", "#")
    content = content.replace("https://www.framer.com/api/animation/", "#")
    content = content.replace("https://www.framer.com/", "#")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Cleaned assets/js/framer.Df6B049O.mjs")

def clean_contact_form():
    path = os.path.join(WORKSPACE, "assets/js/jFCA_GiTscY30xtPK-9KvQ7Ms_2HLFxGnX8A22b5Fvc.COiglExr.mjs")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("https://api.framer.com/forms/v1/forms/33281875-97b7-41dc-9625-a1938f9eea36/submit", "/api/send-email")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Cleaned assets/js/jFCA_GiTscY30xtPK-9KvQ7Ms_2HLFxGnX8A22b5Fvc.COiglExr.mjs")

def clean_shared_lib():
    path = os.path.join(WORKSPACE, "assets/js/shared-lib.Cd3CT6B9.mjs")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("https://frameruni.link/cc", "#")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Cleaned assets/js/shared-lib.Cd3CT6B9.mjs")

def clean_as_cq():
    path = os.path.join(WORKSPACE, "assets/js/asCqMnOMTBT2l-lT1vDmIQpzCGmo-PSEJ9tN4722S-w.DIrVvjuc.mjs")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("https://www.framer.com/help/articles/how-are-videos-optimized-in-framer/", "#")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Cleaned assets/js/asCqMnOMTBT2l-lT1vDmIQpzCGmo-PSEJ9tN4722S-w.DIrVvjuc.mjs")

def clean_cms_chunk():
    path = os.path.join(WORKSPACE, "assets/js/Nn7b1zcLz-chunk-default-0.framercms")
    with open(path, "rb") as f:
        data = f.read()
    target = b"https://www.framer.com/"
    replacement = b"https://tzndesign.com/#"
    assert len(target) == len(replacement), "Byte length must match exactly"
    count = data.count(target)
    new_data = data.replace(target, replacement)
    with open(path, "wb") as f:
        f.write(new_data)
    print(f"[OK] Cleaned assets/js/Nn7b1zcLz-chunk-default-0.framercms ({count} replacements)")

def clean_html_files():
    html_files = []
    for root, dirs, files in os.walk(WORKSPACE):
        if ".git" in root: continue
        for f in files:
            if f.endswith(".html"):
                html_files.append(os.path.join(root, f))

    for hf in sorted(html_files):
        with open(hf, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Remove meta framer-search-index tags
        content = re.sub(r'\s*<meta name="framer-search-index" content="[^"]*">', '', content)
        content = re.sub(r'\s*<meta name="framer-search-index-fallback" content="[^"]*">', '', content)

        # 2. Remove editorbar & badge CSS rules (multiline tolerant)
        content = re.sub(r'@supports\s*\(z-index:calc\(infinity\)\)\s*\{\s*#__framer-badge-container\s*\{[^}]*\}\s*\}', '', content)
        content = re.sub(r'#__framer-badge-container\s*\{[^}]*\}', '', content)
        content = re.sub(r'#__framer-editorbar[^{]*\{[^}]*\}', '', content)
        content = re.sub(r'#__framer-editorbar\.[^{]*\{[^}]*\}', '', content)

        # 3. Remove badge hiding / cleaner style blocks
        content = re.sub(r'<style>\s*\[data-framer-badge\].*?</style>', '', content, flags=re.DOTALL)
        content = re.sub(r'<style data-framer-cleaner="true">.*?</style>', '', content, flags=re.DOTALL)
        content = re.sub(r'<style>\s*#__framer-editorbar.*?</style>', '', content, flags=re.DOTALL)

        # 4. Clean Live Preview links in portfolio pages
        content = content.replace('href="https://www.framer.com/"', 'href="https://tzndesign.com/#"')

        with open(hf, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[OK] Cleaned HTML: {os.path.relpath(hf, WORKSPACE)}")

if __name__ == "__main__":
    clean_script_main()
    clean_framer_mjs()
    clean_contact_form()
    clean_shared_lib()
    clean_as_cq()
    clean_cms_chunk()
    clean_html_files()
    print("\nAll cleanup steps completed successfully!")
