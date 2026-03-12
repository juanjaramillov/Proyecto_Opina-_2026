# Canonical Signal Metrics

## Objetivo

Definir las métricas oficiales del sistema para evitar cálculos inconsistentes entre módulos, resultados e inteligencia.

## Métricas base

- total_signals
- weighted_signals
- unique_users_count
- unique_contexts_count
- last_signal_at

## Métricas comparativas

- wins_count
- losses_count
- preference_share
- win_rate

## Métricas evaluativas

- average_score
- numeric_response_count
- boolean_true_count
- boolean_false_count
- nps_score

## Métricas temporales

- daily_signals
- weekly_signals
- monthly_signals
- trend_delta

## Reglas

- weighted_signals debe usar effective_weight.
- total_signals debe contar eventos válidos.
- unique_users_count debe considerar user_id y/o anon_id de forma consistente.
- nps_score debe calcularse solo cuando corresponda a preguntas NPS válidas.
- Resultados e Inteligencia no deben redefinir estas métricas por separado.
