const http = require('http');

let cookieJar = '';

function request(path, options = {}) {
  const port = process.env.PORT || 5000;
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${port}${path}`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieJar ? { 'Cookie': cookieJar } : {}),
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      // Capture cookies
      const setCookies = res.headers['set-cookie'];
      if (setCookies) {
        cookieJar = setCookies.map(c => c.split(';')[0]).join('; ');
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND API TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Health Check /api/health');

    // 2. Songs listing
    const songs = await request('/api/songs');
    assert(songs.status === 200 && Array.isArray(songs.data.songs) && songs.data.songs.length > 0, `Get all songs: found ${songs.data.songs?.length} songs`);

    // 3. Songs by genre
    const bolly = await request('/api/songs?genre=Bollywood');
    assert(bolly.status === 200 && bolly.data.songs.every(s => s.genre === 'Bollywood'), 'Filter songs by genre=Bollywood');

    // 4. Songs by search
    const search = await request('/api/songs?search=kesariya');
    assert(search.status === 200 && search.data.songs.some(s => s.title.toLowerCase().includes('kesariya')), 'Search songs by query');

    // 5. Play song logging
    const play = await request('/api/songs/1/play', { method: 'POST' });
    assert(play.status === 200 && play.data.success === true, 'Record song play event');

    // 6. Guest Auth check (should return 200 with user: null)
    const guestMe = await request('/api/auth/me');
    assert(guestMe.status === 200 && guestMe.data.user === null, 'Unauthenticated /api/auth/me returns { user: null }');

    // 7. Register user
    const testEmail = `test_${Date.now()}@example.com`;
    const reg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Ashutosh Tester', email: testEmail, password: 'password123' }
    });
    assert(reg.status === 201 && reg.data.user.name === 'Ashutosh Tester', 'Register new user account');

    // 8. Authenticated Auth check (cookie should be set and recognized)
    const userMe = await request('/api/auth/me');
    assert(userMe.status === 200 && userMe.data.user && userMe.data.user.email === testEmail, 'Authenticated /api/auth/me recognizes session cookie');

    // 9. Add favorite
    const addFav = await request('/api/favorites/4', { method: 'PUT' });
    assert(addFav.status === 200 && addFav.data.favorites.includes(4), 'Add song #4 to favorites');

    // 10. Get favorites
    const getFavs = await request('/api/favorites');
    assert(getFavs.status === 200 && getFavs.data.favorites.includes(4), 'Retrieve favorites list');

    // 11. Remove favorite
    const delFav = await request('/api/favorites/4', { method: 'DELETE' });
    assert(delFav.status === 200 && !delFav.data.favorites.includes(4), 'Remove song #4 from favorites');

    // 12. Create playlist
    const createPl = await request('/api/playlists', {
      method: 'POST',
      body: { name: 'Late Night Chill', description: 'Smooth acoustic and synth tracks' }
    });
    assert(createPl.status === 201 && createPl.data.playlist.name === 'Late Night Chill', 'Create playlist');
    const plId = createPl.data.playlist.id;

    // 13. Update playlist songs
    const updatePl = await request(`/api/playlists/${plId}/songs`, {
      method: 'PUT',
      body: { songIds: [1, 2, 4] }
    });
    assert(updatePl.status === 200 && updatePl.data.playlist.songs.length === 3, 'Update playlist songs to [1, 2, 4]');

    // 14. List playlists
    const listPl = await request('/api/playlists');
    assert(listPl.status === 200 && listPl.data.playlists.some(p => p.id === plId), 'List user playlists');

    // 15. Delete playlist
    const delPl = await request(`/api/playlists/${plId}`, { method: 'DELETE' });
    assert(delPl.status === 200, 'Delete playlist');

    // 16. Radio station now-playing
    const radio = await request('/api/radio/stations/sunset-fm/now-playing');
    assert(radio.status === 200 && radio.data.station.name.includes('Sunset FM') && radio.data.currentSong, 'Radio station now-playing feed');

    // 17. Stats
    const stats = await request('/api/stats');
    assert(stats.status === 200 && stats.data.mostPlayedSong && stats.data.favoriteGenre, 'Platform listening stats');

    // 18. Forgot password
    const forgot = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: testEmail }
    });
    assert(forgot.status === 200 && forgot.data.resetToken, 'Forgot password returns reset token');

    // 19. Reset password
    const reset = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: forgot.data.resetToken, password: 'newpassword123' }
    });
    assert(reset.status === 200, 'Reset password with token');

    // 20. Logout
    const logout = await request('/api/auth/logout', { method: 'POST' });
    assert(logout.status === 200, 'Logout user');

    // 21. Check /api/auth/me after logout
    cookieJar = ''; // Clear client cookie
    const loggedOutMe = await request('/api/auth/me');
    assert(loggedOutMe.status === 200 && loggedOutMe.data.user === null, 'Session properly terminated after logout');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('------------------------------------------------');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
