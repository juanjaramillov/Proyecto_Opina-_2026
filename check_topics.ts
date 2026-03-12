import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTopics() {
    const { data: topics, error } = await supabase
        .from('current_topics')
        .select('*');

    if (error) {
        console.error("Error fetching topics:", error);
        return;
    }

    console.log("Total topics:", topics?.length || 0);
    const drafts = topics?.filter(t => t.status === 'draft') || [];
    const published = topics?.filter(t => t.status === 'published') || [];
    
    console.log("Drafts:", drafts.length);
    console.log("Published:", published.length);
}

checkTopics();
