import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "APNI DHUN MUSIC PLATFORM — COMPREHENSIVE BUG REPORT")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 744, letter[0] - 54, 744)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, footer_text)
        self.drawString(54, 36, "CONFIDENTIAL — FOR QA AUDIT & AI BENCHMARKING ONLY")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 46, letter[0] - 54, 46)
        
        self.restoreState()

def build_pdf(filename="Apni_Dhun_Bug_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1E1B4B"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    badge_backend = ParagraphStyle(
        'BadgeBackend',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#4338CA"),
    )

    badge_frontend = ParagraphStyle(
        'BadgeFrontend',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0369A1"),
    )

    bug_title_style = ParagraphStyle(
        'BugTitle',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=0,
        spaceAfter=4
    )

    field_label_style = ParagraphStyle(
        'FieldLabel',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1E293B")
    )

    field_value_style = ParagraphStyle(
        'FieldValue',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155")
    )

    meta_key = ParagraphStyle(
        'MetaKey',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#475569")
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B")
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("Apni Dhun Music Platform", title_style))
    elements.append(Paragraph("System Defect Audit, Vulnerability Catalog & Multi-Prompt AI Benchmark Bugs", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4F46E5"), spaceBefore=0, spaceAfter=12))

    # Executive Summary Card
    exec_content = [
        [
            Paragraph("<b>Environment Classification:</b>", meta_key),
            Paragraph("<font color='#B91C1C'><b>CONFIRMED 'WEB OF BUGS'</b></font> (Deliberate Bug Challenge & Vulnerability Platform)", meta_val)
        ],
        [
            Paragraph("<b>Codebase Scope:</b>", meta_key),
            Paragraph("Full-Stack MVC (Node.js/Express, MongoDB/Mongoose fallback, Vanilla JS client)", meta_val)
        ],
        [
            Paragraph("<b>Existing Bugs Policy:</b>", meta_key),
            Paragraph("<b>100% PRESERVED</b> — None removed or patched, as strictly instructed.", meta_val)
        ],
        [
            Paragraph("<b>New Injected Bugs:</b>", meta_key),
            Paragraph("<b>6 Deep Backend Architecture Bugs</b> engineered to resist LLM / AI solvers across 4-5 prompts.", meta_val)
        ],
        [
            Paragraph("<b>Total Documented Bugs:</b>", meta_key),
            Paragraph("<b>16 Defect Profiles</b> (6 Advanced Backend Bugs + 10 Pre-existing System Bugs)", meta_val)
        ]
    ]
    t_exec = Table(exec_content, colWidths=[140, 364])
    t_exec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_exec)
    elements.append(Spacer(1, 14))

    # Verification Note
    note_p = Paragraph(
        "<b>Verification Finding:</b> Analysis of the repository confirms this is indeed a <b>Web of Bugs</b>. "
        "The codebase contains deliberate syntax, DOM selector, audio lifecycle, asynchronous, and configuration bugs in the frontend and backend. "
        "Per instructions, all existing defects remain intact, and <b>6 sophisticated backend bugs</b> have been added. "
        "These new bugs exploit subtle JavaScript engine semantics (ECMAScript comparator contracts, Map identity hashing, "
        "implicit string-to-number NaN coercion, Mongoose schema lifecycle double-hashing, and module-level object reference sharing) "
        "that typical AI coding assistants cannot resolve within 4 to 5 prompts.",
        callout_text
    )
    t_note = Table([[note_p]], colWidths=[504])
    t_note.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#C7D2FE")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(t_note)
    elements.append(Spacer(1, 16))

    def make_bug_card(bug_num, tag, title, desc, steps, expected, buggy, is_new=False):
        header_bg = colors.HexColor("#FAF5FF") if is_new else colors.HexColor("#F0F9FF")
        header_border = colors.HexColor("#DDD6FE") if is_new else colors.HexColor("#BAE6FD")
        badge_style = badge_backend if is_new else badge_frontend
        badge_text = "ADVANCED BACKEND BUG (AI-RESISTANT)" if is_new else "EXISTING SYSTEM BUG"

        # Table rows in requested exact format:
        # bug title, bug description, steps to reproduce the bugs, expected behavior, buggy behavior
        data = [
            [
                Paragraph(f"<b>BUG #{bug_num:02d} — {badge_text}</b>", badge_style),
                Paragraph("", badge_style)
            ],
            [
                Paragraph("<b>Bug Title:</b>", field_label_style),
                Paragraph(f"<b>{title}</b>", bug_title_style)
            ],
            [
                Paragraph("<b>Bug Description:</b>", field_label_style),
                Paragraph(desc, field_value_style)
            ],
            [
                Paragraph("<b>Steps to Reproduce:</b>", field_label_style),
                Paragraph(steps, field_value_style)
            ],
            [
                Paragraph("<b>Expected Behavior:</b>", field_label_style),
                Paragraph(expected, field_value_style)
            ],
            [
                Paragraph("<b>Buggy Behavior:</b>", field_label_style),
                Paragraph(buggy, field_value_style)
            ]
        ]

        t_card = Table(data, colWidths=[120, 384])
        t_card.setStyle(TableStyle([
            ('SPAN', (0,0), (1,0)),
            ('BACKGROUND', (0,0), (-1,0), header_bg),
            ('BOTTOMPADDING', (0,0), (-1,0), 4),
            ('TOPPADDING', (0,0), (-1,0), 4),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#FFFFFF")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('LINEBELOW', (0,0), (-1,0), 1, header_border),
            ('INNERGRID', (0,1), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
            ('TOPPADDING', (0,1), (-1,-1), 5),
            ('BOTTOMPADDING', (0,1), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return KeepTogether([t_card, Spacer(1, 10)])

    # SECTION 1: NEWLY INJECTED BACKEND BUGS
    elements.append(Paragraph("PART 1: Newly Added Advanced Backend Bugs (AI-Resistant: 4-5 Prompts)", h1_style))
    elements.append(Paragraph(
        "<i>These 6 backend defects have been introduced into the active Node.js services. "
        "Each bug appears syntactically valid and idiomatically clean, but triggers critical logic failures due to deep runtime subtleties.</i>",
        subtitle_style
    ))
    elements.append(Spacer(1, 4))

    new_bugs = [
        (
            1,
            "Backend",
            "Mongoose Pre-Save Double-Hashing Authentication Lockout",
            "In <code>backend/services/authService.js</code>, <code>registerUser</code> manually pre-hashes the password with bcrypt prior to calling <code>new User({ password: preHashedPassword })</code>. "
            "When <code>await user.save()</code> triggers, Mongoose's <code>userSchema.pre('save')</code> hook in <code>models/User.js</code> also detects <code>isModified('password')</code> and runs <code>bcrypt.hash()</code> a second time on the already-hashed string. "
            "Consequently, the stored hash in the database is double-hashed. When the user attempts to sign in via <code>POST /api/auth/login</code>, <code>bcrypt.compare()</code> verifies the raw candidate password against the double-hashed string, which will always return false.",
            "1. Ensure MongoDB is connected in <code>backend/.env</code>.<br/>"
            "2. Send <code>POST /api/auth/register</code> with body <code>{\"name\": \"Test User\", \"email\": \"test@example.com\", \"password\": \"secret1234\"}</code>.<br/>"
            "3. Observe HTTP 201 Created response indicating successful registration.<br/>"
            "4. Immediately attempt <code>POST /api/auth/login</code> with the exact same credentials <code>{\"email\": \"test@example.com\", \"password\": \"secret1234\"}</code>.",
            "HTTP 200 OK response with user session profile and signed JWT authentication cookie.",
            "HTTP 401 Unauthorized with <code>{\"error\": \"Invalid email or password.\"}</code>. "
            "Typical AI models take 4-5 prompts analyzing bcrypt salt rounds, trimming, and JWT cookies before noticing the schema-level lifecycle hook collision across separate files.",
            True
        ),
        (
            2,
            "Backend",
            "Cross-Account In-Memory Reference Mutation in User Favorites",
            "In <code>backend/services/authService.js</code>, fallback memory user accounts are initialized with a module-level reference: <code>favorites: DEFAULT_USER_SETTINGS.favorites</code>. "
            "Because arrays in JavaScript are passed by reference rather than copied, every newly registered user in memory mode references the exact same in-memory array. "
            "Adding or removing a favorite in <code>backend/services/favoriteService.js</code> via <code>user.favorites.push()</code> mutates the shared array in place, leaking saved tracks across all user accounts on the platform.",
            "1. Run backend in resilient memory fallback mode (MongoDB offline).<br/>"
            "2. Register User A (<code>usera@example.com</code>) and verify empty favorites list (<code>[]</code>).<br/>"
            "3. Register User B (<code>userb@example.com</code>).<br/>"
            "4. As User A, save Song ID 4 (<code>PUT /api/favorites/4</code>).<br/>"
            "5. As User B, fetch favorites (<code>GET /api/favorites</code>).",
            "User B's favorites list should be empty (<code>[]</code>) as user accounts must be isolated.",
            "User B receives <code>{\"favorites\": [4]}</code> containing User A's favorite. "
            "When User B deletes Song 4, it vanishes from User A's account as well. AI models assume JWT token pollution or client localStorage caching rather than module-level reference sharing.",
            True
        ),
        (
            3,
            "Backend",
            "String-to-Number Date Coercion NaN Evaluation in Password Reset Expiry",
            "In <code>backend/services/authService.js</code>, <code>requestPasswordReset</code> stores expiration as an ISO 8601 string: <code>new Date(Date.now() + 3600000).toISOString()</code>. "
            "In <code>resetPassword</code>, the memory validation checks <code>u.resetPasswordExpires > Date.now()</code>. "
            "In JavaScript, comparing a date string to a number forces <code>Number(\"2026-10-...\")</code>, which evaluates to <code>NaN</code>. "
            "Any relational comparison involving <code>NaN</code> (<code>NaN > number</code>) unconditionally evaluates to <code>false</code>.",
            "1. Send <code>POST /api/auth/forgot-password</code> with body <code>{\"email\": \"usera@example.com\"}</code>.<br/>"
            "2. Capture the returned <code>resetToken</code>.<br/>"
            "3. Immediately (within 2 seconds) submit <code>POST /api/auth/reset-password</code> with <code>{\"token\": \"<resetToken>\", \"password\": \"newpassword999\"}</code>.",
            "HTTP 200 OK with message 'Password reset successful! Please sign in with your new password.'",
            "HTTP 400 Bad Request with message 'Invalid or expired reset token.' immediately. "
            "AI assistants habitually diagnose server clock drift, timezones, or token truncation over multiple prompts without realizing the implicit coercion produces NaN.",
            True
        ),
        (
            4,
            "Backend",
            "Unstable Non-Contract Boolean Return in Array.prototype.sort (Broken Top Song)",
            "In <code>backend/services/songService.js</code>, <code>getMostPlayedSong</code> sorts memory songs using: "
            "<code>[...memorySongs].sort((a, b) => (b.playCount || 0) > (a.playCount || 0))[0]</code>. "
            "The ECMAScript specification explicitly requires <code>Array.prototype.sort</code> comparators to return a signed number (negative, zero, positive). "
            "Returning a boolean (<code>true/false</code> coerced to 1/0) never yields negative numbers. V8's Timsort algorithm violates sorting assumptions, failing to perform descending swaps and returning arbitrary tracks with low play counts.",
            "1. Start the server in memory fallback mode.<br/>"
            "2. Log 5 plays for Song #1 (<code>POST /api/songs/1/play</code> x 5).<br/>"
            "3. Log 150 plays for Song #2 (<code>POST /api/songs/2/play</code> x 150).<br/>"
            "4. Query platform metrics via <code>GET /api/stats</code>.",
            "<code>mostPlayedSong.title</code> returns Song #2 with playCount 150.",
            "<code>mostPlayedSong.title</code> returns Song #1 with playCount 5 (or an unplayed song). "
            "AI models reading <code>></code> instinctively assume descending sort order, taking 4-5 prompts before checking the comparator return type.",
            True
        ),
        (
            5,
            "Backend",
            "Lexicographical UTF-16 String Coercion on Playlist Song IDs Ordering",
            "In <code>backend/services/playlistService.js</code>, <code>updatePlaylistSongs</code> performs sorting prior to storage using <code>Array.from(new Set(numericSongIds)).sort()</code> without passing a comparator callback. "
            "In JavaScript, default <code>.sort()</code> converts elements to strings and compares UTF-16 code unit values. "
            "Numeric sequences such as <code>[1, 2, 4, 10, 11]</code> are sorted into <code>[1, 10, 11, 2, 4]</code>, corrupting user-defined playlist tracks and ordering.",
            "1. Create a new playlist via <code>POST /api/playlists</code> with name 'Chill Mood'.<br/>"
            "2. Update playlist songs via <code>PUT /api/playlists/:id/songs</code> with body <code>{\"songIds\": [1, 2, 3, 10]}</code>.<br/>"
            "3. Fetch the updated playlist via <code>GET /api/playlists</code>.",
            "Playlist songs array preserves exact numeric order <code>[1, 2, 3, 10]</code>.",
            "Playlist songs are reordered as <code>[1, 10, 2, 3]</code>, placing Song #10 ahead of Song #2. "
            "AI models typically inspect frontend drag-and-drop listeners or database schema serialization rather than JavaScript's default sort behavior.",
            True
        ),
        (
            6,
            "Backend",
            "Strict Equality Type Mismatch (Number vs String) in Radio Station Song Map Lookup",
            "In <code>backend/services/radioService.js</code>, <code>getStationNowPlaying</code> indexes the song catalog using string keys: "
            "<code>new Map(allSongs.map(s => [String(s.id), s]))</code>. "
            "However, station playlists in <code>seedData.js</code> define <code>songIds</code> as primitive numbers (e.g., <code>[1, 3, 5, 7]</code>). "
            "When mapping station songs via <code>songMap.get(id)</code>, <code>Map.prototype.get</code> applies strict equality (<code>===</code>), where <code>1 === \"1\"</code> is false. "
            "Every lookup returns <code>undefined</code>, causing <code>stationSongs</code> to always be empty and forcing all stations to silently fall back to the entire catalog.",
            "1. Query Sunset FM radio feed: <code>GET /api/radio/stations/sunset-fm/now-playing</code>.<br/>"
            "2. Note the genre and track metadata of the returned <code>currentSong</code>.<br/>"
            "3. Query at different simulated timestamp offsets.",
            "Sunset FM exclusively broadcasts curated station tracks from its assigned pool <code>[1, 3, 5, 7]</code>.",
            "<code>stationSongs</code> evaluates to empty <code>[]</code>. Sunset FM broadcasts random tracks from the entire global catalog (including Hip-Hop and EDM on an acoustic station). "
            "AI models inspect database seed scripts and timestamps without noticing the JavaScript Map key type mismatch.",
            True
        )
    ]

    for b in new_bugs:
        elements.append(make_bug_card(*b))

    elements.append(Spacer(1, 10))

    # SECTION 2: EXISTING PRESERVED BUGS
    elements.append(Paragraph("PART 2: Pre-Existing System Bugs (Preserved in Repository)", h1_style))
    elements.append(Paragraph(
        "<i>These 10 defects existed in the uploaded codebase. As instructed, they have been audited, documented, and strictly preserved without removal.</i>",
        subtitle_style
    ))
    elements.append(Spacer(1, 4))

    existing_bugs = [
        (
            7,
            "Backend",
            "Undeclared 'dotenv' Variable ReferenceError on Server Startup",
            "In <code>backend/server.js</code> line 8, <code>dotenv.config({ path: path.join(__dirname, '.env') })</code> is called. "
            "However, <code>dotenv</code> is never imported as a constant (line 5 uses <code>require('dotenv').config()</code> without assignment). "
            "Node.js execution terminates immediately upon launch with a fatal unhandled ReferenceError.",
            "1. Open a terminal in the root or <code>backend</code> directory.<br/>"
            "2. Run <code>node backend/server.js</code>.",
            "Backend server initializes database connection and starts listening on the configured PORT.",
            "Crashes on startup with <code>ReferenceError: dotenv is not defined at server.js:8:1</code>."
        ),
        (
            8,
            "Fullstack",
            "Port Inconsistency Between Client Endpoints and Server Environment",
            "In <code>backend/.env</code>, the server port is configured as <code>PORT=5000</code>. "
            "However, across all frontend scripts (<code>script.js</code>, <code>login.js</code>, <code>signup.js</code>, <code>discover.js</code>, <code>explore.js</code>, <code>favorites.js</code>, <code>playlists.js</code>, <code>radio.js</code>), "
            "the API URL is hardcoded as: <code>API_BASE = window.location.port === '3000' ? '' : 'http://localhost:3000'</code>.",
            "1. Start the backend server on port 5000 (from <code>.env</code>).<br/>"
            "2. Open <code>frontend/index.html</code> via Live Server (port 5500) or static browser preview.<br/>"
            "3. Attempt any authentication, search, or playback operation.",
            "Frontend sends API calls to the active server port (5000) and receives valid responses.",
            "Browser makes calls to <code>http://localhost:3000</code>, failing with <code>ERR_CONNECTION_REFUSED</code> / 'Failed to fetch'."
        ),
        (
            9,
            "Frontend",
            "Invalid CSS Class Selector on Discover Hero CTA Button",
            "In <code>frontend/discover.js</code> line 4, the button is queried using: "
            "<code>document.querySelector('.discover-hero .primary-button')</code>. "
            "In <code>frontend/discover.html</code> line 50, the button class is defined as <code>class='primary-btn'</code>.",
            "1. Open <code>frontend/discover.html</code> in a browser.<br/>"
            "2. Click the 'Explore Mix' button in the hero banner.",
            "Click event listener executes and begins playback of the featured discovery mix.",
            "<code>heroBtn</code> is <code>null</code>. No listener is attached; clicking produces no action."
        ),
        (
            10,
            "Frontend",
            "CSS Selector Prefix Period Passed into classList.add()",
            "In <code>frontend/discover.js</code> line 17, clicking a topic pill triggers: "
            "<code>pill.classList.add('.active')</code> with a leading period prefix. "
            "<code>DOMTokenList.add()</code> treats the period as part of the class token name.",
            "1. Open <code>discover.html</code>.<br/>"
            "2. Click any discovery topic pill (e.g., 'Rising', 'Global').<br/>"
            "3. Inspect the DOM element classes.",
            "Element receives class <code>active</code>, highlighting the selected category.",
            "Element receives literal class <code>.active</code>. The CSS selector <code>.topic-pill.active</code> fails to match; no active pill highlight appears."
        ),
        (
            11,
            "Frontend",
            "Out-of-Bounds Array Access via Math.round() in Discover Mix Randomizer",
            "In <code>frontend/discover.js</code> line 36, random song selection is computed using: "
            "<code>data.songs[Math.round(Math.random() * data.songs.length)]</code>. "
            "Because <code>Math.round()</code> rounds to the nearest integer, when <code>Math.random()</code> exceeds <code>(length - 0.5) / length</code>, the index evaluates to <code>data.songs.length</code>.",
            "1. Navigate to <code>discover.html</code>.<br/>"
            "2. Repeatedly trigger mix playback by clicking topic pills.<br/>"
            "3. Observe network and console logs when random value approaches 1.",
            "Array access resolves to an element between <code>0</code> and <code>length - 1</code>.",
            "Array access resolves to <code>undefined</code>, causing unhandled <code>TypeError: Cannot read properties of undefined (reading 'audio')</code>."
        ),
        (
            12,
            "Frontend",
            "Non-Existent Property Assignment on HTMLAudioElement for Audio Source",
            "In <code>frontend/discover.js</code> line 39, audio stream URL is assigned via: "
            "<code>audio.source = song.audio</code>. "
            "HTML5 <code>HTMLAudioElement</code> specifies the source attribute on property <code>.src</code>, not <code>.source</code>.",
            "1. Trigger mix playback in <code>discover.html</code>.<br/>"
            "2. Inspect audio element properties in developer tools.",
            "Audio begins playing the selected track audio stream.",
            "Audio source remains empty; <code>audio.play()</code> rejects with <code>NotSupportedError: The element has no supported sources</code>."
        ),
        (
            13,
            "Frontend",
            "Missing Dataset Attribute in Discover Topic Pills HTML Markup",
            "In <code>frontend/discover.js</code> line 20, the event handler reads <code>const selectedGenre = pill.dataset.genre</code>. "
            "In <code>frontend/discover.html</code> lines 66-70, the <code>&lt;span class='topic-pill'&gt;</code> tags lack <code>data-genre</code> attributes.",
            "1. Click on 'Fresh picks', 'Rising', or 'Global' on <code>discover.html</code>.<br/>"
            "2. Inspect the genre value sent to <code>playMix()</code>.",
            "Selected genre name is read from the pill and sent to the catalog API.",
            "<code>selectedGenre</code> evaluates to <code>undefined</code>, passing <code>undefined</code> to <code>playMix()</code>."
        ),
        (
            14,
            "Frontend",
            "Shared Closure Variable Scoping via 'var' in Discover Category Cards Loop",
            "In <code>frontend/discover.js</code> line 63, event listeners are bound using <code>for (var i = 0; i &lt; discoverCards.length; i++)</code>. "
            "Because <code>var</code> is not block-scoped, every click listener references the same shared variable <code>i</code>, which equals <code>6</code> upon loop completion.",
            "1. Open <code>discover.html</code>.<br/>"
            "2. Click Card #0 ('Viral This Week') or Card #1 ('Rising Voices').<br/>"
            "3. Inspect the requested genre from <code>genreMap[i]</code>.",
            "Card 0 requests Pop, Card 1 requests Chill, Card 2 requests Bollywood.",
            "All cards evaluate <code>genreMap[6] || 'Chill'</code>, playing the exact same default genre."
        ),
        (
            15,
            "Frontend",
            "Uncollected Audio Instances Causing Overlapping Streams and Memory Leaks",
            "In <code>frontend/discover.js</code> line 28, every call to <code>playMix()</code> instantiates <code>audio = new Audio()</code> without stopping or unbinding the previous audio object.",
            "1. Open <code>discover.html</code>.<br/>"
            "2. Click multiple topic pills or discovery cards in rapid succession.",
            "Previous audio playback stops immediately before new track begins.",
            "Multiple audio streams play simultaneously on top of each other; orphaned audio objects accumulate in memory."
        ),
        (
            16,
            "Frontend",
            "Literal 'undefined' String Coercion in Songs API Query Parameter",
            "In <code>frontend/discover.js</code> line 31, the fetch request executes: "
            "<code>fetch(`${API_BASE}/api/songs?genre=${encodeURIComponent(genre)}`)</code> when <code>genre</code> is <code>undefined</code>. "
            "JavaScript template literals coerce <code>undefined</code> into literal string <code>'undefined'</code>.",
            "1. Click any topic pill on <code>discover.html</code>.<br/>"
            "2. Inspect browser Network tab for the outgoing request.",
            "Request omits the genre filter or queries all songs: <code>/api/songs</code>.",
            "Request is sent as <code>/api/songs?genre=undefined</code>, matching 0 songs and returning empty catalog array."
        )
    ]

    for b in existing_bugs:
        elements.append(make_bug_card(*b))

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {os.path.abspath(filename)}")

if __name__ == '__main__':
    output_pdf = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Apni_Dhun_Bug_Report.pdf")
    build_pdf(output_pdf)
