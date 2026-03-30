const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'src', 'read-models', 'analytics', 'metricCatalog.ts');
let content = fs.readFileSync(catalogPath, 'utf8');

// Known wired metrics from B2C
const b2cWiredMetrics = [
  'active_signals_24h', 'freshness_hours', 'community_activity_label', 'quality_perception_label',
  'fastest_riser_entity', 'fastest_faller_entity', 'hot_topic_title', 'fragmentation_label', 'generation_gap_label',
  'leader_entity_name', 'preference_share_leader', 'leader_margin_vs_second', 'most_contested_category', 'dominant_choice_label',
  'current_champion_entity', 'champion_stability_label', 'upset_rate_label', 'most_difficult_path_entity',
  'top_strength_attribute', 'top_pain_attribute', 'nps_leader_entity', 'best_rated_entity', 'worst_rated_entity',
  'hot_topic_heat_index', 'hot_topic_polarization_label', 'topic_with_most_consensus', 'topic_with_most_division', 'fastest_reaction_topic',
  'territory_gap_label'
];

// Known wired metrics from B2B
const b2bWiredMetrics = [
  'preference_share', 'win_rate', 'comparison_volume', 'momentum'
]; // These might be available in IntelligenceBenchmarkEntry implicitly

// Let's replace the properties
content = content.replace(/id:\s*"([^"]+)",([^}]+)defaultSortOrder:\s*(\d+),?/g, (match, id, middle, sortOrder) => {
    let isWiredToUI = false;
    let isWiredToReadModel = false;
    
    if (b2cWiredMetrics.includes(id) || b2bWiredMetrics.includes(id)) {
        isWiredToReadModel = true;
        isWiredToUI = true;
    }

    // Now let's fix the status. If it's not wired, it can't be 'live'
    let updatedMiddle = middle;
    if (!isWiredToReadModel || !isWiredToUI) {
         updatedMiddle = updatedMiddle.replace(/status:\s*"live"/, 'status: "pending_instrumentation"');
    }

    return `id: "${id}",${updatedMiddle}defaultSortOrder: ${sortOrder},\n    isWiredToReadModel: ${isWiredToReadModel},\n    isWiredToUI: ${isWiredToUI},`;
});

fs.writeFileSync(catalogPath, content, 'utf8');
console.log('Catalog updated successfully!');
