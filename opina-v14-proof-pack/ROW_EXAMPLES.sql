-- Evidencia de fila en signal_events para Versus
SELECT id, session_id, response_time_ms, left_entity_id, right_entity_id, selected_entity_id, event_status
FROM signal_events
WHERE module_type = 'versus'
ORDER BY created_at DESC LIMIT 1;

/*
Ejemplo esperado:
id: "xxxx"
session_id: "71b0..."
response_time_ms: 1250
left_entity_id: "o5c5..."
right_entity_id: "o9f9..."
selected_entity_id: "o5c5..."
event_status: "completed"
*/

-- Evidencia de fila en behavior_events para Module Open
SELECT id, session_id, event_type, metadata
FROM behavior_events
WHERE event_type = 'module_open'
ORDER BY created_at DESC LIMIT 1;

/*
Ejemplo esperado:
id: "yyyy"
session_id: "71b0..."
event_type: "module_open"
metadata: {"module": "versus", "url": "/hub/versus"}
*/

-- Evidencia de fila en app_sessions
SELECT id, user_id, device_type, os, entry_point
FROM app_sessions
ORDER BY started_at DESC LIMIT 1;

/*
Ejemplo esperado:
id: "71b0..."
user_id: "uuid..."
device_type: "desktop"
os: "macOS"
entry_point: "/hub"
*/
