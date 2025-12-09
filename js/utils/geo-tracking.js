// GEO TRACKING SYSTEM
// ====================
// Tracks player locations using IP geolocation
// Stores in Supabase alongside leaderboard data

(function() {
    console.log('🌍 Geo Tracking System Loading...');

    // Supabase configuration (same as leaderboard)
    const SUPABASE_CONFIG = {
        url: 'https://bxhcbyypjfzpuxhftppv.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGNieXlwamZ6cHV4aGZ0cHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM4MTIsImV4cCI6MjA3MTQ2OTgxMn0.cOakT3KAfQiegW9YuAoS6pXXeo9u5C-xpriWVqLPpGs',
        tableName: 'player_locations'
    };

    // Chico, CA coordinates (home base)
    const CHICO_COORDS = {
        lat: 39.7285,
        lon: -121.8375
    };

    // Cache for geo stats
    let geoStatsCache = {
        mostRecent: null,
        farthest: null,
        newLocations: [],
        totalVisitors: 0,
        uniqueLocations: 0,
        lastUpdated: null
    };

    // Session tracking to avoid duplicate logs
    let sessionLogged = false;
    const SESSION_KEY = 'ballDefender_geoSession';

    // Calculate distance between two coordinates using Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    // Get user's location from IP
    async function getLocationFromIP() {
        try {
            // Using ip-api.com (free, no API key needed)
            const response = await fetch('http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon');

            if (response.ok) {
                const data = await response.json();

                if (data.status === 'success') {
                    const distance = calculateDistance(
                        data.lat, data.lon,
                        CHICO_COORDS.lat, CHICO_COORDS.lon
                    );

                    return {
                        city: data.city || 'Unknown',
                        region: data.regionName || '',
                        country: data.country || 'Unknown',
                        latitude: data.lat,
                        longitude: data.lon,
                        distance_from_chico: distance
                    };
                }
            }

            console.warn('⚠️ IP geolocation failed, using fallback');
            return null;

        } catch (error) {
            console.error('❌ Error getting location:', error);
            return null;
        }
    }

    // Log visitor location to Supabase
    async function logVisitorLocation(locationData) {
        try {
            // Wait for auth system to be ready
            if (!window.SecureHighScoreAuth) {
                console.warn('⚠️ Auth system not ready for geo tracking');
                return false;
            }

            const token = await window.SecureHighScoreAuth.authenticate();

            const record = {
                city: locationData.city,
                region: locationData.region,
                country: locationData.country,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                distance_from_chico: locationData.distance_from_chico,
                created_at: new Date().toISOString()
            };

            console.log('🌍 Logging visitor location:', record);

            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_CONFIG.anonKey,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(record)
            });

            if (response.ok) {
                console.log('✅ Location logged successfully');
                return true;
            } else {
                const error = await response.text();
                console.error('❌ Failed to log location:', response.status, error);
                return false;
            }

        } catch (error) {
            console.error('❌ Error logging location:', error);
            return false;
        }
    }

    // Load geo stats from Supabase
    async function loadGeoStats() {
        try {
            if (!window.SecureHighScoreAuth) {
                console.warn('⚠️ Auth system not ready');
                return null;
            }

            const token = await window.SecureHighScoreAuth.authenticate();

            // Get all locations, sorted by created_at desc
            const response = await fetch(
                `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}?order=created_at.desc`,
                {
                    headers: {
                        'apikey': SUPABASE_CONFIG.anonKey,
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const locations = await response.json();

                if (locations.length === 0) {
                    console.log('📊 No location data yet');
                    return geoStatsCache;
                }

                // Most recent visitor
                const mostRecent = locations[0];

                // Farthest from Chico
                const farthest = locations.reduce((max, loc) =>
                    (loc.distance_from_chico > (max?.distance_from_chico || 0)) ? loc : max
                , null);

                // Find unique locations (by city + country)
                const uniqueLocationMap = new Map();
                const seenLocations = new Set();

                locations.forEach(loc => {
                    const key = `${loc.city}, ${loc.country}`;
                    if (!uniqueLocationMap.has(key)) {
                        uniqueLocationMap.set(key, loc);
                    }
                });

                // Get new/unique locations (first occurrence of each place)
                // Sort by when they were first seen
                const uniqueLocations = Array.from(uniqueLocationMap.values())
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10); // Last 10 unique locations

                geoStatsCache = {
                    mostRecent: mostRecent,
                    farthest: farthest,
                    newLocations: uniqueLocations,
                    totalVisitors: locations.length,
                    uniqueLocations: uniqueLocationMap.size,
                    lastUpdated: new Date()
                };

                console.log('📊 Geo stats loaded:', {
                    total: geoStatsCache.totalVisitors,
                    unique: geoStatsCache.uniqueLocations,
                    farthest: farthest ? `${farthest.city}, ${farthest.country} (${farthest.distance_from_chico} mi)` : 'N/A'
                });

                return geoStatsCache;

            } else {
                console.error('❌ Failed to load geo stats:', response.status);
                return null;
            }

        } catch (error) {
            console.error('❌ Error loading geo stats:', error);
            return null;
        }
    }

    // Format location for display
    function formatLocation(loc) {
        if (!loc) return 'Unknown';
        if (loc.region && loc.region !== loc.city) {
            return `${loc.city}, ${loc.region}, ${loc.country}`;
        }
        return `${loc.city}, ${loc.country}`;
    }

    // Format time ago
    function formatTimeAgo(dateString) {
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    // Update geo display in UI
    function updateGeoDisplay() {
        const geoContainer = document.getElementById('geoStatsContainer');
        if (!geoContainer) return;

        const stats = geoStatsCache;

        let html = `
            <div class="geo-stats-header">
                <span class="geo-icon">🌍</span> PLAYER LOCATIONS
            </div>
        `;

        // Most Recent
        if (stats.mostRecent) {
            html += `
                <div class="geo-stat-item">
                    <div class="geo-stat-label">Most Recent</div>
                    <div class="geo-stat-value">${formatLocation(stats.mostRecent)}</div>
                    <div class="geo-stat-detail">${formatTimeAgo(stats.mostRecent.created_at)}</div>
                </div>
            `;
        }

        // Farthest from Chico
        if (stats.farthest) {
            html += `
                <div class="geo-stat-item farthest">
                    <div class="geo-stat-label">Farthest from Chico</div>
                    <div class="geo-stat-value">${formatLocation(stats.farthest)}</div>
                    <div class="geo-stat-detail">${stats.farthest.distance_from_chico.toLocaleString()} miles</div>
                </div>
            `;
        }

        // New Locations List
        if (stats.newLocations && stats.newLocations.length > 0) {
            html += `
                <div class="geo-stat-item">
                    <div class="geo-stat-label">Recent Unique Locations</div>
                    <div class="geo-locations-list">
            `;

            stats.newLocations.slice(0, 5).forEach(loc => {
                html += `
                    <div class="geo-location-entry">
                        <span class="geo-location-name">${loc.city}, ${loc.country}</span>
                        <span class="geo-location-distance">${loc.distance_from_chico} mi</span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Summary stats
        html += `
            <div class="geo-summary">
                <span>${stats.totalVisitors} visits</span> ·
                <span>${stats.uniqueLocations} locations</span>
            </div>
        `;

        geoContainer.innerHTML = html;
    }

    // Check if we should log this session
    function shouldLogSession() {
        const lastSession = localStorage.getItem(SESSION_KEY);
        if (!lastSession) return true;

        // Log once per hour per session
        const lastTime = parseInt(lastSession);
        const hourAgo = Date.now() - (60 * 60 * 1000);

        return lastTime < hourAgo;
    }

    // Initialize the geo tracking system
    async function initialize() {
        console.log('🚀 Initializing Geo Tracking System...');

        // Wait for DOM and auth system
        function waitForReady() {
            if (document.readyState !== 'complete' || !window.SecureHighScoreAuth) {
                setTimeout(waitForReady, 500);
                return;
            }

            setTimeout(async () => {
                try {
                    // Load existing stats first
                    await loadGeoStats();
                    updateGeoDisplay();

                    // Log this visitor (if not already logged this session)
                    if (shouldLogSession() && !sessionLogged) {
                        sessionLogged = true;

                        const location = await getLocationFromIP();
                        if (location) {
                            const success = await logVisitorLocation(location);
                            if (success) {
                                localStorage.setItem(SESSION_KEY, Date.now().toString());
                                // Reload stats to include this visitor
                                await loadGeoStats();
                                updateGeoDisplay();
                            }
                        }
                    }

                    console.log('✅ Geo Tracking System Ready!');

                } catch (error) {
                    console.error('❌ Geo tracking initialization error:', error);
                }
            }, 1500);
        }

        waitForReady();
    }

    // Expose public API
    window.GeoTracking = {
        getStats: () => geoStatsCache,
        refresh: async () => {
            await loadGeoStats();
            updateGeoDisplay();
            return geoStatsCache;
        },
        getDistanceFromChico: (lat, lon) => calculateDistance(lat, lon, CHICO_COORDS.lat, CHICO_COORDS.lon),
        formatLocation: formatLocation,
        updateDisplay: updateGeoDisplay
    };

    // Start initialization
    initialize();

    console.log('🌍 Geo Tracking System Loaded');

})();
