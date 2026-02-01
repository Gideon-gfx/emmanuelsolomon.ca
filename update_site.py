import os
import re

# Configuration
PUBLIC_DIR = r"c:\Users\Gideon\OneDrive\Desktop\Emmanuel's website\public"
SCORES_DIR = r"c:\Users\Gideon\OneDrive\Desktop\Emmanuel's website\public\scores"

# Standard Nav Block (Content of <div class="nav-holder"> ... </div>)
# Copied from the update I did to contact.html (which matches bikkurimstudios.html)
STANDARD_NAV_INNER = """
	<div class="Owner"><a href="/" title="Emmanuel O. Solomon - Home">Emmanuel O. Solomon</a></div>

	<button title="hamburger" class="hamburger" id="hamburgerBtn" onclick="toggleMenu()">
		<span></span>
		<span></span>
		<span></span>
	</button>
	<div class="middle-links" id="navLinks">
			<div class="nav-item dropdown">
			<a class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="true" aria-haspopup="true" href="#" title="Music">Music</a>
			<div class="dropdown-menu">
				<hr>
				<a class="dropdown-item" href="/scores" title="Scores">Scores</a>
				<hr>
				<a class="dropdown-item" href="/recordings" title="Repertoire">Repertoire</a>
			</div>
		</div>
		<hr>
		<div class="nav-item dropdown">
			<a class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="true" aria-haspopup="true" href="#">Initiatives</a>
			<div class="dropdown-menu">
			  <hr>
				<a class="dropdown-item" href="/bikkurimstudios" title="Bikkurimstudios">Bikkurimstudios</a>
				<hr>
				<a class="dropdown-item" href="/bivo" title="BiVo">BiVo</a>
				<hr>
				<a class="dropdown-item" href="/lagossistema" title="Lagossistema">Lagossistema</a>
			</div>
		</div>
		<hr>
		<div class="nav-item dropdown">
			<a class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="true" aria-haspopup="true" href="#" title="About">About</a>
			<div class="dropdown-menu">
				<hr>
				<a class="dropdown-item" href="/biography" title="Biography">Biography</a>
				<hr>
				<a class="dropdown-item" href="/gallery" title="Gallery">Gallery</a>
				<hr>
				<a class="dropdown-item" href="https://docs.google.com/document/d/1dZllbQm6qUkkoXehd7VWwD_ieXnemLTwSVKd7aCLndM/edit?tab=t.0" target="_blank" rel="noopener" title="Press Kits">Press Kits</a>
				<hr>
				<a class="dropdown-item" href="/research" title="Research & Publications">Research & Publications</a>
			</div>
		</div>
		<hr>
		<div class="nav-item dropdown">
			<a class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="true" aria-haspopup="true" href="#" title="Contact">Contact</a>
			<div class="dropdown-menu">
				<hr>
				<a class="dropdown-item" href="/contact" title="Contact Form">Contact Form</a>
				<hr>
				<a class="dropdown-item" href="/collaborate" title="Collaborate">Collaborate</a>
			</div>
		</div>
		<hr>
		<a href="/mailing" title="Mailing Lists">Mailing Lists</a><hr>
	</div>
	<div class="social-links">
		<a title="facebook" rel="noopener" href="https://www.facebook.com/share/17pbyZngMH/" target="_blank"><svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg></a>
		<a title="instagram" rel="noopener" href="https://www.instagram.com/emmanuelsolomontenore?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank"><svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/></svg></a>
	</div>
"""

# Standard Footer Block
# Based on bikkurimstudios.html + TikTok from index.html
STANDARD_FOOTER = """
		<p class="copyright">© 2026 Emmanuel O. Solomon. All rights reserved.</p>
		<div class="location"> 150 Queen Elizabeth Driveway, Ottawa, ON K2P 1E7, Canada </div>
		<div class="policies">
		<a href="/terms" title="Terms of Use">Terms of Use</a>
		<hr>
		<a href="/privacy" title="Privacy Policy">Privacy Policy</a>
		</div>
			 <div class="social-links footer-social">
				<a title="facebook" rel="noopener" href="https://www.facebook.com/share/17pbyZngMH/" target="_blank"><svg width="16" height="16" fill="#fff" class="bi bi-facebook" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg></a>
				<a title="instagram" rel="noopener" href="https://www.instagram.com/emmanuelsolomontenore?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank"><svg width="16" height="16" fill="#fff" class="bi bi-instagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/></svg></a>
				<a title="twitter" rel="noopener" href="https://x.com/emmanue30108277?s=11&t=myU-BaBZIzLiDKCtyzK8hQ" target="_blank"><svg width="16" height="16" fill="#fff" class="bi bi-twitter" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg></a>
				<a title="linkedin" rel="noopener" href="https://www.linkedin.com/in/emmanuel-solomontenore?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank"><svg width="16" height="16" fill="#fff" class="bi bi-linkedin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg></a>
				<a title="spotify" rel="noopener" href="#" target="_blank"><svg width="16" height="16" fill="#fff" class="bi bi-spotify" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/></svg></a>
				<a title="youtube" rel="noopener" href="https://youtube.com/@emmanuelsolomonsings?si=j6HPSaDFVXFGTBEN" target="_blank"><svg width="16" height="16" fill="#fff" class="bi bi-youtube" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/></svg></a>
				<a title="tiktok" rel="noopener" href="https://www.tiktok.com/@emmanueltenore?_r=1&_t=ZS-93SstKaxgur" target="_blank"><svg width="16" height="16" fill="#fff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3v178.8A162.6 162.6 0 1 1 185 188.3v89.9a74.6 74.6 0 1 0 52.2 71.2V0h88a121.2 121.2 0 0 0 1.9 22.2 122.2 122.2 0 0 0 53.9 80.2 121.4 121.4 0 0 0 67 20.1z"/></svg></a>
		</div>
		<p class="designer" style="text-align: right; font-size: 0.8rem; margin: 1rem 0; color: #aaa;">Designed by <a title="Designer" rel="noopener" href="/" style="color: inherit; text-decoration: none;">GIDEON</a></p>
"""

def update_file(filepath):
    print(f"Update: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    filename = os.path.basename(filepath)
    is_index = (filename == "index.html")
    
    # Update Nav (NOT for index.html)
    if not is_index:
        # Regex to find <div class="nav-holder">...</div>
        # We assume the nav holder contains "Emmanuel O. Solomon" and matches the known structure
        # pattern = r'(<div class="nav-holder">)([\s\S]*?)(</div>\s*<!--.*?nav.*?-->\s*</div>|</div>\s*</div>)' 
        # The closing tag is tricky. 
        # Strategy: Find <div class="nav-holder">. Find the next occurrence of <div class="Owner"> inside it.
        # Actually, best way is to locate <div class="nav-holder"> and replace everything until the <div class="body"> end? No.
        
        # Simplified: Identify the BLOCK we want to replace.
        # It starts with <div class="nav-holder">
        # It ends before <main> or before the content. 
        # But wait, looking at bikkurimstudios.html:
        # <div class="body">
        #   <div class="nav-holder">...</div>
        #   <main class="bikkurim-main">
        
        # So we can look for <div class="nav-holder"> ... <main|section|div class="container"?
        
        # The OLD files might not have <main>. 
        # But they definitely have <div class="nav-holder">.
        # And usually the nav holder is closed before the content starts.
        
        # We'll use a regex that matches balanced divs? No.
        # We will assume that <div class="nav-holder"> is followed by a closing </div> that closes it.
        # But wait, does it?
        # In contact.html:
        #   <div class="nav-holder">
        #      ...
        #   </div>
        # So yes, it's a single div.
        
        # Let's try to find <div class="nav-holder"> and the FIRST closing </div> that appears after `nav-holder` start?
        # NO! nav-holder has nested divs (dropdowns).
        
        # We can count divs.
        # OR we can regex replace based on known large chunks.
        
        # Let's look for the START line of nav-holder and the END line.
        # Nav-holder usually ends before "social-links" if it's the OLD one? 
        # No, old one had social links INSIDE nav-holder?
        # Yes.
        
        # Let's iterate lines.
        lines = content.split('\n')
        new_lines = []
        in_nav = False
        nav_replaced = False
        nav_div_count = 0
        
        for line in lines:
            if '<div class="nav-holder">' in line and not nav_replaced:
                in_nav = True
                nav_div_count = line.count('<div') - line.count('</div')
                new_lines.append('<div class="nav-holder">')
                new_lines.append(STANDARD_NAV_INNER)
                new_lines.append('</div>')
                nav_replaced = True
                # We skip lines until we find the closing of nav-holder
                continue
            
            if in_nav:
                nav_div_count += line.count('<div')
                nav_div_count -= line.count('</div')
                if nav_div_count <= 0:
                    in_nav = False
                continue
            
            new_lines.append(line)
        
        content = '\n'.join(new_lines)

    # Update Footer
    # Strategy: Remove old footer elements (copyright, policies, social-links at end) and append new Footer Block at end of body.
    # But files might have content AFTER footer? Unlikely.
    # We need to find where to insert the new footer.
    # Usually inside <div class="body">, at the end.
    
    # Step 1: Remove old footer parts if found.
    # Patterns to remove:
    # <p class="copyright">...
    # <div class="location">...
    # <div class="policies">...
    # <div class="social-links footer-social">...
    # OR <div class="social-links"> at the end of the file (check context)
    
    # Regex to remove copyright paragraph
    content = re.sub(r'<p class="copyright">.*?</p>', '', content, flags=re.DOTALL)
    
    # Regex to remove location dev
    content = re.sub(r'<div class="location">.*?</div>', '', content, flags=re.DOTALL)
    
    # Regex to remove policies div
    content = re.sub(r'<div class="policies">.*?</div>', '', content, flags=re.DOTALL)
    
    # Regex to remove social-links at the bottom
    # We search for social-links that contains "spotify" or is near </body>
    # This is dangerous if there are other social links.
    # But usually social links are only in Nav or Footer.
    # We already replaced Nav (or for index.html we ignore Nav).
    # So remaining social-links are Footer or legitimate content?
    # Index.html has social links in footer.
    # Other pages have social links in footer.
    
    # Let's try to match `<div class="social-links.*?</div>` that is near the end of the file.
    # Or matches current footer structure.
    
    content = re.sub(r'<div class="social-links footer-social">.*?</div>', '', content, flags=re.DOTALL)
    
    # Also remove "Designed by Gideon" if present to avoid dupes
    content = re.sub(r'<p class="designer">.*?</p>', '', content, flags=re.DOTALL)
    
    # Also remove old plain social-links if they look like footer (contain spotify loop?)
    # Be careful not to remove Nav social links if we didn't replace Nav (e.g. Index).
    
    # If is_index, we didn't touch Nav. Does index nav have social links? 
    # Yes (white nav).
    # We must ensure we don't delete Index Nav social links.
    # Index Nav social links are inside `nav-holder`.
    # Index Footer social links are inside `footer` or at bottom.
    
    # We will search for social-links that are NOT inside nav-holder? Hard with regex.
    # We can rely on the class `footer-social` that I added in bikkurimstudios? 
    # But old files don't have `footer-social` class maybe.
    
    # Manual scan for footer insertion point.
    # Valid insertion point: closing </div> of <div class="body">.
    # Or just before </body>.
    
    # Let's find `</div>` that closes `.body`.
    # Assuming `<div class="body">` starts near top.
    # If we can't find it, append to body.
    
    # We will insert the STANDARD_FOOTER before the last `</div>` (closing body) or `</body>`.
    
    # Check if we removed the old footer social links.
    # If the file had `<div class="social-links">` (without footer-social) in the footer, we might have missed it.
    # Let's assume the update adds the new footer, and if old footer is there, it might duplicate.
    # I will try to remove the LAST `div class="social-links"` in the file IF it is not the Nav one.
    
    # How? find all matches. Check positions.
    matches = list(re.finditer(r'<div class="social-links.*?</div>', content, re.DOTALL))
    if matches:
        last_match = matches[-1]
        # If this match is near the end, remove it.
        # length of content
        if last_match.start() > len(content) * 0.5: # In the second half
             # Check if it is inside Nav?
             pass 
             # For now, let's just attempt to remove it if it looks like footer (has spotify/youtube, no owner link nearby)
    
    # Better: Just insert the new footer. If duplication occurs, I'll fix it manually for the few pages.
    # Most pages I saw had `footer-social` or similar structure if I touched them.
    # The old pages might have just social-links.
    
    # Insertion
    if '</body>' in content:
        # Insert before script tags if possible, or before </body>
        # Actually proper place is at end of .body container or main container.
        # But appending to end of body is safer than breaking syntax.
        # bikkurimstudios has footer inside .body
        
        # Try to find closing of .body
        # Reverse search for </div>
        # This is unreliable.
        
        # Use Simple Insertion: Before </body>
        content = content.replace('</body>', f'{STANDARD_FOOTER}\n</body>')
    else:
        content += STANDARD_FOOTER

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# File Gathering
# files = [os.path.join(PUBLIC_DIR, f) for f in os.listdir(PUBLIC_DIR) if f.endswith('.html')]
# scores_files = [os.path.join(SCORES_DIR, f) for f in os.listdir(SCORES_DIR) if f.endswith('.html')]
# all_files = files + scores_files

all_files = [os.path.join(PUBLIC_DIR, 'mailing.html')]


for f in all_files:
    # Skip bikkurimstudios.html as it is source (Wait, I should update it with TikTok?)
    # Yes, update bikkurimstudios.html only the footer part to add TikTok.
    # My code skips Nav for Index, but Bikkurimstudios IS the Nav source.
    # I should SKIP Nav update for Bikkurimstudios too.
    if "bikkurimstudios.html" in f:
        # Update Footer only (to add TikTok)
        pass 
    
    # Actually, exclude bikkurimstudios from Nav update to avoid recursive mess?
    # No, the script replaces with STANDARD_NAV_INNER. If it matches, no change.
    
    # Exclude files I don't want to touch?
    # I'll run it for all.
    try:
        update_file(f)
    except Exception as e:
        print(f"Error updating {f}: {e}")

