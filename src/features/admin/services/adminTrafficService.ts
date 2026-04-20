import { supabase } from '../../../supabase/client';

export type TrafficSnapshot = {
  activeNow: number;
  totalSessions: number;
  newUsers: number;
  avgDurationMinutes: number;
  bounceRate: number; // percentage of sessions < 5 seconds
  topSections: { name: string; views: number }[];
  devices: Record<string, number>;
  browsers: Record<string, number>;
  os: Record<string, number>;
  locations: Record<string, number>;
  trafficOverTime: { date: string; sessions: number }[];
};

export const adminTrafficService = {
  getTrafficData: async (days: number = 30): Promise<TrafficSnapshot> => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromString = fromDate.toISOString();

    // 1. Fetch active sessions right now (True Live: active status AND started in the last 15 minutes)
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
    const fifteenMinsString = fifteenMinutesAgo.toISOString();

    const { count: activeNow } = await supabase
      .from('app_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('started_at', fifteenMinsString);

    // 2. Fetch sessions in the timeframe
    const { data: sessions, error } = await supabase
      .from('app_sessions')
      .select('started_at, ended_at, device_type, browser, os, user_id')
      .gte('started_at', fromString)
      .order('started_at', { ascending: true });
      
    if (error) {
      console.error("Error fetching sessions", error);
    }

    // 3. Fetch recent profiles to map regions
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, created_at, region');
      
    let newUsers = 0;
    if (profiles) {
      newUsers = profiles.filter(p => p.created_at && p.created_at >= fromString).length;
    }

    // 4. Fetch behaviour events for top sections
    const { data: behaviorEvents } = await supabase
      .from('behavior_events')
      .select('module_type, screen_name')
      .eq('event_type', 'view')
      .gte('created_at', fromString)
      .limit(10000);

    const snapshot: TrafficSnapshot = {
      activeNow: activeNow || 0,
      totalSessions: sessions?.length || 0,
      newUsers: newUsers || 0,
      avgDurationMinutes: 0,
      bounceRate: 0,
      topSections: [],
      devices: {},
      browsers: {},
      os: {},
      locations: {},
      trafficOverTime: []
    };

    if (!sessions) return snapshot;

    // Process data centrally instead of pure DB group-by to avoid new Postgres RPC
    const trafficMap: Record<string, number> = {};
    let totalDurationMs = 0;
    let sessionsWithDuration = 0;
    let bouncedSessions = 0;

    // Create user -> region map to associate session user locations quickly
    const userRegionMap: Record<string, string> = {};
    if (profiles) {
      profiles.forEach(p => {
        if (p.user_id && p.region) userRegionMap[p.user_id] = p.region;
      });
    }

    sessions.forEach(s => {
      // Devices
      const dev = s.device_type || 'Desconocido';
      snapshot.devices[dev] = (snapshot.devices[dev] || 0) + 1;
      
      // Browsers
      const brow = s.browser || 'Desconocido';
      snapshot.browsers[brow] = (snapshot.browsers[brow] || 0) + 1;

      // OS
      const osName = s.os || 'Desconocido';
      snapshot.os[osName] = (snapshot.os[osName] || 0) + 1;

      // Locations (Region)
      if (s.user_id && userRegionMap[s.user_id]) {
        const r = userRegionMap[s.user_id];
        snapshot.locations[r] = (snapshot.locations[r] || 0) + 1;
      } else {
        snapshot.locations['Desconocido'] = (snapshot.locations['Desconocido'] || 0) + 1;
      }

      // Dates for traffic over time
      if (s.started_at) {
        const dateKey = s.started_at.split('T')[0];
        trafficMap[dateKey] = (trafficMap[dateKey] || 0) + 1;
      }
      
      // Avg Session Duration & Bounce Rate
      if (s.started_at && s.ended_at) {
        const start = new Date(s.started_at).getTime();
        const end = new Date(s.ended_at).getTime();
        if (end > start) {
          const duration = end - start;
          totalDurationMs += duration;
          sessionsWithDuration++;
          
          if (duration < 10000) { // under 10 seconds is considered bounce
            bouncedSessions++;
          }
        }
      }
    });
    
    if (sessionsWithDuration > 0) {
      snapshot.avgDurationMinutes = (totalDurationMs / sessionsWithDuration) / 60000;
      snapshot.bounceRate = (bouncedSessions / sessionsWithDuration) * 100;
    }
    
    // Process sections
    if (behaviorEvents && behaviorEvents.length > 0) {
      const sectionCount: Record<string, number> = {};
      behaviorEvents.forEach(ev => {
        const name = ev.screen_name || ev.module_type || 'Desconocido';
        sectionCount[name] = (sectionCount[name] || 0) + 1;
      });
      
      snapshot.topSections = Object.entries(sectionCount)
        .map(([name, views]) => ({ name, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5); // top 5
    }

    // Fill the missing dates within the range with 0s to make the chart look continuous
    const sortedDates = Object.keys(trafficMap).sort();
    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      const lastDate = new Date(sortedDates[sortedDates.length - 1]);
      
      for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
        const dStr = d.toISOString().split('T')[0];
        snapshot.trafficOverTime.push({
          date: dStr,
          sessions: trafficMap[dStr] || 0
        });
      }
    }

    return snapshot;
  }
};
