SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict nFjM6es09Jfg31ZwVy9fBvplghABt09outRZymidYUX6Q1lvfIByWTc6aZUBqQQ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'authenticated', 'authenticated', 'admin@opina.cl', '$2a$10$at1WsJ05XHzKP0n5h9sm6eVPdMColRwPr.4G3u0k36bUQowoDXPM.', '2026-02-25 00:01:10.653632+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-25 23:55:37.328893+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-02-25 00:01:10.604419+00', '2026-02-26 18:21:40.044612+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '553da265-6f70-4125-b639-197b5c81defc', 'authenticated', 'authenticated', 'juanjaramillov@gmail.com', '$2a$10$Qe99JoS2NhdWeZw6OcX5ZuthGOH/ZY6GgekWVtm6QVDl8Vqgmn.Z2', '2026-02-26 15:19:08.618809+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-26 16:00:56.602605+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "553da265-6f70-4125-b639-197b5c81defc", "email": "juanjaramillov@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-02-26 15:19:08.552755+00', '2026-02-26 18:26:41.396836+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('0df5284d-1bb0-4ff6-a079-1dc55294daf1', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', '{"sub": "0df5284d-1bb0-4ff6-a079-1dc55294daf1", "email": "admin@opina.cl", "email_verified": false, "phone_verified": false}', 'email', '2026-02-25 00:01:10.641958+00', '2026-02-25 00:01:10.642657+00', '2026-02-25 00:01:10.642657+00', 'eb6299f9-8dbd-4bd8-a55a-14e5360a52c8'),
	('553da265-6f70-4125-b639-197b5c81defc', '553da265-6f70-4125-b639-197b5c81defc', '{"sub": "553da265-6f70-4125-b639-197b5c81defc", "email": "juanjaramillov@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-26 15:19:08.61263+00', '2026-02-26 15:19:08.612693+00', '2026-02-26 15:19:08.612693+00', '1235071c-4c71-4851-aac7-9895d9c87d77');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('555f85af-558e-4588-8863-eb3b683229a6', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', '2026-02-25 23:55:37.329886+00', '2026-02-26 18:21:40.062797+00', NULL, 'aal1', NULL, '2026-02-26 18:21:40.062697', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '186.67.234.177', NULL, NULL, NULL, NULL, NULL),
	('ff2849e4-7c05-42d9-8d26-17044dfd0b76', '553da265-6f70-4125-b639-197b5c81defc', '2026-02-26 16:00:56.604334+00', '2026-02-26 18:26:41.399844+00', NULL, 'aal1', NULL, '2026-02-26 18:26:41.399748', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '186.67.234.177', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('555f85af-558e-4588-8863-eb3b683229a6', '2026-02-25 23:55:37.42912+00', '2026-02-25 23:55:37.42912+00', 'password', '90428e7a-214b-4ef1-8132-835c219dc922'),
	('ff2849e4-7c05-42d9-8d26-17044dfd0b76', '2026-02-26 16:00:56.637962+00', '2026-02-26 16:00:56.637962+00', 'password', 'f6d53905-aa3d-41a0-af13-414aa05ceb4d');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 203, 'cyqyv4wpuoo5', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-25 23:55:37.381359+00', '2026-02-26 00:55:07.367412+00', NULL, '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 204, 'g42n7lsag23j', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 00:55:07.404774+00', '2026-02-26 01:53:07.68365+00', 'cyqyv4wpuoo5', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 205, 'g6v6gjgv2dho', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 01:53:07.704515+00', '2026-02-26 02:51:08.320033+00', 'g42n7lsag23j', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 206, 'skwqcfgq6re3', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 02:51:08.346772+00', '2026-02-26 03:49:21.088259+00', 'g6v6gjgv2dho', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 207, 'j4bfiqyjf3h7', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 03:49:21.120499+00', '2026-02-26 04:47:33.423536+00', 'skwqcfgq6re3', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 208, 'iijn6m7zvmfv', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 04:47:33.453072+00', '2026-02-26 05:45:38.486476+00', 'j4bfiqyjf3h7', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 209, 'i2feauzoc33y', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 05:45:38.50525+00', '2026-02-26 06:43:50.828548+00', 'iijn6m7zvmfv', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 210, 'imjucaooua7o', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 06:43:50.858606+00', '2026-02-26 07:42:03.522318+00', 'i2feauzoc33y', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 211, '4e7vphylr4ln', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 07:42:03.554262+00', '2026-02-26 08:40:08.075491+00', 'imjucaooua7o', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 212, 'n2jvhw5qj46n', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 08:40:08.098844+00', '2026-02-26 09:38:20.767068+00', '4e7vphylr4ln', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 213, '6j7nfm5daer7', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 09:38:20.78947+00', '2026-02-26 10:36:35.374535+00', 'n2jvhw5qj46n', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 214, 'srnvtdqnypev', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 10:36:35.397567+00', '2026-02-26 11:34:38.045204+00', '6j7nfm5daer7', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 215, 'kuzyueicndb4', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 11:34:38.071717+00', '2026-02-26 12:32:43.299184+00', 'srnvtdqnypev', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 217, 'iqwoejfcn7jq', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 12:32:43.311214+00', '2026-02-26 13:30:50.73745+00', 'kuzyueicndb4', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 220, 'gycuwb357x4v', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 13:30:50.762754+00', '2026-02-26 14:29:10.811019+00', 'iqwoejfcn7jq', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 221, 'xllnlp4aczmr', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 14:29:10.84276+00', '2026-02-26 15:27:32.786806+00', 'gycuwb357x4v', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 223, 'dzsapsjiub5q', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 15:27:32.80428+00', '2026-02-26 16:25:32.762635+00', 'xllnlp4aczmr', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 224, 'yl3mn4beupeq', '553da265-6f70-4125-b639-197b5c81defc', true, '2026-02-26 16:00:56.623024+00', '2026-02-26 16:59:40.951203+00', NULL, 'ff2849e4-7c05-42d9-8d26-17044dfd0b76'),
	('00000000-0000-0000-0000-000000000000', 225, '7qdbq4h6rrop', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 16:25:32.793083+00', '2026-02-26 17:23:33.424509+00', 'dzsapsjiub5q', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 227, 'mccvxfcf422d', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', true, '2026-02-26 17:23:33.450038+00', '2026-02-26 18:21:40.000356+00', '7qdbq4h6rrop', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 228, 'libo6upg3fz3', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', false, '2026-02-26 18:21:40.024982+00', '2026-02-26 18:21:40.024982+00', 'mccvxfcf422d', '555f85af-558e-4588-8863-eb3b683229a6'),
	('00000000-0000-0000-0000-000000000000', 226, 'cyf6sorprsw3', '553da265-6f70-4125-b639-197b5c81defc', true, '2026-02-26 16:59:40.975044+00', '2026-02-26 18:26:41.377938+00', 'yl3mn4beupeq', 'ff2849e4-7c05-42d9-8d26-17044dfd0b76'),
	('00000000-0000-0000-0000-000000000000', 229, 'ys7psof7a6qw', '553da265-6f70-4125-b639-197b5c81defc', false, '2026-02-26 18:26:41.391439+00', '2026-02-26 18:26:41.391439+00', 'cyf6sorprsw3', 'ff2849e4-7c05-42d9-8d26-17044dfd0b76');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: access_gate_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."access_gate_tokens" ("id", "code_hash", "label", "is_active", "expires_at", "uses_count", "first_used_at", "last_used_at", "created_at") VALUES
	('571eb0ef-bf89-4ce5-8f56-f90b7b53f063', 'c1f4e6c492ac52db95c7baad51b051f5fae9e14921c7cc271ccbb2ae10b53b4a', 'MASTER_ADMIN', true, NULL, 0, NULL, NULL, '2026-02-25 00:59:03.214345+00'),
	('152553d5-5655-41ed-a39e-23ec118a7121', '312705299707ae55206b502a09fb77e226927b1d11a4611b49f31c5f89a17b28', 'MASTER_ADMIN', true, NULL, 0, NULL, NULL, '2026-02-25 01:00:45.270956+00');


--
-- Data for Name: algorithm_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."algorithm_versions" ("id", "version_name", "description", "recency_half_life_days", "verification_multiplier", "trust_multiplier_enabled", "is_active", "created_at") VALUES
	('d7938def-b75c-46b9-9a54-3b3de30db2a6', 'v1.0', 'Initial OpinaScore with weekly decay and 30% verification bonus', 7, 1.3, true, true, '2026-02-22 18:40:47.875091+00');


--
-- Data for Name: anonymous_identities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."anonymous_identities" ("user_id", "anon_id", "created_at", "total_interactions", "total_time_spent_seconds", "total_sessions", "last_active_at") VALUES
	('553da265-6f70-4125-b639-197b5c81defc', '85354f0810544fe5bcbb14ac5bdf4421', '2026-02-26 15:19:14.283348+00', 16, 0, 0, '2026-02-26 16:03:15.655291+00'),
	('0df5284d-1bb0-4ff6-a079-1dc55294daf1', '034754fcd2624ceeaac92710366b4d36', '2026-02-25 01:30:36.790581+00', 4, 0, 0, '2026-02-26 19:17:52.615611+00');


--
-- Data for Name: antifraud_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."subscription_plans" ("id", "plan_name", "monthly_price", "request_limit", "features", "created_at") VALUES
	('6ce3bfd7-020b-46e2-b6bd-d773faa38017', 'free', 0, 1000, '{"depth_access": false, "segment_access": false}', '2026-02-22 18:40:52.275913+00'),
	('4bf193e3-4e32-4962-a06d-7aba25088e3c', 'pro', 199, 20000, '{"depth_access": false, "segment_access": true}', '2026-02-22 18:40:52.275913+00'),
	('25fae727-b658-47c0-b00a-369da82cee56', 'enterprise', 999, 100000, '{"depth_access": true, "segment_access": true}', '2026-02-22 18:40:52.275913+00');


--
-- Data for Name: api_clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."api_clients" ("id", "client_name", "api_key", "request_limit", "requests_used", "active", "created_at", "plan_id", "user_id") VALUES
	('218ecad0-955a-4da4-b3c6-88ec775c8e08', 'Empresa Demo', 'demo_enterprise_key_2026_opina_plus', 50000, 0, true, '2026-02-22 18:40:51.478236+00', '25fae727-b658-47c0-b00a-369da82cee56', NULL);


--
-- Data for Name: api_usage_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: app_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."app_config" ("key", "value", "updated_at") VALUES
	('analytics_mode', 'all', '2026-02-23 23:11:11.340911+00');


--
-- Data for Name: app_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "slug", "name", "emoji", "cover_url", "created_at") VALUES
	('2d23a0a2-9347-44e6-ac7a-c4346962edac', 'consumo', 'Consumo y Retail', NULL, NULL, '2026-02-22 18:40:39.256718+00'),
	('90618c39-b207-472b-a522-7cad40bc31fb', 'tecnologia', 'Tecnología', NULL, NULL, '2026-02-22 18:40:39.256718+00'),
	('23f20b89-0fdb-45a7-9916-062eee5f31e7', 'politica', 'Política', NULL, NULL, '2026-02-22 18:40:39.256718+00'),
	('68627eb6-6863-40d7-a76e-2e46ac278344', 'transporte', 'Transporte', NULL, NULL, '2026-02-22 18:40:39.256718+00'),
	('048a2281-ee0d-452a-80b1-9dee00e3f800', 'entretencion', 'Entretención', NULL, NULL, '2026-02-22 18:40:39.256718+00'),
	('139feb82-e991-4d20-ab86-67df12a836e6', 'estilo_vida', 'Estilo de Vida', NULL, NULL, '2026-02-22 18:40:39.256718+00'),
	('f033db63-df97-4017-9849-4992473aa53b', 'retail', 'Retail y Moda', '🛍️', NULL, '2026-02-22 18:40:39.887682+00'),
	('33d4c637-a470-4068-9a1e-21399217ea4c', 'automotriz', 'Automotriz', '🚗', NULL, '2026-02-22 18:40:39.887682+00'),
	('b08c420d-6e13-46e4-afb6-975fa5d02d4b', 'deportes', 'Deportes', '⚽', NULL, '2026-02-22 18:40:39.887682+00'),
	('80693657-78f4-422a-ba97-ebdc7ef6f253', 'comida', 'Comida y Delivery', '🍔', NULL, '2026-02-22 18:40:39.887682+00'),
	('a0375c2e-ceec-49cf-ac36-b1203756c739', 'streaming', 'Streaming y TV', '📺', NULL, '2026-02-22 18:40:40.212571+00'),
	('ea473a67-c2b6-46ed-90dc-1169cdf80155', 'bebidas', 'Bebidas y Snacks', '🥤', NULL, '2026-02-22 18:40:40.212571+00'),
	('6c041321-dafe-4839-ab66-9e00f75ef6a7', 'vacaciones', 'Viajes y Destinos', '✈️', NULL, '2026-02-22 18:40:40.212571+00'),
	('f54d04b5-deb3-490e-a2c7-d54c6bc1de5c', 'smartphones', 'Smartphones y Tech', '📱', NULL, '2026-02-22 18:40:40.212571+00'),
	('29601fe5-5e76-40b0-befe-d223c33f3255', 'salud', 'Salud y Clínicas', '🏥', NULL, '2026-02-22 18:40:40.212571+00');


--
-- Data for Name: battles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."battles" ("id", "slug", "title", "description", "category_id", "status", "created_at") VALUES
	('668e775a-46a1-450c-b878-855b983a8e15', 'tournament-streaming', '¿Cuál es el mejor servicio de streaming?', 'Encuentra tu plataforma favorita.', 'a0375c2e-ceec-49cf-ac36-b1203756c739', 'active', '2026-02-22 18:40:40.212571+00'),
	('6e9253c3-1d69-416f-9689-d982171c211b', 'tournament-bebidas', '¿Cuál es tu bebida favorita?', 'Duelo refrescante de marcas.', 'ea473a67-c2b6-46ed-90dc-1169cdf80155', 'active', '2026-02-22 18:40:40.212571+00'),
	('72ad1c4b-67ed-40f0-a652-904c913474f3', 'tournament-vacaciones', '¿Cuál es el mejor destino para vacaciones?', 'El viaje de tus sueños empieza aquí.', '6c041321-dafe-4839-ab66-9e00f75ef6a7', 'active', '2026-02-22 18:40:40.212571+00'),
	('ad99e41b-72e4-4dad-b622-e61d799a1785', 'tournament-smartphones', '¿Cuál es la mejor marca de smartphone?', 'Poder, cámara y diseño en tus manos.', 'f54d04b5-deb3-490e-a2c7-d54c6bc1de5c', 'active', '2026-02-22 18:40:40.212571+00'),
	('5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 'tournament-salud', '¿Cuál es la mejor clínica?', 'Calidad y confianza en atención médica.', '29601fe5-5e76-40b0-befe-d223c33f3255', 'active', '2026-02-22 18:40:40.212571+00'),
	('cd9d9c21-9710-49f4-98ce-a21e983c9126', 'apple-vs-samsung-2026', 'Apple vs Samsung', 'El duelo eterno de la tecnología.', 'f54d04b5-deb3-490e-a2c7-d54c6bc1de5c', 'active', '2026-02-22 18:40:40.212571+00'),
	('d71697e3-8573-4358-ba88-1f0a1bc0c8c0', 'coca-vs-pepsi-2026', 'Coca-Cola vs Pepsi', 'El sabor que divide al mundo.', 'ea473a67-c2b6-46ed-90dc-1169cdf80155', 'active', '2026-02-22 18:40:40.212571+00'),
	('316a524d-dede-42d1-849a-b59ae781bcd5', 'falabella-vs-paris', 'Falabella vs Paris', 'Duelo de gigantes del retail. ¿Cuál es tu primera opción?', 'f033db63-df97-4017-9849-4992473aa53b', 'archived', '2026-02-22 18:40:39.887682+00'),
	('235ac56c-cfe5-4946-b436-af8c3cc46164', 'toyota-vs-hyundai', 'Toyota vs Hyundai', 'Confiabilidad japonesa o innovación coreana.', '33d4c637-a470-4068-9a1e-21399217ea4c', 'archived', '2026-02-22 18:40:39.887682+00'),
	('4a8d5bd9-09de-44e6-93d4-c3daf81b7fe0', 'nike-vs-adidas-v2', 'Nike vs Adidas', 'Duelo por el trono del sportswear.', 'b08c420d-6e13-46e4-afb6-975fa5d02d4b', 'archived', '2026-02-22 18:40:39.887682+00'),
	('3970252f-ae46-41b8-a5c9-ac766b4df9dc', 'mcd-vs-bk', 'McDonald''s vs Burger King', '¿Quién tiene la mejor hamburguesa rápida?', '80693657-78f4-422a-ba97-ebdc7ef6f253', 'archived', '2026-02-22 18:40:39.887682+00'),
	('3cf763f7-02a6-4500-bb9a-1bce6c93e1a6', 'santander-vs-bchile-v2', 'Santander vs Banco de Chile', '¿Cuál banco te ofrece el mejor servicio digital?', 'f033db63-df97-4017-9849-4992473aa53b', 'archived', '2026-02-22 18:40:39.887682+00'),
	('9b205e76-e29f-4a53-a355-6dbfe71c6183', 'jumbo-vs-lider', 'Jumbo vs Lider', 'Calidad vs Precios bajos. Tú decides.', 'f033db63-df97-4017-9849-4992473aa53b', 'archived', '2026-02-22 18:40:39.887682+00'),
	('940791cb-a0ee-46ff-8456-41bc46b47510', 'netflix-vs-disney-v2', 'Netflix vs Disney+', '¿Dónde prefieres ver tus maratones?', 'f033db63-df97-4017-9849-4992473aa53b', 'archived', '2026-02-22 18:40:39.887682+00'),
	('19da92ae-6feb-40c0-bf6e-0fbfd108302e', 'mach-vs-tenpo', 'Mach vs Tenpo', 'La revolución de las tarjetas digitales.', 'f033db63-df97-4017-9849-4992473aa53b', 'archived', '2026-02-22 18:40:39.887682+00'),
	('9cac53e1-22f1-437d-9eaf-c4a1bb9b9013', 'audi-vs-bmw', 'Audi vs BMW', 'Símbolos de estatus y potencia alemana.', '33d4c637-a470-4068-9a1e-21399217ea4c', 'archived', '2026-02-22 18:40:39.887682+00'),
	('b0575f71-e860-4d9c-8307-913875026895', 'coca-vs-pepsi-v2', 'Coca-Cola vs Pepsi', 'El sabor que divide al mundo.', 'f033db63-df97-4017-9849-4992473aa53b', 'archived', '2026-02-22 18:40:39.887682+00');


--
-- Data for Name: battle_instances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."battle_instances" ("id", "battle_id", "version", "starts_at", "ends_at", "context", "created_at") VALUES
	('7744e1db-82c6-4f82-8b4e-56f4fb6cd923', '316a524d-dede-42d1-849a-b59ae781bcd5', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('9b364625-5142-40f9-9beb-60ba2b973e7a', '235ac56c-cfe5-4946-b436-af8c3cc46164', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('a6e272d0-f5ba-4c56-a8c3-48126ed3d109', '4a8d5bd9-09de-44e6-93d4-c3daf81b7fe0', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('1487cafd-8659-4215-a39e-9294fcc29f98', '3970252f-ae46-41b8-a5c9-ac766b4df9dc', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('1304bcb3-3501-4dca-8c41-010fc6c3885d', '3cf763f7-02a6-4500-bb9a-1bce6c93e1a6', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('4d4d951f-0f6d-4541-818c-42678ad19fb3', '9b205e76-e29f-4a53-a355-6dbfe71c6183', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('fcd9fee1-29af-47db-8c38-e8be8b37c767', '940791cb-a0ee-46ff-8456-41bc46b47510', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('edc0c1dd-4baa-451a-8dad-c77c42aeeac6', '19da92ae-6feb-40c0-bf6e-0fbfd108302e', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('d6ce07b8-36ab-494d-9136-0d04d07e01e0', '9cac53e1-22f1-437d-9eaf-c4a1bb9b9013', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('bb4edf78-2dcf-465d-8e8a-22a010a9073b', 'b0575f71-e860-4d9c-8307-913875026895', 1, '2026-02-22 18:40:39.887682+00', NULL, '{}', '2026-02-22 18:40:39.887682+00'),
	('05834393-e8b6-42da-a951-3f72c5e83524', '668e775a-46a1-450c-b878-855b983a8e15', 1, '2026-02-22 18:40:40.212571+00', NULL, '{"type": "progressive"}', '2026-02-22 18:40:40.212571+00'),
	('966c160e-6db5-450d-b782-8df647fe4f6b', '6e9253c3-1d69-416f-9689-d982171c211b', 1, '2026-02-22 18:40:40.212571+00', NULL, '{"type": "progressive"}', '2026-02-22 18:40:40.212571+00'),
	('8d8e1030-8f22-4164-8fb9-859fde394512', '72ad1c4b-67ed-40f0-a652-904c913474f3', 1, '2026-02-22 18:40:40.212571+00', NULL, '{"type": "progressive"}', '2026-02-22 18:40:40.212571+00'),
	('5def0a26-8950-4e85-a106-7559cb326f1c', 'ad99e41b-72e4-4dad-b622-e61d799a1785', 1, '2026-02-22 18:40:40.212571+00', NULL, '{"type": "progressive"}', '2026-02-22 18:40:40.212571+00'),
	('92d58711-258f-4c77-b280-40a26419193d', '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 1, '2026-02-22 18:40:40.212571+00', NULL, '{"type": "progressive"}', '2026-02-22 18:40:40.212571+00'),
	('be2ac9ea-f0e9-40d0-ac2d-7374c48040ec', 'cd9d9c21-9710-49f4-98ce-a21e983c9126', 1, '2026-02-22 18:40:40.212571+00', NULL, '{}', '2026-02-22 18:40:40.212571+00'),
	('0991c7f3-c001-4e99-954e-e97d157a6ffa', 'd71697e3-8573-4358-ba88-1f0a1bc0c8c0', 1, '2026-02-22 18:40:40.212571+00', NULL, '{}', '2026-02-22 18:40:40.212571+00');


--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."entities" ("id", "type", "name", "slug", "category", "metadata", "created_at", "image_url") VALUES
	('234f6930-227a-480d-a3fc-86b35983ef08', 'brand', 'Netflix', 'netflix', 'streaming', '{"source_image": "/images/options/netflix.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/netflix.png'),
	('ab709897-53f2-42e6-813e-961525535e59', 'brand', 'Prime Video', 'prime-video', 'streaming', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/primevideo.png'),
	('cf07fcdf-8345-4b44-8c6d-ef0031d54d01', 'brand', 'Disney+', 'disney-plus', 'streaming', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/disneyplus.svg'),
	('ef6f3b95-9499-4912-9773-bb5992b72d96', 'brand', 'Coca-Cola', 'coca-cola', 'bebidas', '{"source_image": "/images/options/cocacola.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/cocacola.png'),
	('ca43d5b2-efa0-4187-99e8-c10521597769', 'brand', 'Pepsi', 'pepsi', 'bebidas', '{"source_image": "/images/options/pepsi.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/pepsi.png'),
	('096ed0fb-9c10-4861-99a8-a1c65c0f64a1', 'brand', 'Paris', 'paris', 'vacaciones', '{"source_image": "/images/options/paris.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/paris.png'),
	('9250ae2a-48d2-41c0-ad78-58d11a8bd346', 'brand', 'Falabella', 'falabella', 'retail', '{"source_image": "/images/options/falabella.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/falabella.png'),
	('97a17f99-ff0a-4730-a86b-43da2cfbb067', 'brand', 'Toyota', 'toyota', 'automotriz', '{"source_image": "/images/options/toyota.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/toyota.png'),
	('b01e0d20-9905-4654-a6ee-6f328da661f5', 'brand', 'Hyundai', 'hyundai', 'automotriz', '{"source_image": "/images/options/hyundai.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/hyundai.png'),
	('9e0ce21d-be31-484e-9029-f010476fb9f1', 'brand', 'Nike', 'nike', 'deportes', '{"source_image": "/images/options/nike.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/nike.png'),
	('c442828f-2db7-4006-94de-0dced7b2ef26', 'brand', 'Adidas', 'adidas', 'deportes', '{"source_image": "/images/options/adidas.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/adidas.png'),
	('5a19b9f9-59d6-44fb-ad2e-24ad0b11a14d', 'brand', 'McDonald''s', 'mcdonald-s', 'comida', '{"source_image": "/images/options/mcdonalds.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/mcdonalds.png'),
	('2c2890a4-4567-4353-88f6-998c3609fc14', 'brand', 'Burger King', 'burger-king', 'comida', '{"source_image": "/images/options/burgerking.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/burgerking.png'),
	('07ba2a47-e69e-4d27-b58d-36ef2fa23b70', 'brand', 'Santander', 'santander', 'retail', '{"source_image": "/images/options/santander.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/santander.png'),
	('c05aabea-af92-4ad2-8faa-d70e6258b6f0', 'brand', 'Banco de Chile', 'banco-de-chile', 'retail', '{"source_image": "/images/options/bancochile.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/bancochile.png'),
	('e0cf3dfe-87fe-4a88-a561-883f0e08b38b', 'brand', 'Jumbo', 'jumbo', 'retail', '{"source_image": "/images/options/jumbo.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/jumbo.png'),
	('51369e97-af1b-437c-95a4-f69af4666828', 'brand', 'Lider', 'lider', 'retail', '{"source_image": "/images/options/lider.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/lider.png'),
	('6284a3be-f114-4bc6-beb0-57bb3342c57d', 'brand', 'Disney+', 'disney-', 'retail', '{"source_image": "/images/options/disneyplus.svg"}', '2026-02-22 18:40:39.887682+00', '/images/options/disneyplus.svg'),
	('582a9aa8-e6ef-4233-94df-585438c53f1a', 'brand', 'Mach', 'mach', 'retail', '{"source_image": "/images/options/mach.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/mach.png'),
	('266e1d1a-8994-4cf7-982e-cea323a9bfeb', 'brand', 'Tenpo', 'tenpo', 'retail', '{"source_image": "/images/options/tenpo.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/tenpo.png'),
	('ee2c2f7d-059e-48dc-bbfe-948ce2c0c44d', 'brand', 'Audi', 'audi', 'automotriz', '{"source_image": "/images/options/audi.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/audi.png'),
	('3b4cba7b-b870-422b-81b9-b07ef719923a', 'brand', 'BMW', 'bmw', 'automotriz', '{"source_image": "/images/options/bmw.png"}', '2026-02-22 18:40:39.887682+00', '/images/options/bmw.png'),
	('c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', 'brand', 'Max', 'max', 'streaming', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/hbomax.png'),
	('f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', 'brand', 'Apple TV+', 'apple-tv-plus', 'streaming', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/appletv.png'),
	('3c569256-7292-420f-a5e9-76140299e91c', 'brand', 'Paramount+', 'paramount-plus', 'streaming', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/paramount.png'),
	('def65be0-c360-4098-81a1-228bd5625806', 'brand', 'Red Bull', 'red-bull', 'bebidas', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/redbull.png'),
	('db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', 'brand', 'Monster Energy', 'monster-energy', 'bebidas', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/monster.png'),
	('9ba1aa20-b853-4901-9f67-ab851efc74d4', 'brand', 'Fanta', 'fanta', 'bebidas', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/fanta.png'),
	('0a576f60-c48e-4053-9430-c94768a42dd6', 'brand', 'Sprite', 'sprite', 'bebidas', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/sprite.png'),
	('10f1529e-b4d4-4704-8cd9-0b80742300dc', 'city', 'Nueva York', 'nueva-york', 'vacaciones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/nuevayork.png'),
	('3130e635-0ae4-46f4-8b4a-67128cb0c5bd', 'city', 'Tokio', 'tokio', 'vacaciones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/tokio.png'),
	('e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', 'city', 'Río de Janeiro', 'rio-de-janeiro', 'vacaciones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/riodejaneiro.png'),
	('fdec83d2-7500-4d84-8387-6c861108a21a', 'city', 'Roma', 'roma', 'vacaciones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/roma.png'),
	('37c737f2-b310-45cc-aff9-796a8da8ea75', 'city', 'Barcelona', 'barcelona', 'vacaciones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/barcelona.png'),
	('6a2ea986-a7ae-44ac-a4e4-c30e51b77220', 'brand', 'Apple (iPhone)', 'apple-iphone', 'smartphones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/iphone.png'),
	('aa862f92-ed9e-473b-b9c8-b52f50bd17f2', 'brand', 'Samsung', 'samsung', 'smartphones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/samsung.png'),
	('b3ec2c07-22b1-4584-8f04-855e125e1370', 'brand', 'Xiaomi', 'xiaomi', 'smartphones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/xiaomi.png'),
	('94c52d16-fa46-44b3-99a2-8c7a9daaac63', 'brand', 'Huawei', 'huawei', 'smartphones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/huawei.png'),
	('b770fa66-ccfa-44d5-b201-9dccd2707493', 'brand', 'Google (Pixel)', 'google-pixel', 'smartphones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/pixel.png'),
	('6eccfcd0-04de-489b-b08e-1adcbf643909', 'brand', 'Motorola', 'motorola', 'smartphones', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/motorola.png'),
	('7834d31e-555c-4357-9049-259839f81d7b', 'brand', 'Clínica Alemana', 'clinica-alemana', 'salud', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/clinicaalemana.png'),
	('850c76eb-89e9-4fca-b719-2e9c29afaa51', 'brand', 'Clínica Las Condes', 'clinica-las-condes', 'salud', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/clc.png'),
	('ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', 'brand', 'Clínica Santa María', 'clinica-santa-maria', 'salud', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/clinicasantamaria.png'),
	('9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', 'brand', 'Clínica Dávila', 'clinica-davila', 'salud', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/clinicadavila.png'),
	('b3739e12-cb57-4bb2-a31e-fef9b9b1143c', 'brand', 'RedSalud', 'redsalud', 'salud', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/redsalud.png'),
	('daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', 'brand', 'IntegraMédica', 'integramedica', 'salud', '{"source": "seed"}', '2026-02-22 18:40:40.212571+00', '/images/options/integramedica.png');


--
-- Data for Name: battle_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."battle_options" ("id", "battle_id", "label", "brand_id", "image_url", "sort_order", "created_at") VALUES
	('7856a8a0-f410-4a89-b67b-dc970b86ad11', '316a524d-dede-42d1-849a-b59ae781bcd5', 'Falabella', '9250ae2a-48d2-41c0-ad78-58d11a8bd346', '/images/options/falabella.png', 1, '2026-02-22 18:40:39.887682+00'),
	('5f9e976e-8427-422c-bfba-207046e3f2ef', '316a524d-dede-42d1-849a-b59ae781bcd5', 'Paris', '096ed0fb-9c10-4861-99a8-a1c65c0f64a1', '/images/options/paris.png', 2, '2026-02-22 18:40:39.887682+00'),
	('d5d2c9de-5be2-41b8-9a8f-3bde338d20a2', '235ac56c-cfe5-4946-b436-af8c3cc46164', 'Toyota', '97a17f99-ff0a-4730-a86b-43da2cfbb067', '/images/options/toyota.png', 1, '2026-02-22 18:40:39.887682+00'),
	('59668156-12bc-4990-8fbe-73fbe02c4e07', '235ac56c-cfe5-4946-b436-af8c3cc46164', 'Hyundai', 'b01e0d20-9905-4654-a6ee-6f328da661f5', '/images/options/hyundai.png', 2, '2026-02-22 18:40:39.887682+00'),
	('91935787-8b47-4287-ad7a-f06fd7923393', '4a8d5bd9-09de-44e6-93d4-c3daf81b7fe0', 'Nike', '9e0ce21d-be31-484e-9029-f010476fb9f1', '/images/options/nike.png', 1, '2026-02-22 18:40:39.887682+00'),
	('ab8f348f-e98f-46b4-9ab5-9fb5c9948d89', '4a8d5bd9-09de-44e6-93d4-c3daf81b7fe0', 'Adidas', 'c442828f-2db7-4006-94de-0dced7b2ef26', '/images/options/adidas.png', 2, '2026-02-22 18:40:39.887682+00'),
	('da40727f-498f-4bb0-a1e0-b54cb97c2843', '3970252f-ae46-41b8-a5c9-ac766b4df9dc', 'McDonald''s', '5a19b9f9-59d6-44fb-ad2e-24ad0b11a14d', '/images/options/mcdonalds.png', 1, '2026-02-22 18:40:39.887682+00'),
	('40f5c00e-2f0b-4f13-be89-0bfb260e7d44', '3970252f-ae46-41b8-a5c9-ac766b4df9dc', 'Burger King', '2c2890a4-4567-4353-88f6-998c3609fc14', '/images/options/burgerking.png', 2, '2026-02-22 18:40:39.887682+00'),
	('5696151f-0bdc-4936-ae3e-af99947a2399', '3cf763f7-02a6-4500-bb9a-1bce6c93e1a6', 'Santander', '07ba2a47-e69e-4d27-b58d-36ef2fa23b70', '/images/options/santander.png', 1, '2026-02-22 18:40:39.887682+00'),
	('206a853a-6d5f-4312-8ede-2ba32b7c3fec', '3cf763f7-02a6-4500-bb9a-1bce6c93e1a6', 'Banco de Chile', 'c05aabea-af92-4ad2-8faa-d70e6258b6f0', '/images/options/bancochile.png', 2, '2026-02-22 18:40:39.887682+00'),
	('d3a17a6f-3d92-429e-a080-5201eff7d01d', '9b205e76-e29f-4a53-a355-6dbfe71c6183', 'Jumbo', 'e0cf3dfe-87fe-4a88-a561-883f0e08b38b', '/images/options/jumbo.png', 1, '2026-02-22 18:40:39.887682+00'),
	('edcb7fe7-3602-4d13-a85f-6f23cdabc414', '9b205e76-e29f-4a53-a355-6dbfe71c6183', 'Lider', '51369e97-af1b-437c-95a4-f69af4666828', '/images/options/lider.png', 2, '2026-02-22 18:40:39.887682+00'),
	('32ccf5d9-8747-4e56-a7e2-a3fd31adb57a', '940791cb-a0ee-46ff-8456-41bc46b47510', 'Netflix', '234f6930-227a-480d-a3fc-86b35983ef08', '/images/options/netflix.png', 1, '2026-02-22 18:40:39.887682+00'),
	('4f1e2dd1-f7c9-45a3-8057-9d76cd71ae0d', '940791cb-a0ee-46ff-8456-41bc46b47510', 'Disney+', '6284a3be-f114-4bc6-beb0-57bb3342c57d', '/images/options/disneyplus.svg', 2, '2026-02-22 18:40:39.887682+00'),
	('2be6474d-98d6-41cc-90c6-98acb6ed67ed', '19da92ae-6feb-40c0-bf6e-0fbfd108302e', 'Mach', '582a9aa8-e6ef-4233-94df-585438c53f1a', '/images/options/mach.png', 1, '2026-02-22 18:40:39.887682+00'),
	('bf1f129a-6dae-4eac-ba29-4d0f402c3390', '19da92ae-6feb-40c0-bf6e-0fbfd108302e', 'Tenpo', '266e1d1a-8994-4cf7-982e-cea323a9bfeb', '/images/options/tenpo.png', 2, '2026-02-22 18:40:39.887682+00'),
	('de83b0db-0922-45a0-820e-a46a65b3b908', '9cac53e1-22f1-437d-9eaf-c4a1bb9b9013', 'Audi', 'ee2c2f7d-059e-48dc-bbfe-948ce2c0c44d', '/images/options/audi.png', 1, '2026-02-22 18:40:39.887682+00'),
	('b425fd59-98da-4992-9ee5-a187af170155', '9cac53e1-22f1-437d-9eaf-c4a1bb9b9013', 'BMW', '3b4cba7b-b870-422b-81b9-b07ef719923a', '/images/options/bmw.png', 2, '2026-02-22 18:40:39.887682+00'),
	('84e0df49-73dc-464c-abfd-25e9f4888ed3', 'b0575f71-e860-4d9c-8307-913875026895', 'Coca-Cola', 'ef6f3b95-9499-4912-9773-bb5992b72d96', '/images/options/cocacola.png', 1, '2026-02-22 18:40:39.887682+00'),
	('14f717ae-55cf-427d-b6d2-7173a6d61c12', 'b0575f71-e860-4d9c-8307-913875026895', 'Pepsi', 'ca43d5b2-efa0-4187-99e8-c10521597769', '/images/options/pepsi.png', 2, '2026-02-22 18:40:39.887682+00'),
	('983787a8-9ad8-4aea-944a-1b05d2065eff', '668e775a-46a1-450c-b878-855b983a8e15', 'Prime Video', 'ab709897-53f2-42e6-813e-961525535e59', '/images/options/primevideo.png', 1, '2026-02-22 18:40:40.212571+00'),
	('1153f309-cb8c-47f3-97f8-d8dbb7b303b7', '668e775a-46a1-450c-b878-855b983a8e15', 'Disney+', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', '/images/options/disneyplus.svg', 2, '2026-02-22 18:40:40.212571+00'),
	('5564914f-927a-434a-93df-c80628040692', '668e775a-46a1-450c-b878-855b983a8e15', 'Max', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', '/images/options/hbomax.png', 3, '2026-02-22 18:40:40.212571+00'),
	('bf87b6bf-fd52-4b3b-b0ab-13f385c67b0f', '668e775a-46a1-450c-b878-855b983a8e15', 'Apple TV+', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', '/images/options/appletv.png', 4, '2026-02-22 18:40:40.212571+00'),
	('ff8a61ee-186b-4370-8c7f-f854e590bbd8', '668e775a-46a1-450c-b878-855b983a8e15', 'Paramount+', '3c569256-7292-420f-a5e9-76140299e91c', '/images/options/paramount.png', 5, '2026-02-22 18:40:40.212571+00'),
	('86008ffa-de02-44ec-8785-f487a7a881e0', '6e9253c3-1d69-416f-9689-d982171c211b', 'Red Bull', 'def65be0-c360-4098-81a1-228bd5625806', '/images/options/redbull.png', 1, '2026-02-22 18:40:40.212571+00'),
	('c0509839-d568-4b1f-9dff-d67f4e64ddbf', '6e9253c3-1d69-416f-9689-d982171c211b', 'Monster Energy', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', '/images/options/monster.png', 2, '2026-02-22 18:40:40.212571+00'),
	('97703245-fbd3-4b7c-9b4e-89c7118605f4', '6e9253c3-1d69-416f-9689-d982171c211b', 'Fanta', '9ba1aa20-b853-4901-9f67-ab851efc74d4', '/images/options/fanta.png', 3, '2026-02-22 18:40:40.212571+00'),
	('e1d9f340-0789-4a87-810c-ea9724f6cf98', '6e9253c3-1d69-416f-9689-d982171c211b', 'Sprite', '0a576f60-c48e-4053-9430-c94768a42dd6', '/images/options/sprite.png', 4, '2026-02-22 18:40:40.212571+00'),
	('864366e1-9225-489d-8e13-e26b8dd22047', '72ad1c4b-67ed-40f0-a652-904c913474f3', 'Nueva York', '10f1529e-b4d4-4704-8cd9-0b80742300dc', '/images/options/nuevayork.png', 1, '2026-02-22 18:40:40.212571+00'),
	('be038bad-147f-48f3-bc7b-c7d4864ae981', '72ad1c4b-67ed-40f0-a652-904c913474f3', 'Tokio', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', '/images/options/tokio.png', 2, '2026-02-22 18:40:40.212571+00'),
	('3175d440-ce33-4fb3-b9d1-60582ba7da9f', '72ad1c4b-67ed-40f0-a652-904c913474f3', 'Río de Janeiro', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', '/images/options/riodejaneiro.png', 3, '2026-02-22 18:40:40.212571+00'),
	('d10fb265-f571-4cb0-986c-f969d80d4399', '72ad1c4b-67ed-40f0-a652-904c913474f3', 'Roma', 'fdec83d2-7500-4d84-8387-6c861108a21a', '/images/options/roma.png', 4, '2026-02-22 18:40:40.212571+00'),
	('c1dd7004-ccce-43bd-b9e6-6380f51440cd', '72ad1c4b-67ed-40f0-a652-904c913474f3', 'Barcelona', '37c737f2-b310-45cc-aff9-796a8da8ea75', '/images/options/barcelona.png', 5, '2026-02-22 18:40:40.212571+00'),
	('4525b188-7261-47ef-96c5-3e57ac561af0', 'ad99e41b-72e4-4dad-b622-e61d799a1785', 'Apple (iPhone)', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', '/images/options/iphone.png', 1, '2026-02-22 18:40:40.212571+00'),
	('31b709ce-b0a9-4935-ad92-fb05ffd6739a', 'ad99e41b-72e4-4dad-b622-e61d799a1785', 'Samsung', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', '/images/options/samsung.png', 2, '2026-02-22 18:40:40.212571+00'),
	('68edc29f-b1c2-42c5-94df-120e22b692d0', 'ad99e41b-72e4-4dad-b622-e61d799a1785', 'Xiaomi', 'b3ec2c07-22b1-4584-8f04-855e125e1370', '/images/options/xiaomi.png', 3, '2026-02-22 18:40:40.212571+00'),
	('e87fe346-786d-4595-8741-e4d213a6f297', 'ad99e41b-72e4-4dad-b622-e61d799a1785', 'Huawei', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', '/images/options/huawei.png', 4, '2026-02-22 18:40:40.212571+00'),
	('18edf04b-7082-47e1-b3d3-34fbcc4b2d8a', 'ad99e41b-72e4-4dad-b622-e61d799a1785', 'Google (Pixel)', 'b770fa66-ccfa-44d5-b201-9dccd2707493', '/images/options/pixel.png', 5, '2026-02-22 18:40:40.212571+00'),
	('c133d9d6-85fb-4f9d-b8a6-ff00f0b2409f', 'ad99e41b-72e4-4dad-b622-e61d799a1785', 'Motorola', '6eccfcd0-04de-489b-b08e-1adcbf643909', '/images/options/motorola.png', 6, '2026-02-22 18:40:40.212571+00'),
	('ce7465d2-ad8d-4787-b9ad-c42eb5aa5c63', '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 'Clínica Alemana', '7834d31e-555c-4357-9049-259839f81d7b', '/images/options/clinicaalemana.png', 1, '2026-02-22 18:40:40.212571+00'),
	('9a0b1f66-aa24-4037-a99b-470af20f4524', '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 'Clínica Las Condes', '850c76eb-89e9-4fca-b719-2e9c29afaa51', '/images/options/clc.png', 2, '2026-02-22 18:40:40.212571+00'),
	('181b8889-5954-4431-9a45-ab8e378b649b', '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 'Clínica Santa María', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', '/images/options/clinicasantamaria.png', 3, '2026-02-22 18:40:40.212571+00'),
	('26884542-17bf-4db4-9e67-3cac562d8e25', '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 'Clínica Dávila', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', '/images/options/clinicadavila.png', 4, '2026-02-22 18:40:40.212571+00'),
	('95f4aed1-63c4-4289-acf8-9dad84378996', '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 'RedSalud', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', '/images/options/redsalud.png', 5, '2026-02-22 18:40:40.212571+00'),
	('4d8ff668-fba4-4a9e-809f-1c718ce9cb52', '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', 'IntegraMédica', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', '/images/options/integramedica.png', 6, '2026-02-22 18:40:40.212571+00'),
	('557841de-1d2b-46f1-8515-03328981cf4b', 'cd9d9c21-9710-49f4-98ce-a21e983c9126', 'Apple (iPhone)', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', '/images/options/iphone.png', 1, '2026-02-22 18:40:40.212571+00'),
	('b09cc87b-8f21-4cae-9394-7d077916cfa8', 'cd9d9c21-9710-49f4-98ce-a21e983c9126', 'Samsung', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', '/images/options/samsung.png', 2, '2026-02-22 18:40:40.212571+00'),
	('5fd0f567-2aa9-43e6-978e-12300b5d9b6d', 'd71697e3-8573-4358-ba88-1f0a1bc0c8c0', 'Coca-Cola', 'ef6f3b95-9499-4912-9773-bb5992b72d96', '/images/options/cocacola.png', 1, '2026-02-22 18:40:40.212571+00'),
	('9b81c0bc-b1a2-4113-852b-f95a3ca8ff98', 'd71697e3-8573-4358-ba88-1f0a1bc0c8c0', 'Pepsi', 'ca43d5b2-efa0-4187-99e8-c10521597769', '/images/options/pepsi.png', 2, '2026-02-22 18:40:40.212571+00');


--
-- Data for Name: category_daily_aggregates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."category_daily_aggregates" ("day", "category_slug", "gender", "age_bucket", "region", "signals_count", "unique_users", "weight_sum", "opinascore_sum", "last_refreshed_at", "id") VALUES
	('2026-02-23', 'streaming', 'male', NULL, 'Metropolitana', 15, 4, 25.50, 20.4000000000000000000000000000, '2026-02-23 13:23:15.578048+00', '9d839f9d-c942-48dd-84db-7b21a43f1638'),
	('2026-02-23', 'salud', 'male', NULL, 'Metropolitana', 8, 4, 13.60, 11.0500000000000000000000000000, '2026-02-23 13:23:15.578048+00', '94eda6df-fd68-4f78-9d02-d4d5b2886681'),
	('2026-02-23', 'smartphones', 'male', NULL, 'Metropolitana', 17, 4, 28.90, 23.8000000000000000000000000000, '2026-02-23 13:23:15.578048+00', 'd39d1aac-6db0-404e-9771-4f26be6a0336'),
	('2026-02-23', 'bebidas', 'male', NULL, 'Metropolitana', 17, 7, 28.90, 22.9500000000000000000000000000, '2026-02-23 13:23:15.578048+00', '8bdf0205-3ca2-41bc-8e46-fe1713937604'),
	('2026-02-23', 'vacaciones', 'male', NULL, 'Metropolitana', 9, 4, 15.30, 12.7500000000000000000000000000, '2026-02-23 13:23:15.578048+00', 'a3ce2f8c-0b4a-4dc3-ac98-9eb727b83933');


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "name", "slug", "settings", "created_at", "updated_at") VALUES
	('65d4e118-06c6-4a0d-8983-3a0c6146590c', 'Opina+ B2B Demo', 'opina-demo', '{}', '2026-02-22 18:40:45.033707+00', '2026-02-22 18:40:45.033707+00');


--
-- Data for Name: depth_aggregates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: depth_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."depth_definitions" ("id", "entity_id", "category_slug", "question_key", "question_text", "question_type", "options", "position", "is_required", "created_at") VALUES
	('d6baef95-45e3-44e5-86fd-29009d6b0fef', 'ab709897-53f2-42e6-813e-961525535e59', NULL, 'nota_general', '¿Qué nota le das a Prime Video del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('7292ba7a-8d2c-43c8-8dcd-b1b04e81b8a7', 'ab709897-53f2-42e6-813e-961525535e59', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Prime Video?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('26633d55-78c1-4017-a58d-b54eae885a78', 'ab709897-53f2-42e6-813e-961525535e59', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Prime Video del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('4fc4414f-5693-43bc-b352-d7db2e6edeae', 'ab709897-53f2-42e6-813e-961525535e59', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Prime Video? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('75320300-1120-4f97-9ede-c1d7c8ac1c85', 'ab709897-53f2-42e6-813e-961525535e59', NULL, 'atributo', '¿Qué es lo que más valoras de Prime Video?', 'choice', '["Contenido original", "Precio", "Interfaz", "Catálogo variado"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('477ffcc6-6469-47be-ab3d-d77dddd048e1', 'ab709897-53f2-42e6-813e-961525535e59', NULL, 'innovacion', '¿Qué tan innovador consideras que es Prime Video? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('982fbb5b-ce43-4bd7-95ca-4a900f1164e0', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', NULL, 'nota_general', '¿Qué nota le das a Disney+ del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('867d64b7-aafa-49b1-9384-40f5a07dc87a', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Disney+?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('c90139a3-649d-4ae4-9066-ee598ef2cf46', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Disney+ del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('f96a60a5-d7c0-4961-80c5-5496b9451730', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Disney+? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('07f4f0ca-641b-4692-b6c5-dce805f4c1de', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', NULL, 'atributo', '¿Qué es lo que más valoras de Disney+?', 'choice', '["Contenido original", "Precio", "Interfaz", "Catálogo variado"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('ea1518ce-858d-49df-be4c-6b010b44a71e', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', NULL, 'innovacion', '¿Qué tan innovador consideras que es Disney+? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('ff94a587-7476-47de-b30c-3cf58d6b574c', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', NULL, 'nota_general', '¿Qué nota le das a Max del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('811f6ed3-21ba-4eee-88f9-e3e5afafd125', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Max?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('b5087828-2057-412d-ab73-4da9f86e18b2', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Max del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('150bb9d2-a04e-47a3-9ba9-9eb96ca13c66', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Max? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('86202a75-9a11-4241-a798-e3a6c74554ba', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', NULL, 'atributo', '¿Qué es lo que más valoras de Max?', 'choice', '["Contenido original", "Precio", "Interfaz", "Catálogo variado"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('e2ca61ce-fd5a-422b-9c01-4c35b0d086ea', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', NULL, 'innovacion', '¿Qué tan innovador consideras que es Max? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('ea1b238e-4013-41ea-b365-86d840bf844e', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', NULL, 'nota_general', '¿Qué nota le das a Apple TV+ del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('ee9bc885-4b35-4de7-9ea7-91437346de01', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Apple TV+?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('d473b091-255f-4ab4-88b0-ebd533bae83c', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Apple TV+ del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('3473e2ae-a954-4a34-b6a2-0165d37130ce', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Apple TV+? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('77eb8699-ea39-4804-a807-a4ad7578bc62', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', NULL, 'atributo', '¿Qué es lo que más valoras de Apple TV+?', 'choice', '["Contenido original", "Precio", "Interfaz", "Catálogo variado"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('f49b4c4e-40d3-4f29-a1cc-5101397761f6', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', NULL, 'innovacion', '¿Qué tan innovador consideras que es Apple TV+? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('824d860b-5b98-4925-8131-481bf6879ea9', '3c569256-7292-420f-a5e9-76140299e91c', NULL, 'nota_general', '¿Qué nota le das a Paramount+ del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('15519374-1e20-4b92-9e20-8998e684a5ad', '3c569256-7292-420f-a5e9-76140299e91c', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Paramount+?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('fd0580c6-c0fb-4cb6-a63d-4ea8bca3f8ea', '3c569256-7292-420f-a5e9-76140299e91c', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Paramount+ del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('cc7addfc-ab82-41f5-8e3b-3706b54a7219', '3c569256-7292-420f-a5e9-76140299e91c', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Paramount+? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('66d3975c-6ceb-4f1f-83d8-7dc874dbf8b1', '3c569256-7292-420f-a5e9-76140299e91c', NULL, 'atributo', '¿Qué es lo que más valoras de Paramount+?', 'choice', '["Contenido original", "Precio", "Interfaz", "Catálogo variado"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('45621247-0c04-41a4-a8e6-6a41b659a6ec', '3c569256-7292-420f-a5e9-76140299e91c', NULL, 'innovacion', '¿Qué tan innovador consideras que es Paramount+? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('989042d6-0218-480f-8a3a-fde17753bf1b', 'def65be0-c360-4098-81a1-228bd5625806', NULL, 'nota_general', '¿Qué nota le das a Red Bull del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('278801d7-9938-4e78-923d-59b049e717b6', 'def65be0-c360-4098-81a1-228bd5625806', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Red Bull?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('8f4a9e33-d2c4-420c-ba21-61697a909d32', 'def65be0-c360-4098-81a1-228bd5625806', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Red Bull del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('6ed70c8f-f71f-497e-9e57-769e35b71725', 'def65be0-c360-4098-81a1-228bd5625806', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Red Bull? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('d59166c3-644b-4e67-9d92-1f067ebf379e', 'def65be0-c360-4098-81a1-228bd5625806', NULL, 'atributo', '¿Qué es lo que más valoras de Red Bull?', 'choice', '["Sabor", "Precio", "Disponibilidad", "Imagen de marca"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('1a638f02-b602-499c-afc9-daf5872ffe6c', 'def65be0-c360-4098-81a1-228bd5625806', NULL, 'innovacion', '¿Qué tan innovador consideras que es Red Bull? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('ae9e8fac-8a28-4917-b010-419ef7098b10', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', NULL, 'nota_general', '¿Qué nota le das a Monster Energy del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('c0c3e537-41a1-422b-99fb-3a1bb34228c8', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Monster Energy?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('f4fdc419-5c9b-4413-8df0-9e37f3b4fbdd', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Monster Energy del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('514f7837-b2d9-41ab-bcce-e5fa21b04de2', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Monster Energy? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('0b7cc923-4561-4a9c-be94-e72b91aa5675', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', NULL, 'atributo', '¿Qué es lo que más valoras de Monster Energy?', 'choice', '["Sabor", "Precio", "Disponibilidad", "Imagen de marca"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('d4c40a4f-e47b-46c2-9e34-e069a9cacc3a', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', NULL, 'innovacion', '¿Qué tan innovador consideras que es Monster Energy? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('19b645e4-ffa4-47f9-b0d6-39f5b4955d51', '9ba1aa20-b853-4901-9f67-ab851efc74d4', NULL, 'nota_general', '¿Qué nota le das a Fanta del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('f68e7f15-6425-4433-bfea-af7bed8e02bb', '9ba1aa20-b853-4901-9f67-ab851efc74d4', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Fanta?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('3898e175-5ecb-4521-911d-b86e191a403e', '9ba1aa20-b853-4901-9f67-ab851efc74d4', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Fanta del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('80c622c8-3b2a-4364-8033-d27a4b940ed2', '9ba1aa20-b853-4901-9f67-ab851efc74d4', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Fanta? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('684305d6-2c2a-4e01-9062-4956f24876f3', '9ba1aa20-b853-4901-9f67-ab851efc74d4', NULL, 'atributo', '¿Qué es lo que más valoras de Fanta?', 'choice', '["Sabor", "Precio", "Disponibilidad", "Imagen de marca"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('c50c1e06-baff-4a58-b72d-34b14c16c049', '9ba1aa20-b853-4901-9f67-ab851efc74d4', NULL, 'innovacion', '¿Qué tan innovador consideras que es Fanta? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('136b6520-c594-4c02-9070-37d53f7c61d1', '0a576f60-c48e-4053-9430-c94768a42dd6', NULL, 'nota_general', '¿Qué nota le das a Sprite del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('95231252-21d6-4594-973e-b384dac3d1de', '0a576f60-c48e-4053-9430-c94768a42dd6', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Sprite?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('4265651a-3dcb-4ccc-be9d-ee81163b4d08', '0a576f60-c48e-4053-9430-c94768a42dd6', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Sprite del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('65a236fe-a760-41e6-b453-09fb6a6bbe91', '0a576f60-c48e-4053-9430-c94768a42dd6', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Sprite? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('5af54347-f293-4605-8f52-6b4c8a215295', '0a576f60-c48e-4053-9430-c94768a42dd6', NULL, 'atributo', '¿Qué es lo que más valoras de Sprite?', 'choice', '["Sabor", "Precio", "Disponibilidad", "Imagen de marca"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('c26803ec-3288-4381-bd6f-3c8e014ddeeb', '0a576f60-c48e-4053-9430-c94768a42dd6', NULL, 'innovacion', '¿Qué tan innovador consideras que es Sprite? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('a18563aa-1a3f-4463-b8b4-ef43094c0358', '10f1529e-b4d4-4704-8cd9-0b80742300dc', NULL, 'nota_general', '¿Qué nota le das a Nueva York del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('e404ab96-fc10-4f4d-a584-978b25b3483e', '10f1529e-b4d4-4704-8cd9-0b80742300dc', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Nueva York?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('64dfee24-91d1-4ee5-a419-d2540528bd59', '10f1529e-b4d4-4704-8cd9-0b80742300dc', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Nueva York del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('5c046342-bf70-4cce-87c6-efc20236f872', '10f1529e-b4d4-4704-8cd9-0b80742300dc', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Nueva York? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('e107e1ed-5beb-4767-9715-e54f75cb1e0e', '10f1529e-b4d4-4704-8cd9-0b80742300dc', NULL, 'atributo', '¿Qué es lo que más valoras de Nueva York?', 'choice', '["Atractivos turísticos", "Seguridad", "Cultura", "Gastronomía"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('cccce317-e1f6-4fa3-83a5-5afccdf3f369', '10f1529e-b4d4-4704-8cd9-0b80742300dc', NULL, 'innovacion', '¿Qué tan innovador consideras que es Nueva York? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('bcfa21ab-da45-4d46-85b6-76585a4f3d0b', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', NULL, 'nota_general', '¿Qué nota le das a Tokio del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('6ae23a78-293c-4229-b8f8-d85cc266dede', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Tokio?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('0524b669-5c6a-4f1d-8262-8e160dfdfda3', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Tokio del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('9f213bc0-91f8-4e9b-b623-ffa1477bc996', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Tokio? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('8984a1ac-cd6e-49d7-be49-36d1c9f5b704', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', NULL, 'atributo', '¿Qué es lo que más valoras de Tokio?', 'choice', '["Atractivos turísticos", "Seguridad", "Cultura", "Gastronomía"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('ab3d48d7-b140-4413-a15b-6c9cfc339087', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', NULL, 'innovacion', '¿Qué tan innovador consideras que es Tokio? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('210fceaa-a9da-4e78-970c-ad8369864e1f', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', NULL, 'nota_general', '¿Qué nota le das a Río de Janeiro del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('867efc70-25c0-4100-a518-d9f0fa1610f5', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Río de Janeiro?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('dc8acb94-5f0b-4c0c-bba7-49cb296dbbd0', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Río de Janeiro del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('59838286-04b5-4c39-ab4a-262cc46b3d47', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Río de Janeiro? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('4d305c77-d11d-44d1-bb12-fae4a3c9f195', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', NULL, 'atributo', '¿Qué es lo que más valoras de Río de Janeiro?', 'choice', '["Atractivos turísticos", "Seguridad", "Cultura", "Gastronomía"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('eb322839-27ac-474b-9c5e-3174a8464b4a', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', NULL, 'innovacion', '¿Qué tan innovador consideras que es Río de Janeiro? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('a9b5cdae-cd4a-49e7-96d1-abb8bfabdc30', 'fdec83d2-7500-4d84-8387-6c861108a21a', NULL, 'nota_general', '¿Qué nota le das a Roma del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('c73d64f9-f719-4bf7-a720-54415915feff', 'fdec83d2-7500-4d84-8387-6c861108a21a', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Roma?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('6418041b-1dd1-47fa-ab3d-d393191be76d', 'fdec83d2-7500-4d84-8387-6c861108a21a', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Roma del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('d1ee838b-8a03-4fd0-87aa-db915eab3d74', 'fdec83d2-7500-4d84-8387-6c861108a21a', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Roma? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('5a72c3b1-4078-4cf5-83e8-116f52c64c48', 'fdec83d2-7500-4d84-8387-6c861108a21a', NULL, 'atributo', '¿Qué es lo que más valoras de Roma?', 'choice', '["Atractivos turísticos", "Seguridad", "Cultura", "Gastronomía"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('6bc63bea-f512-4791-a762-c2d38625dfa8', 'fdec83d2-7500-4d84-8387-6c861108a21a', NULL, 'innovacion', '¿Qué tan innovador consideras que es Roma? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('dca1541c-5685-4ce3-9c04-82bd16d90f95', '37c737f2-b310-45cc-aff9-796a8da8ea75', NULL, 'nota_general', '¿Qué nota le das a Barcelona del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('ceb3ba21-16e7-437c-b92d-83705ac4a8e3', '37c737f2-b310-45cc-aff9-796a8da8ea75', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Barcelona?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('1416b813-a85d-46de-9aa2-0cfcee4c9d26', '37c737f2-b310-45cc-aff9-796a8da8ea75', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Barcelona del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('2c1462cb-ac26-470f-abd7-90a4ed1bb1bd', '37c737f2-b310-45cc-aff9-796a8da8ea75', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Barcelona? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('785e5f5a-9ba4-482a-b403-ed145aa78f0f', '37c737f2-b310-45cc-aff9-796a8da8ea75', NULL, 'atributo', '¿Qué es lo que más valoras de Barcelona?', 'choice', '["Atractivos turísticos", "Seguridad", "Cultura", "Gastronomía"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('73fa12c4-793b-4873-8144-df6ac3b59980', '37c737f2-b310-45cc-aff9-796a8da8ea75', NULL, 'innovacion', '¿Qué tan innovador consideras que es Barcelona? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('1dcdd8ce-56cb-40c2-bbbc-0a5ed7df7d0e', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', NULL, 'nota_general', '¿Qué nota le das a Apple (iPhone) del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('8412d2d7-cb1c-43eb-bf3d-e07b0b986071', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Apple (iPhone)?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('f07218fc-1cfd-4e5e-838e-c9caa39cebdf', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Apple (iPhone) del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('1b2aeaf7-cedd-4d0a-b1dc-2d6ef656df49', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Apple (iPhone)? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('b11fbfdd-5824-4b3a-b3c1-af846bea9bc5', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', NULL, 'atributo', '¿Qué es lo que más valoras de Apple (iPhone)?', 'choice', '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('37286163-853e-4270-90af-d158886c68bf', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', NULL, 'innovacion', '¿Qué tan innovador consideras que es Apple (iPhone)? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('8b96bfa2-9391-4e59-b82b-9cd7d1c53832', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', NULL, 'nota_general', '¿Qué nota le das a Samsung del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('f496a425-605f-4fad-acee-a3a3889adb52', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Samsung?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('bca12640-7041-498c-819e-e81d1b38aa8d', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Samsung del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('439c6dc8-827e-4e51-bd97-a3db116f9277', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Samsung? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('3acbe458-8752-4f18-956e-5cbafdb014e4', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', NULL, 'atributo', '¿Qué es lo que más valoras de Samsung?', 'choice', '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('17530b03-21b5-4e61-b30c-ab400c00737a', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', NULL, 'innovacion', '¿Qué tan innovador consideras que es Samsung? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('510fe598-7482-41f1-8b25-87e0c7596a37', 'b3ec2c07-22b1-4584-8f04-855e125e1370', NULL, 'nota_general', '¿Qué nota le das a Xiaomi del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('39190e03-95df-4bd9-9ae8-5c1c3e4a9c40', 'b3ec2c07-22b1-4584-8f04-855e125e1370', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Xiaomi?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('189146c1-d151-4741-a1f9-1232eccb3ec9', 'b3ec2c07-22b1-4584-8f04-855e125e1370', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Xiaomi del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('a2af21a0-042d-4446-8050-01b8b96f12a5', 'b3ec2c07-22b1-4584-8f04-855e125e1370', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Xiaomi? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('b1387806-8a58-4a4f-be4b-2ec3b7fd6e50', 'b3ec2c07-22b1-4584-8f04-855e125e1370', NULL, 'atributo', '¿Qué es lo que más valoras de Xiaomi?', 'choice', '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('e1ab3d50-cceb-4c42-b520-74d989050aba', 'b3ec2c07-22b1-4584-8f04-855e125e1370', NULL, 'innovacion', '¿Qué tan innovador consideras que es Xiaomi? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('9ebc8793-eebb-44e1-be5d-e904b2c901c2', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', NULL, 'nota_general', '¿Qué nota le das a Huawei del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('8a2ed306-6e2f-4696-b07f-54a3b420deb8', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Huawei?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('eead73af-7bff-4591-96ba-bb8f2208f1a5', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Huawei del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('9168a92a-c3f5-4d16-8e13-4d16d8033a3e', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Huawei? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('092d9890-d7fb-4959-826f-f35f7b1cb796', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', NULL, 'atributo', '¿Qué es lo que más valoras de Huawei?', 'choice', '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('7ea8e502-e646-495d-998b-c146df9a40c5', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', NULL, 'innovacion', '¿Qué tan innovador consideras que es Huawei? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('48823426-715e-48a1-b2b9-0fa842504fe5', 'b770fa66-ccfa-44d5-b201-9dccd2707493', NULL, 'nota_general', '¿Qué nota le das a Google (Pixel) del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('abf1f963-d851-43fb-8852-f0014e9a70be', 'b770fa66-ccfa-44d5-b201-9dccd2707493', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Google (Pixel)?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('ccb30f17-4f67-4d7f-be20-5618a2b95794', 'b770fa66-ccfa-44d5-b201-9dccd2707493', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Google (Pixel) del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('eda43497-359c-4ac1-bbfa-7d9105865800', 'b770fa66-ccfa-44d5-b201-9dccd2707493', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Google (Pixel)? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('10925de8-0e14-46e5-9aa2-15f52ce60d47', 'b770fa66-ccfa-44d5-b201-9dccd2707493', NULL, 'atributo', '¿Qué es lo que más valoras de Google (Pixel)?', 'choice', '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('ea10c861-a250-49b2-acde-7dfd77b1d19e', 'b770fa66-ccfa-44d5-b201-9dccd2707493', NULL, 'innovacion', '¿Qué tan innovador consideras que es Google (Pixel)? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('1642d8e4-ddd3-4c4c-b05e-47b7a6ac996b', '6eccfcd0-04de-489b-b08e-1adcbf643909', NULL, 'nota_general', '¿Qué nota le das a Motorola del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('8afb8d95-7385-4884-8eeb-1affde6d94cc', '6eccfcd0-04de-489b-b08e-1adcbf643909', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Motorola?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('bf0a6c4c-954e-406e-9f8b-b35caaa64ca3', '6eccfcd0-04de-489b-b08e-1adcbf643909', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Motorola del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('d6127b8e-d7d6-4c40-91fa-66b0cf4b04b1', '6eccfcd0-04de-489b-b08e-1adcbf643909', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Motorola? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('68f5fad2-ef5a-4525-b7bd-aa3405f6bd05', '6eccfcd0-04de-489b-b08e-1adcbf643909', NULL, 'atributo', '¿Qué es lo que más valoras de Motorola?', 'choice', '["Cámara", "Ecosistema", "Diseño", "Rendimiento"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('6f9846de-b352-49dd-b2ba-8e07e5852d95', '6eccfcd0-04de-489b-b08e-1adcbf643909', NULL, 'innovacion', '¿Qué tan innovador consideras que es Motorola? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('8012707a-b453-4fa1-bc07-4a978c731106', '7834d31e-555c-4357-9049-259839f81d7b', NULL, 'nota_general', '¿Qué nota le das a la experiencia en Clínica Alemana del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('d9f5e845-c5a2-4a18-bc51-3c9f6d089293', '7834d31e-555c-4357-9049-259839f81d7b', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Clínica Alemana?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('66c518e0-d038-4086-88b6-7a35c45be087', '7834d31e-555c-4357-9049-259839f81d7b', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Clínica Alemana del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('4c0581b2-deea-496d-8f92-3ad4762590d2', '7834d31e-555c-4357-9049-259839f81d7b', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Clínica Alemana? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('5187c36a-f7dd-4f4e-b0f7-1f6564ed56e5', '7834d31e-555c-4357-9049-259839f81d7b', NULL, 'atributo', '¿Qué es lo que más valoras de Clínica Alemana?', 'choice', '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('b1ca8e73-0657-4edd-aa62-d6ab26fc31b1', '7834d31e-555c-4357-9049-259839f81d7b', NULL, 'innovacion', '¿Qué tan innovador consideras que es Clínica Alemana? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('5c961e1d-246a-404e-ba7d-21fd52a1ab9a', '850c76eb-89e9-4fca-b719-2e9c29afaa51', NULL, 'nota_general', '¿Qué nota le das a la experiencia en Clínica Las Condes del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('cd873184-69e3-4127-8473-a221dc87011a', '850c76eb-89e9-4fca-b719-2e9c29afaa51', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Clínica Las Condes?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('a4a02ed0-9971-4d6c-878b-74f8619e5b85', '850c76eb-89e9-4fca-b719-2e9c29afaa51', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Clínica Las Condes del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('97f0d17c-1e46-40df-bc27-cb7e2c2f62e8', '850c76eb-89e9-4fca-b719-2e9c29afaa51', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Clínica Las Condes? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('be1b0caa-2102-422a-9165-27f503c70be6', '850c76eb-89e9-4fca-b719-2e9c29afaa51', NULL, 'atributo', '¿Qué es lo que más valoras de Clínica Las Condes?', 'choice', '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('b7c95b30-29b0-4b7c-a675-e1ca87d2234c', '850c76eb-89e9-4fca-b719-2e9c29afaa51', NULL, 'innovacion', '¿Qué tan innovador consideras que es Clínica Las Condes? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('516b311b-e08b-4405-98c4-005e6fa1724c', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', NULL, 'nota_general', '¿Qué nota le das a la experiencia en Clínica Santa María del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('c610f268-f90c-4d27-9b79-45b7a8e7944b', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Clínica Santa María?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('b4bcf645-4b8f-4e38-bd5e-b05c55f416b1', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Clínica Santa María del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('49e2ffba-7db6-473c-b5f2-a747ba01bc67', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Clínica Santa María? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('d15701b0-9c35-41e6-a889-35c441b8c58a', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', NULL, 'atributo', '¿Qué es lo que más valoras de Clínica Santa María?', 'choice', '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('de721c8f-4e29-416f-a194-cb7fb286e47e', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', NULL, 'innovacion', '¿Qué tan innovador consideras que es Clínica Santa María? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('2acd9559-78dd-456a-bde9-8e0c766ba8aa', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', NULL, 'nota_general', '¿Qué nota le das a la experiencia en Clínica Dávila del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('e07d629d-73f1-44e2-86f8-013b2d2733de', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas Clínica Dávila?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('85870758-bf3a-4e7f-8ded-a83bfc144262', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes Clínica Dávila del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('323e1d20-01e6-420e-bb98-33a818ac2265', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de Clínica Dávila? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('4088e4d5-be92-4892-87bf-eab04428f68c', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', NULL, 'atributo', '¿Qué es lo que más valoras de Clínica Dávila?', 'choice', '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('db1191a4-c3c6-4f3e-90ac-54926889a97e', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', NULL, 'innovacion', '¿Qué tan innovador consideras que es Clínica Dávila? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('e3d7645a-c14e-4dab-9e48-efd0727a35c0', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', NULL, 'nota_general', '¿Qué nota le das a la experiencia en RedSalud del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('64069b49-34ae-43e5-aa9b-d9375cccc4fc', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas RedSalud?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('681d8bc7-4a39-45c8-8ee7-790619b1b039', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes RedSalud del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('c8ff42a0-b2bf-465b-9821-7f36e49e7fad', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de RedSalud? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('970684ac-a7d7-455d-9ce9-fd3913595de4', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', NULL, 'atributo', '¿Qué es lo que más valoras de RedSalud?', 'choice', '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('3d14de58-e374-4ae8-b702-fad9dfc99391', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', NULL, 'innovacion', '¿Qué tan innovador consideras que es RedSalud? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('6340f902-525b-4766-8527-e350d77b5332', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', NULL, 'nota_general', '¿Qué nota le das a la experiencia en IntegraMédica del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.212571+00'),
	('7976f0e1-afd3-40e7-805e-aa9f03776263', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', NULL, 'frecuencia', '¿Con qué frecuencia consumes/visitas IntegraMédica?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.212571+00'),
	('3a5134d9-071e-4251-bd3f-219bf6b92bb6', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes IntegraMédica del 0 al 10?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.212571+00'),
	('3802fcad-2b55-4e69-927c-d02b9a0d0ae7', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', NULL, 'valor', '¿Cómo calificas la relación calidad-precio / valor de IntegraMédica? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.212571+00'),
	('ff238074-19c0-4f91-9dca-ad443ce09da8', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', NULL, 'atributo', '¿Qué es lo que más valoras de IntegraMédica?', 'choice', '["Calidad médica", "Ubicación", "Tecnología", "Trato al paciente"]', 5, true, '2026-02-22 18:40:40.212571+00'),
	('ad5791a3-5d08-4073-930e-252907e84e74', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', NULL, 'innovacion', '¿Qué tan innovador consideras que es IntegraMédica? (1-5)', 'scale', '[]', 6, true, '2026-02-22 18:40:40.212571+00'),
	('e95dc9fb-729a-4f13-ad5b-8a5117e45916', '234f6930-227a-480d-a3fc-86b35983ef08', NULL, 'nota_general', '¿Qué nota le das a Netflix del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.542882+00'),
	('e8267114-6498-4e26-b5e1-4338cee2d71f', '234f6930-227a-480d-a3fc-86b35983ef08', NULL, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.542882+00'),
	('6ee2cf71-7d1a-46bf-b389-eca2666643f0', '234f6930-227a-480d-a3fc-86b35983ef08', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.542882+00'),
	('18a5bab8-9831-46fe-b36e-1222bbb9bdac', '234f6930-227a-480d-a3fc-86b35983ef08', NULL, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.542882+00'),
	('0bac78b3-3a90-46eb-8de8-fc51cd09fb94', '234f6930-227a-480d-a3fc-86b35983ef08', NULL, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', '[]', 5, true, '2026-02-22 18:40:40.542882+00'),
	('6bbe1240-5f8e-4fe1-b74e-f10aedb470e8', '234f6930-227a-480d-a3fc-86b35983ef08', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('43e57395-14ff-431d-b7cc-c76e4290d4be', 'ab709897-53f2-42e6-813e-961525535e59', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('9af48eb7-546a-4d1d-a6bf-5f16defe0917', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('57586a59-83cb-4d35-a9ed-e13ab44c1d16', 'c4ff3a39-cae1-4134-8198-e0e5cd2d2c48', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('62c6edb4-df81-4ced-9a2f-06dd05763a9f', 'f4c5b041-a50d-41ab-bdf9-ab0bffc05a37', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('3ba63cca-bcee-4952-98c4-aad6fed35747', '3c569256-7292-420f-a5e9-76140299e91c', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('5c22de1e-3609-4d76-bc58-5ee3551395b3', 'ef6f3b95-9499-4912-9773-bb5992b72d96', NULL, 'nota_general', '¿Qué nota le das a Coca-Cola del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.542882+00'),
	('26166bbe-aed6-4189-8ee6-a2b4b144f9f6', 'ef6f3b95-9499-4912-9773-bb5992b72d96', NULL, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.542882+00'),
	('7aed4098-d70a-492f-83d5-dbc5c76f1cd5', 'ef6f3b95-9499-4912-9773-bb5992b72d96', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.542882+00'),
	('3b4a3016-d321-4d53-b8c4-1ef8207e8500', 'ef6f3b95-9499-4912-9773-bb5992b72d96', NULL, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.542882+00'),
	('b1ab993a-a656-4398-a2f3-4b32de6106d1', 'ef6f3b95-9499-4912-9773-bb5992b72d96', NULL, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', '[]', 5, true, '2026-02-22 18:40:40.542882+00'),
	('f76fdd2b-44ff-413e-8ee1-d1dfe48808d0', 'ef6f3b95-9499-4912-9773-bb5992b72d96', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('2ef5ad00-faa5-4cfd-9a87-7058de22baeb', 'ca43d5b2-efa0-4187-99e8-c10521597769', NULL, 'nota_general', '¿Qué nota le das a Pepsi del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.542882+00'),
	('4a8c0434-f12b-4209-9888-ec4d7b015a1b', 'ca43d5b2-efa0-4187-99e8-c10521597769', NULL, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.542882+00'),
	('00baac5f-7c31-487c-bdb3-467fd976b578', 'ca43d5b2-efa0-4187-99e8-c10521597769', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.542882+00'),
	('514891ab-9e6e-4da8-8331-b425b639ce56', 'ca43d5b2-efa0-4187-99e8-c10521597769', NULL, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.542882+00'),
	('65802f5e-8193-4ce2-a2d9-be52b9ccd85f', 'ca43d5b2-efa0-4187-99e8-c10521597769', NULL, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', '[]', 5, true, '2026-02-22 18:40:40.542882+00'),
	('1b0cd0f8-5b94-4cd6-84a3-ea384342ae0a', 'ca43d5b2-efa0-4187-99e8-c10521597769', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('595ec46d-1bf9-4025-aafa-5354bfbe7efc', 'def65be0-c360-4098-81a1-228bd5625806', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('26beea71-bb96-49e8-a406-fbd71b31ca45', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('7a1c456a-7157-4a3c-baa8-8c7b3115690d', '9ba1aa20-b853-4901-9f67-ab851efc74d4', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('4fc7bd32-d660-42f5-a1f5-ae3265c77cd8', '0a576f60-c48e-4053-9430-c94768a42dd6', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('2efc1664-1079-48c1-be00-8cc1bc77c3f4', '096ed0fb-9c10-4861-99a8-a1c65c0f64a1', NULL, 'nota_general', '¿Qué nota le das a Paris del 0 al 10?', 'scale', '[]', 1, true, '2026-02-22 18:40:40.542882+00'),
	('ea913b10-daf3-4763-9b29-ebe0e3808fc2', '096ed0fb-9c10-4861-99a8-a1c65c0f64a1', NULL, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]', 2, true, '2026-02-22 18:40:40.542882+00'),
	('775ff9cf-418b-44c0-b497-0a4e1dba94ca', '096ed0fb-9c10-4861-99a8-a1c65c0f64a1', NULL, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', '[]', 3, true, '2026-02-22 18:40:40.542882+00'),
	('5fbb51cd-9945-4557-8998-f739f8c53f3a', '096ed0fb-9c10-4861-99a8-a1c65c0f64a1', NULL, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', '[]', 4, true, '2026-02-22 18:40:40.542882+00'),
	('dcc9a918-cfb7-415f-88e7-161c9e585fa2', '096ed0fb-9c10-4861-99a8-a1c65c0f64a1', NULL, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', '[]', 5, true, '2026-02-22 18:40:40.542882+00'),
	('a8078655-30fe-4425-9cd2-c7797ffd629e', '096ed0fb-9c10-4861-99a8-a1c65c0f64a1', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('18aa0992-6899-452f-8b0d-67e1472c083d', '10f1529e-b4d4-4704-8cd9-0b80742300dc', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('0e9448ed-43ea-4c66-a466-fff5fcb18763', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('59a859c5-3402-48b2-8eca-c0217fa5418b', 'e6a796bc-7dad-42e0-9e85-2d6a2a4ddfe0', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('bee5fe88-219a-47b0-8460-fd8810fe17cc', 'fdec83d2-7500-4d84-8387-6c861108a21a', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('43b547ad-f336-4d49-92b3-f49cd645440d', '37c737f2-b310-45cc-aff9-796a8da8ea75', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('c9c50310-0f9f-4b0d-8cab-5c8c7c4d0f30', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('b052c19d-9fc9-4cd3-80b1-7c86adcff532', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('076bab15-d5a0-4e35-abf8-5dc9cac544f9', 'b3ec2c07-22b1-4584-8f04-855e125e1370', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('0c42a2ee-387a-4cf7-a0c3-6e4b69724abf', '94c52d16-fa46-44b3-99a2-8c7a9daaac63', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('0fac6cfb-c567-47f2-97ed-69a8161e21df', 'b770fa66-ccfa-44d5-b201-9dccd2707493', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('7d7d7358-8672-4b90-aa31-6fde0e975046', '6eccfcd0-04de-489b-b08e-1adcbf643909', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('58fbad27-6131-455e-ab4c-d8b7347d40d2', '7834d31e-555c-4357-9049-259839f81d7b', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('4467f7e7-f8f9-40b2-b291-75a7ee5b0b2f', '850c76eb-89e9-4fca-b719-2e9c29afaa51', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('0a6db729-04c9-439b-9e8b-ed94562cd1a6', 'ab94c6a7-5689-4970-b9b6-ffebcb1e36e4', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('b56a2572-293b-4bb3-a3a5-a6fd735e5662', '9cc1d2fe-3fc0-42c4-adb2-f31fb5864964', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('fee9bd6d-ea0d-4873-a88b-81493da41eb2', 'b3739e12-cb57-4bb2-a31e-fef9b9b1143c', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00'),
	('cc74c9ec-0c56-4470-9b11-99f15c735337', 'daa7a9ca-0eb8-439b-8a49-bbd06ce3a5bd', NULL, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]', 6, true, '2026-02-22 18:40:40.542882+00');


--
-- Data for Name: entity_daily_aggregates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."entity_daily_aggregates" ("day", "entity_id", "category_slug", "gender", "age_bucket", "region", "signals_count", "unique_users", "weight_sum", "opinascore_sum", "depth_nota_avg", "depth_nota_n", "last_refreshed_at", "id") VALUES
	('2026-02-23', '10f1529e-b4d4-4704-8cd9-0b80742300dc', 'vacaciones', 'male', NULL, 'Metropolitana', 6, 2, 10.20, 8.5000000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', '5aa25e63-116f-43ab-a7b8-fa160fd6fa70'),
	('2026-02-23', '3130e635-0ae4-46f4-8b4a-67128cb0c5bd', 'vacaciones', 'male', NULL, 'Metropolitana', 3, 2, 5.10, 4.2500000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', '3e55ba5d-0613-41ec-b109-01ece5c02c67'),
	('2026-02-23', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', 'smartphones', 'male', NULL, 'Metropolitana', 7, 2, 11.90, 9.3500000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', '706546b5-36c5-499e-99d4-118cb6f67d9f'),
	('2026-02-23', '7834d31e-555c-4357-9049-259839f81d7b', 'salud', 'male', NULL, 'Metropolitana', 5, 2, 8.50, 6.8000000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', '2ab4876e-eef1-43bb-bfb0-53045b224cf1'),
	('2026-02-23', '850c76eb-89e9-4fca-b719-2e9c29afaa51', 'salud', 'male', NULL, 'Metropolitana', 3, 2, 5.10, 4.2500000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', '0aa46932-b02e-4f08-b0be-38bbcd653185'),
	('2026-02-23', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', 'smartphones', 'male', NULL, 'Metropolitana', 10, 2, 17.00, 14.4500000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', '90abe746-8875-4405-a259-afd62943f4bc'),
	('2026-02-23', 'ab709897-53f2-42e6-813e-961525535e59', 'streaming', 'male', NULL, 'Metropolitana', 11, 2, 18.70, 15.3000000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', 'f7d57f3a-72a2-499c-a25c-31e614c6021d'),
	('2026-02-23', 'ca43d5b2-efa0-4187-99e8-c10521597769', 'bebidas', 'male', NULL, 'Metropolitana', 4, 2, 6.80, 5.1000000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', 'cb743eea-b57a-4b90-9841-0ba0f6f9a71e'),
	('2026-02-23', 'cf07fcdf-8345-4b44-8c6d-ef0031d54d01', 'streaming', 'male', NULL, 'Metropolitana', 4, 2, 6.80, 5.1000000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', 'a1b1d337-9e90-45ec-985d-173e7f1e2b83'),
	('2026-02-23', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', 'bebidas', 'male', NULL, 'Metropolitana', 4, 2, 6.80, 5.9500000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', 'd95e3bb4-4444-4502-8795-200cd4e15e59'),
	('2026-02-23', 'def65be0-c360-4098-81a1-228bd5625806', 'bebidas', 'male', NULL, 'Metropolitana', 6, 2, 10.20, 7.6500000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', 'ddffba83-fef5-4f72-9dec-e3267dcbf81d'),
	('2026-02-23', 'ef6f3b95-9499-4912-9773-bb5992b72d96', 'bebidas', 'male', NULL, 'Metropolitana', 3, 1, 5.10, 4.2500000000000000000000000000, NULL, 0, '2026-02-23 13:23:15.578048+00', 'fa7242f5-7397-488c-82c2-fb1adf57ad0d');


--
-- Data for Name: entity_rank_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: executive_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: invitation_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."invitation_codes" ("id", "code", "max_uses", "current_uses", "expires_at", "created_at", "created_by", "status", "issued_to_label", "claimed_by", "claimed_at", "assigned_alias", "used_by_user_id", "used_at") VALUES
	('4ea8d1df-abd1-4752-a3ef-338939d684ee', 'GRUPO1-8BBF232A', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('ed2efaa6-401a-4115-969c-a885c9392342', 'GRUPO1-56CFF819', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('8ed129b0-b91a-4458-abc2-0de09cb75150', 'GRUPO1-905332A3', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('8f765688-ff9c-4f48-a891-4629590cad46', 'GRUPO1-A1110CC8', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('953fd581-2387-4572-8838-8e21b016e1e1', 'GRUPO1-90466A80', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('7af8cd46-b1c7-4c4b-bc0d-d270e2d1b70e', 'GRUPO1-DE947B7E', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('08a7f8b4-f7f9-44a4-8f52-3eba3de2c9c2', 'GRUPO1-4E711A5B', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('3f859422-5fb4-4cf9-9d94-488531dfe1ef', 'GRUPO1-0DF4B116', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('86c8e192-ae33-4ac1-bce7-b67ccaaa005d', 'GRUPO1-B58B1463', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'active', 'admin_generate_invites', NULL, NULL, NULL, NULL, NULL),
	('d668c47f-1e5f-4441-9ab9-1d90e1712417', 'GRUPO1-2970954C', 1, 0, NULL, '2026-02-26 14:47:29.105134+00', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'used', 'admin_generate_invites', NULL, NULL, NULL, '553da265-6f70-4125-b639-197b5c81defc', '2026-02-26 15:19:14.283348+00');


--
-- Data for Name: invite_redemptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."invite_redemptions" ("id", "user_id", "anon_id", "invite_id", "invite_code_entered", "result", "nickname", "app_version", "user_agent", "created_at") VALUES
	('d12ca19a-ceac-4f9a-9e67-267903d62edd', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', NULL, NULL, 'BYPASS-AUDIT', 'invite_invalid', 'ADMIN', 'unknown', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 00:40:18.448981+00'),
	('d4a26e21-9451-465b-beaf-9a1ce1eb89c6', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', NULL, NULL, 'BYPASS-AUDIT', 'invite_invalid', 'ADMIN', 'unknown', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 00:40:29.905696+00'),
	('eae4b817-d233-4f30-84e4-610591bb1bd4', '5e886781-6e3d-4776-96c0-82185df6e52c', NULL, NULL, 'OP-6D107ED4', 'unknown_error', 'Juan', 'unknown', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 12:45:36.482776+00'),
	('09231005-c26e-4dd4-93ea-ee74e1f739cb', '5e886781-6e3d-4776-96c0-82185df6e52c', NULL, NULL, 'OP-6D107ED4', 'unknown_error', 'JuanJ', 'unknown', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 12:45:52.310071+00'),
	('370f8ca3-b802-4fd7-a9ed-237c6fd0b34f', '5e886781-6e3d-4776-96c0-82185df6e52c', NULL, NULL, 'OP-6D107ED4', 'unknown_error', 'JuanJ', 'unknown', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 12:46:38.772003+00'),
	('f3defc97-d5d6-40b3-9283-03082caf1d2e', '5e886781-6e3d-4776-96c0-82185df6e52c', NULL, NULL, 'OP-6D107ED4', 'unknown_error', 'JuanJ', 'unknown', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 12:46:53.298348+00'),
	('8716ba35-a228-450b-a701-6d145f2b2ba7', NULL, NULL, NULL, 'OP-6D107ED4', 'unauthorized', NULL, NULL, NULL, '2026-02-26 12:53:07.816137+00'),
	('f7b6f1a9-e2fc-4b4b-94fd-de07375cc35d', '553da265-6f70-4125-b639-197b5c81defc', '85354f0810544fe5bcbb14ac5bdf4421', 'd668c47f-1e5f-4441-9ab9-1d90e1712417', 'GRUPO1-2970954C', 'success', 'Juan', 'unknown', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 15:19:14.283348+00');


--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: platform_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profile_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles_legacy_20260223; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: public_rank_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ranking_snapshots_legacy_20260223; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: signal_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."signal_events" ("id", "signal_id", "created_at", "anon_id", "user_id", "entity_id", "entity_type", "module_type", "context_id", "battle_id", "battle_instance_id", "option_id", "session_id", "attribute_id", "value_text", "value_numeric", "meta", "signal_weight", "computed_weight", "algorithm_version", "influence_level_snapshot", "user_tier", "profile_completeness", "gender", "age_bucket", "region", "country", "opinascore", "algorithm_version_id", "commune", "client_event_id", "device_hash") VALUES
	('bacf1d66-964c-4bc8-852d-3295ff9bdfcf', 'bf777eb7-ad79-42a8-9f1c-38bfcfebc65a', '2026-02-26 16:02:09.070125+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'ab709897-53f2-42e6-813e-961525535e59', 'topic', 'versus', NULL, '668e775a-46a1-450c-b878-855b983a8e15', '05834393-e8b6-42da-a951-3f72c5e83524', '983787a8-9ad8-4aea-944a-1b05d2065eff', NULL, NULL, NULL, NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', '1a77fffc-7b76-4be3-954b-a367d2f9912b', '33a82843-d25c-489d-abd7-8077988db496'),
	('cac6ae69-292c-428a-a987-4f58f51f758d', '156f486f-54eb-41ac-bcd5-4fb28ee7c157', '2026-02-26 16:02:11.060347+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', 'topic', 'versus', NULL, '6e9253c3-1d69-416f-9689-d982171c211b', '966c160e-6db5-450d-b782-8df647fe4f6b', 'c0509839-d568-4b1f-9dff-d67f4e64ddbf', NULL, NULL, NULL, NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', '0757886d-8d11-4f90-84fa-93bd2e94709e', '33a82843-d25c-489d-abd7-8077988db496'),
	('f974779b-0981-4d89-b171-aba57efa8777', '83400792-6b9e-483c-a385-6075794f6c93', '2026-02-26 16:02:12.964746+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', '10f1529e-b4d4-4704-8cd9-0b80742300dc', 'topic', 'versus', NULL, '72ad1c4b-67ed-40f0-a652-904c913474f3', '8d8e1030-8f22-4164-8fb9-859fde394512', '864366e1-9225-489d-8e13-e26b8dd22047', NULL, NULL, NULL, NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', '78ed01c2-868c-4ef7-a796-ccc95eece629', '33a82843-d25c-489d-abd7-8077988db496'),
	('c78e38aa-b603-4594-a670-71e451c5000a', 'fcc801f6-fa5e-4845-8ffe-600fa9157840', '2026-02-26 16:02:15.327638+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'aa862f92-ed9e-473b-b9c8-b52f50bd17f2', 'topic', 'versus', NULL, 'ad99e41b-72e4-4dad-b622-e61d799a1785', '5def0a26-8950-4e85-a106-7559cb326f1c', '31b709ce-b0a9-4935-ad92-fb05ffd6739a', NULL, NULL, NULL, NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', '4a9bce37-0063-4cfb-af9a-4ae12a13cac3', '33a82843-d25c-489d-abd7-8077988db496'),
	('22a10bf0-938a-4ec1-87ce-c6fa6c6fb882', '1da561c4-f9a8-402e-8b81-74d4af9dbb39', '2026-02-26 16:02:17.310312+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', '850c76eb-89e9-4fca-b719-2e9c29afaa51', 'topic', 'versus', NULL, '5c8d5202-5e2c-45fe-98ee-f30e52f675c5', '92d58711-258f-4c77-b280-40a26419193d', '9a0b1f66-aa24-4037-a99b-470af20f4524', NULL, NULL, NULL, NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', '6fd9aaa7-a955-4204-9fb7-456b5c04a21a', '33a82843-d25c-489d-abd7-8077988db496'),
	('a15d1d4e-185f-4e4f-a26b-bb5e7759a228', '9e811835-e386-4935-b4e5-007b61efc7a7', '2026-02-26 16:02:19.194954+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', '6a2ea986-a7ae-44ac-a4e4-c30e51b77220', 'topic', 'versus', NULL, 'cd9d9c21-9710-49f4-98ce-a21e983c9126', 'be2ac9ea-f0e9-40d0-ac2d-7374c48040ec', '557841de-1d2b-46f1-8515-03328981cf4b', NULL, NULL, NULL, NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', '779148a2-5df0-449a-b314-8cbaa8a2fd16', '33a82843-d25c-489d-abd7-8077988db496'),
	('3146fad4-fe8e-4255-9699-30a76cb38919', 'fbe2b567-b183-4d17-85d9-a55f083bfefd', '2026-02-26 16:02:21.409864+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'ca43d5b2-efa0-4187-99e8-c10521597769', 'topic', 'versus', NULL, 'd71697e3-8573-4358-ba88-1f0a1bc0c8c0', '0991c7f3-c001-4e99-954e-e97d157a6ffa', '9b81c0bc-b1a2-4113-852b-f95a3ca8ff98', NULL, NULL, NULL, NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', '7966f654-8d0a-43ca-a065-cf2762d802cb', '33a82843-d25c-489d-abd7-8077988db496'),
	('00b1f24b-9451-40c9-87ef-b2b677de783d', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'frecuencia', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, 'Semanalmente', NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('51402b1e-4851-484b-b4ed-6bfe815735bb', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'lealtad', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, 'Es una alternativa secundaria', NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('1ff675aa-dbf9-4eb6-97f6-a160a637902c', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'valor', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, '3', 3, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('8661fbef-5d34-4c20-a334-33a3c0ec5f74', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'atributo_clave', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, 'Estatus / Marca', NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('cf775530-fcb0-4069-94fc-8a1986b63a8a', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'recomendacion', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, '2', 2, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('fa09d8a2-01a6-4bc5-8a6d-2aab7379043a', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'alternativa', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, 'Elegiría una categoría distinta', NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('4f2530cb-b88c-41e4-b237-9cbf4f69d255', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'confianza', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, '5', 5, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('0bce4790-537e-4272-8919-b4117f779875', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'innovacion', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, '5', 5, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('ab4d44f0-ba16-4411-8e65-9bf3fa729eec', '45530b36-e76a-4496-bd9a-5cfef6e8662a', '2026-02-26 16:03:15.655291+00', '85354f0810544fe5bcbb14ac5bdf4421', '553da265-6f70-4125-b639-197b5c81defc', 'def65be0-c360-4098-81a1-228bd5625806', 'topic', 'depth', 'proposito', NULL, NULL, '86008ffa-de02-44ec-8785-f487a7a881e0', NULL, NULL, 'No, es puramente comercial', NULL, '{}', 1.70, 1.70, '1.2.0', NULL, 'guest', 0, 'male', NULL, 'Metropolitana', 'CL', 1.7000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', 'Las Condes', NULL, NULL),
	('76fffba4-9565-4421-9f4d-6d07c2dcef15', '0d123af6-4000-4d46-b86c-519164dffb86', '2026-02-26 16:40:43.736239+00', '034754fcd2624ceeaac92710366b4d36', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'ab709897-53f2-42e6-813e-961525535e59', 'topic', 'versus', NULL, '668e775a-46a1-450c-b878-855b983a8e15', '05834393-e8b6-42da-a951-3f72c5e83524', '983787a8-9ad8-4aea-944a-1b05d2065eff', NULL, NULL, NULL, NULL, '{}', 1.00, 1.00, '1.2.0', NULL, 'guest', 0, NULL, NULL, NULL, 'CL', 1.0000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', NULL, '7459d86e-c139-4c26-b554-de34ffb51ce6', 'a48fd682-75f5-406b-8235-3ac4908a85a2'),
	('f48fe43b-b491-4054-9703-4331228c4ef3', '3a1c3068-bc3f-452d-bee3-361c9e379243', '2026-02-26 18:58:37.494416+00', '034754fcd2624ceeaac92710366b4d36', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'ab709897-53f2-42e6-813e-961525535e59', 'topic', 'versus', NULL, '668e775a-46a1-450c-b878-855b983a8e15', '05834393-e8b6-42da-a951-3f72c5e83524', '983787a8-9ad8-4aea-944a-1b05d2065eff', NULL, NULL, NULL, NULL, '{}', 1.00, 1.00, '1.2.0', NULL, 'guest', 0, NULL, NULL, NULL, 'CL', 1.0000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', NULL, '6e7124d5-ab67-4028-b988-aee0bbfdedc3', 'a48fd682-75f5-406b-8235-3ac4908a85a2'),
	('f46964dc-58f2-4d8e-b6ea-4b4758650acc', 'a1e99520-05c8-4bfa-979e-de2ef5f1ef46', '2026-02-26 19:17:46.778145+00', '034754fcd2624ceeaac92710366b4d36', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'ab709897-53f2-42e6-813e-961525535e59', 'topic', 'versus', NULL, '668e775a-46a1-450c-b878-855b983a8e15', '05834393-e8b6-42da-a951-3f72c5e83524', '983787a8-9ad8-4aea-944a-1b05d2065eff', NULL, NULL, NULL, NULL, '{}', 1.00, 1.00, '1.2.0', NULL, 'guest', 0, NULL, NULL, NULL, 'CL', 1.0000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', NULL, 'fe87a4d3-125e-4fbc-9078-11cbcf97c6f1', 'a48fd682-75f5-406b-8235-3ac4908a85a2'),
	('73b46574-2d87-4af5-aa71-09c2ce26e744', '7bb4d2ee-ffb4-4872-8a5c-117bb4c6b776', '2026-02-26 19:17:52.615611+00', '034754fcd2624ceeaac92710366b4d36', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'db8b4e9c-27b5-4799-97c3-0b2cb4b066f9', 'topic', 'versus', NULL, '6e9253c3-1d69-416f-9689-d982171c211b', '966c160e-6db5-450d-b782-8df647fe4f6b', 'c0509839-d568-4b1f-9dff-d67f4e64ddbf', NULL, NULL, NULL, NULL, '{}', 1.00, 1.00, '1.2.0', NULL, 'guest', 0, NULL, NULL, NULL, 'CL', 1.0000000000000000000000000000, 'd7938def-b75c-46b9-9a54-3b3de30db2a6', NULL, '381ab9e1-3741-4375-9f3d-39656f1cbaae', 'a48fd682-75f5-406b-8235-3ac4908a85a2');


--
-- Data for Name: signal_hourly_aggs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_activity" ("id", "user_id", "action_type", "created_at") VALUES
	('06a8b2bd-ab7d-4c40-9c78-e3d76a03e55a', '553da265-6f70-4125-b639-197b5c81defc', 'signal_emitted', '2026-02-26 16:02:09.070125+00'),
	('ccdf4eb2-6c22-4ccc-8e93-1d9b0f52e8fb', '553da265-6f70-4125-b639-197b5c81defc', 'signal_emitted', '2026-02-26 16:02:11.060347+00'),
	('9df00ca1-bbf4-420c-b29f-8f81820f1937', '553da265-6f70-4125-b639-197b5c81defc', 'signal_emitted', '2026-02-26 16:02:12.964746+00'),
	('1ac5aeaa-ebb4-4934-bfc3-8f764bf53fd4', '553da265-6f70-4125-b639-197b5c81defc', 'signal_emitted', '2026-02-26 16:02:15.327638+00'),
	('72f6c494-31ef-4f0d-9771-44203c607c72', '553da265-6f70-4125-b639-197b5c81defc', 'signal_emitted', '2026-02-26 16:02:17.310312+00'),
	('4ce8138c-4ba8-49bb-a253-6ad19adec766', '553da265-6f70-4125-b639-197b5c81defc', 'signal_emitted', '2026-02-26 16:02:19.194954+00'),
	('668555a1-bbbc-4e54-91fc-77278b23e74b', '553da265-6f70-4125-b639-197b5c81defc', 'signal_emitted', '2026-02-26 16:02:21.409864+00'),
	('dee1aae6-d675-4804-ac20-ea6e486d439e', '553da265-6f70-4125-b639-197b5c81defc', 'depth_completed', '2026-02-26 16:03:15.655291+00'),
	('02b6d9a5-2c2a-41c1-b402-94433e808fc1', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'signal_emitted', '2026-02-26 16:40:43.736239+00'),
	('e8b09465-9d3b-41a8-a81d-b4a03d577708', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'signal_emitted', '2026-02-26 18:58:37.494416+00'),
	('c3951aa0-be96-4d26-9ff5-8bbbbc349b02', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'signal_emitted', '2026-02-26 19:17:46.778145+00'),
	('09c526c6-2620-4182-9fed-099c1ce4ba6c', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'signal_emitted', '2026-02-26 19:17:52.615611+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("user_id", "role", "invitation_code_id", "is_identity_verified", "created_at", "updated_at", "total_interactions", "total_time_spent_seconds", "total_sessions", "last_active_at") VALUES
	('553da265-6f70-4125-b639-197b5c81defc', 'user', 'd668c47f-1e5f-4441-9ab9-1d90e1712417', false, '2026-02-26 15:19:08.551815+00', '2026-02-26 19:01:21.67722+00', 16, 764, 0, '2026-02-26 19:01:21.67722+00'),
	('0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'admin', NULL, false, '2026-02-25 00:01:10.603448+00', '2026-02-26 19:17:52.615611+00', 4, 115065, 98, '2026-02-26 19:17:52.615611+00');


--
-- Data for Name: user_daily_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_daily_metrics" ("id", "user_id", "anon_id", "metric_date", "interactions", "time_spent_seconds", "sessions", "created_at", "updated_at") VALUES
	('d14f5207-d9cd-4de8-8e76-9611f84e4d58', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', NULL, '2026-02-25', 0, 7458, 34, '2026-02-25 01:51:19.923754+00', '2026-02-25 23:02:52.706631+00'),
	('dff897de-1ccb-4f10-99c6-14f40fe40d1f', '553da265-6f70-4125-b639-197b5c81defc', NULL, '2026-02-26', 16, 764, 0, '2026-02-26 15:25:40.196251+00', '2026-02-26 19:01:21.67722+00'),
	('f80e2f87-65cd-4576-84d7-5c85584efa3e', NULL, '0df5284d-1bb0-4ff6-a079-1dc55294daf1', '2026-02-26', 4, 0, 0, '2026-02-26 16:40:43.736239+00', '2026-02-26 19:17:52.615611+00'),
	('295b8c7c-31bd-4de1-a51d-fe34e4ca4476', '0df5284d-1bb0-4ff6-a079-1dc55294daf1', NULL, '2026-02-26', 4, 107607, 64, '2026-02-26 00:20:27.850221+00', '2026-02-26 19:17:52.615611+00'),
	('f23b2902-9a98-4c9a-a0d4-9dfe34104f82', NULL, '553da265-6f70-4125-b639-197b5c81defc', '2026-02-26', 16, 0, 0, '2026-02-26 16:02:09.070125+00', '2026-02-26 16:03:15.655291+00');


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_profiles" ("user_id", "nickname", "gender", "age_bucket", "region", "comuna", "education", "last_demographics_update", "profile_completeness", "created_at", "updated_at", "birth_year", "employment_status", "income_range", "education_level", "housing_type", "purchase_behavior", "influence_level", "profile_stage", "signal_weight") VALUES
	('0df5284d-1bb0-4ff6-a079-1dc55294daf1', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 00:01:10.603448+00', '2026-02-25 00:01:10.603448+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1.0),
	('553da265-6f70-4125-b639-197b5c81defc', 'Juan', 'male', NULL, 'Metropolitana', 'Las Condes', NULL, NULL, NULL, '2026-02-26 15:19:08.551815+00', '2026-02-26 15:19:54.4749+00', 1986, 'Trabajador Dependiente', 'Más de $4.000.000', 'Universitaria completa', 'Arrendada', 'Planificador', 'Sigo recomendaciones', 4, 1.7);


--
-- Data for Name: user_state_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_stats" ("user_id", "total_signals", "weighted_score", "level", "signal_weight", "last_signal_at", "created_at", "updated_at", "trust_score", "suspicious_flag") VALUES
	('553da265-6f70-4125-b639-197b5c81defc', 8, 0, 1, 1.0, '2026-02-26 16:03:15.655291+00', '2026-02-26 16:02:09.070125+00', '2026-02-26 16:02:09.070125+00', 1.0, false),
	('0df5284d-1bb0-4ff6-a079-1dc55294daf1', 4, 0, 1, 1.0, '2026-02-26 19:17:52.615611+00', '2026-02-26 16:40:43.736239+00', '2026-02-26 16:40:43.736239+00', 1.0, false);


--
-- Data for Name: volatility_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: whatsapp_inbound_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."whatsapp_inbound_messages" ("id", "created_at", "wa_message_id", "wa_from", "wa_from_hash", "message_type", "body", "token_text", "invite_id", "raw") VALUES
	('d225a13a-ff1f-45ca-b164-abdc61e9960d', '2026-02-25 04:06:32.831875+00', 'wamid.HBgLNTY5NzIxNjUwMjIVAgASGBQzQTlCNDY3NkNGMTJCNDYzOEQxQgA=', '56972165022', '8880df85457100fa54871f2060e47484bfba5d58b7ad2894960cecdb1723325f', 'text', 'Probando log 2', NULL, NULL, '{"entry": [{"id": "1480001813712944", "changes": [{"field": "messages", "value": {"contacts": [{"wa_id": "56972165022", "profile": {"name": "JIJ"}}], "messages": [{"id": "wamid.HBgLNTY5NzIxNjUwMjIVAgASGBQzQTlCNDY3NkNGMTJCNDYzOEQxQgA=", "from": "56972165022", "text": {"body": "Probando log 2"}, "type": "text", "timestamp": "1771992391"}], "metadata": {"phone_number_id": "949026921634770", "display_phone_number": "15551586578"}, "messaging_product": "whatsapp"}}]}], "object": "whatsapp_business_account"}');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('versus-assets', 'versus-assets', NULL, '2026-02-14 22:20:06.856303+00', '2026-02-14 22:20:06.856303+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('ba17e939-74ab-4ace-98ce-90048ff0ada5', 'versus-assets', 'brands/home.webp', NULL, '2026-02-14 22:29:33.525383+00', '2026-02-14 22:29:33.525383+00', '2026-02-14 22:29:33.525383+00', '{"eTag": "\"f5d61c01f7b76607c759211e1ec72f7a-1\"", "size": 35484, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:29:34.000Z", "contentLength": 35484, "httpStatusCode": 200}', 'e42155af-398a-45d4-bf70-d05780c48db4', NULL, NULL),
	('31d81b03-8ee4-41e8-8804-8fa4bcfb4609', 'versus-assets', 'brands/office.jpg', NULL, '2026-02-14 22:30:49.771389+00', '2026-02-14 22:30:49.771389+00', '2026-02-14 22:30:49.771389+00', '{"eTag": "\"4e7f66df4d52b49ef1da6e31b49320d8-1\"", "size": 52368, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:30:50.000Z", "contentLength": 52368, "httpStatusCode": 200}', '7b359392-cbb4-4497-b34f-00dea1aedb48', NULL, NULL),
	('2ce310e3-74d0-49d9-adc8-507aac2075f8', 'versus-assets', 'brands/netflix.png', NULL, '2026-02-14 22:37:37.209191+00', '2026-02-14 22:37:37.209191+00', '2026-02-14 22:37:37.209191+00', '{"eTag": "\"d7a241a5f0f12835241be51644e17aa4-1\"", "size": 76331, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 76331, "httpStatusCode": 200}', '1533beae-4a49-4026-9456-5d423d406d2d', NULL, NULL),
	('9d404cf5-64dd-4537-b088-8587831e6210', 'versus-assets', 'brands/adidas.png', NULL, '2026-02-14 22:37:37.229638+00', '2026-02-14 22:37:37.229638+00', '2026-02-14 22:37:37.229638+00', '{"eTag": "\"346586a19400f097f052e189381e6759-1\"", "size": 30953, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 30953, "httpStatusCode": 200}', '33143313-d403-4174-8ecb-de4b57e7b3a3', NULL, NULL),
	('6fd242ad-b40c-422c-9561-1542a6d0b88a', 'versus-assets', 'brands/nike.png', NULL, '2026-02-14 22:37:37.231017+00', '2026-02-14 22:37:37.231017+00', '2026-02-14 22:37:37.231017+00', '{"eTag": "\"62dd85e25d162d36c289d2bb97bc27cf-1\"", "size": 28193, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 28193, "httpStatusCode": 200}', '04b4d7bc-8628-4534-a3d7-529a4ab9b8af', NULL, NULL),
	('2a70b1fd-a10f-43dd-abee-f70429c2a01e', 'versus-assets', 'brands/cabify.png', NULL, '2026-02-14 22:37:37.232743+00', '2026-02-14 22:37:37.232743+00', '2026-02-14 22:37:37.232743+00', '{"eTag": "\"bba40e86c268c6054f8efa0aa18cf5d0-1\"", "size": 48692, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 48692, "httpStatusCode": 200}', 'c1c59042-1d1e-4841-a9ff-3c155a497e6a', NULL, NULL),
	('67b04fba-9d97-4c58-b07e-fce4e642310f', 'versus-assets', 'brands/apple.png', NULL, '2026-02-14 22:37:37.246289+00', '2026-02-14 22:37:37.246289+00', '2026-02-14 22:37:37.246289+00', '{"eTag": "\"456509f253c9c6135d44b7df69c88007-1\"", "size": 4531, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 4531, "httpStatusCode": 200}', '97c6299c-01d1-463a-afb3-893ae8b724cf', NULL, NULL),
	('fbed813d-11b2-4194-a307-e4041a6ab15d', 'versus-assets', 'brands/samsung.png', NULL, '2026-02-14 22:37:37.231873+00', '2026-02-14 22:37:37.231873+00', '2026-02-14 22:37:37.231873+00', '{"eTag": "\"ded96f68bf1839f361cd960877c119e9-1\"", "size": 95435, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 95435, "httpStatusCode": 200}', 'df3ec0f7-5317-43d5-b454-15664bf54562', NULL, NULL),
	('b7539d97-5a09-4387-b4cb-3589aff3c0d5', 'versus-assets', 'brands/prime.png', NULL, '2026-02-14 22:37:37.278614+00', '2026-02-14 22:37:37.278614+00', '2026-02-14 22:37:37.278614+00', '{"eTag": "\"7829f52fc7a0059a5608ff4bb1996bc4-1\"", "size": 24565, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 24565, "httpStatusCode": 200}', '45a78003-d796-4a9c-9cf0-17610674016f', NULL, NULL),
	('6c186e21-0fd0-4bae-b47c-9cf645ff28c1', 'versus-assets', 'brands/starbucks.png', NULL, '2026-02-14 22:37:37.318772+00', '2026-02-14 22:37:37.318772+00', '2026-02-14 22:37:37.318772+00', '{"eTag": "\"22e20926559d31cafde4c8490802255f-1\"", "size": 88932, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 88932, "httpStatusCode": 200}', '8f13fec8-3344-43cc-8118-df41cebe2678', NULL, NULL),
	('871430ef-34be-49af-9261-176f2a043046', 'versus-assets', 'brands/uber.png', NULL, '2026-02-14 22:37:37.479942+00', '2026-02-14 22:37:37.479942+00', '2026-02-14 22:37:37.479942+00', '{"eTag": "\"c56b3b6176f528528f32ddbb273656d9-1\"", "size": 12893, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-14T22:37:37.000Z", "contentLength": 12893, "httpStatusCode": 200}', '0b43dc22-5bd2-49d0-b8c6-23a127cb50d1', NULL, NULL);


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 229, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict nFjM6es09Jfg31ZwVy9fBvplghABt09outRZymidYUX6Q1lvfIByWTc6aZUBqQQ

RESET ALL;
