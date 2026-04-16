--
-- PostgreSQL database dump
--

\restrict kwp8fLSgISrZaIHGdaiY3qZTwCjbHbudVhyIMvMWfHoJCpKmLGFm2oyUm4RBHpD

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-04-16 20:45:56

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
-- TOC entry 5072 (class 0 OID 16738)
-- Dependencies: 230
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authors (id, first_name, last_name) FROM stdin;
1	Лев	Толстой
2	Федор	Достоевский
3	Михаил	Булгаков
4	Александр	Пушкин
5	Николай	Гоголь
\.


--
-- TOC entry 5063 (class 0 OID 16643)
-- Dependencies: 221
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (pages, id, title, publication_year) FROM stdin;
1274	1	Война и мир	1869
672	6	Преступление и наказание	1866
480	3	Мастер и Маргарита	1967
320	4	Капитанская дочка	1833
352	5	Мертвые души	1842
864	8	Анна Каренина	1877
\.


--
-- TOC entry 5061 (class 0 OID 16635)
-- Dependencies: 219
-- Data for Name: book_author; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_author (author_id, book_id) FROM stdin;
1	1
3	3
4	4
5	5
2	6
1	8
\.


--
-- TOC entry 5070 (class 0 OID 16717)
-- Dependencies: 228
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name) FROM stdin;
2	Роман
3	Драма
4	Поэма
5	Повесть
6	Фантастика
1	Русская классика
7	Философский роман
8	Исторический роман
9	Сатира
\.


--
-- TOC entry 5068 (class 0 OID 16709)
-- Dependencies: 226
-- Data for Name: book_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_category (book_id, category_id) FROM stdin;
1	1
1	2
1	8
1	7
6	1
6	2
6	3
3	1
3	2
3	9
4	4
4	1
5	2
5	5
5	1
5	9
8	1
8	2
\.


--
-- TOC entry 5067 (class 0 OID 16673)
-- Dependencies: 225
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, role) FROM stdin;
1	Роман	ADMIN
2	Анна	USER
3	Петр	USER
4	Мария	USER
\.


--
-- TOC entry 5074 (class 0 OID 16785)
-- Dependencies: 232
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, rating, text, book_id, user_id) FROM stdin;
\.


--
-- TOC entry 5065 (class 0 OID 16662)
-- Dependencies: 223
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (date, id, user_id, body, status) FROM stdin;
2026-03-03 20:32:40.779871	1	1	Система инициализирована	SUCCESS
2026-03-03 20:32:40.779871	2	1	Загружены пользователи	SUCCESS
2026-03-03 20:32:40.779871	3	1	Загружены авторы	SUCCESS
2026-03-03 20:32:40.779871	4	1	Загружены книги	SUCCESS
2026-03-03 20:32:40.779871	5	1	Тестовые данные успешно созданы	SUCCESS
2026-03-11 10:15:09.715847	6	1	Успешно создана книга: Преступление и наказание	SUCCESS
2026-03-11 11:01:12.038402	7	1	Попытка сохранить БЕЗ транзакции	IN_PROGRESS
2026-03-11 11:03:06.605614	9	1	Попытка сохранить БЕЗ транзакции	IN_PROGRESS
2026-03-11 16:33:11.905272	11	1	Неудачная попытка найти книгу: 152	FAILURE
2026-03-24 21:41:33.331843	12	1	Создана книга: Анна Каренина	SUCCESS
2026-03-25 15:24:20.069283	13	1	Создана книга: Анна Каренина	SUCCESS
2026-03-31 22:47:42.821275	14	1	Неудачная попытка найти книгу: 999999	FAILURE
2026-04-01 10:33:25.987576	15	1	Неудачная попытка найти книгу: 9999	FAILURE
2026-04-01 13:52:54.893834	16	1	Неудачная попытка найти книгу: 9000	FAILURE
2026-04-01 13:56:58.999236	17	1	Неудачная попытка найти книгу: 9000	FAILURE
\.


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 229
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.authors_id_seq', 6, true);


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 220
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_id_seq', 8, true);


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 227
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 9, true);


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 231
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 1004, true);


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 222
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_id_seq', 17, true);


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 224
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


-- Completed on 2026-04-16 20:45:57

--
-- PostgreSQL database dump complete
--

\unrestrict kwp8fLSgISrZaIHGdaiY3qZTwCjbHbudVhyIMvMWfHoJCpKmLGFm2oyUm4RBHpD

