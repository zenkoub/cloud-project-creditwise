--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Postgres.app)
-- Dumped by pg_dump version 17.2 (Postgres.app)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_history; Type: TABLE; Schema: public; Owner: gypprt
--

CREATE TABLE public.academic_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    term character varying(20) NOT NULL,
    term_gpa numeric(3,2),
    gpax numeric(3,2)
);


ALTER TABLE public.academic_history OWNER TO gypprt;

--
-- Name: academic_history_id_seq; Type: SEQUENCE; Schema: public; Owner: gypprt
--

CREATE SEQUENCE public.academic_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academic_history_id_seq OWNER TO gypprt;

--
-- Name: academic_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gypprt
--

ALTER SEQUENCE public.academic_history_id_seq OWNED BY public.academic_history.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: gypprt
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    credit integer NOT NULL,
    credit_format character varying(20),
    type character varying(50),
    track_id character varying(10),
    year integer,
    semester integer
);


ALTER TABLE public.courses OWNER TO gypprt;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: gypprt
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO gypprt;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gypprt
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: curriculum; Type: TABLE; Schema: public; Owner: gypprt
--

CREATE TABLE public.curriculum (
    id integer NOT NULL,
    code character varying(50),
    name text,
    credits integer,
    category text
);


ALTER TABLE public.curriculum OWNER TO gypprt;

--
-- Name: curriculum_id_seq; Type: SEQUENCE; Schema: public; Owner: gypprt
--

CREATE SEQUENCE public.curriculum_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.curriculum_id_seq OWNER TO gypprt;

--
-- Name: curriculum_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gypprt
--

ALTER SEQUENCE public.curriculum_id_seq OWNED BY public.curriculum.id;


--
-- Name: user_grades; Type: TABLE; Schema: public; Owner: gypprt
--

CREATE TABLE public.user_grades (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_code character varying(20) NOT NULL,
    grade character varying(5),
    credit integer,
    status character varying(20)
);


ALTER TABLE public.user_grades OWNER TO gypprt;

--
-- Name: user_grades_id_seq; Type: SEQUENCE; Schema: public; Owner: gypprt
--

CREATE SEQUENCE public.user_grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_grades_id_seq OWNER TO gypprt;

--
-- Name: user_grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gypprt
--

ALTER SEQUENCE public.user_grades_id_seq OWNED BY public.user_grades.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: gypprt
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100),
    role character varying(10) DEFAULT 'student'::character varying NOT NULL,
    track_id character varying(10),
    study_plan character varying(20),
    current_year integer,
    current_semester character varying(10)
);


ALTER TABLE public.users OWNER TO gypprt;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: gypprt
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO gypprt;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gypprt
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: academic_history id; Type: DEFAULT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.academic_history ALTER COLUMN id SET DEFAULT nextval('public.academic_history_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: curriculum id; Type: DEFAULT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.curriculum ALTER COLUMN id SET DEFAULT nextval('public.curriculum_id_seq'::regclass);


--
-- Name: user_grades id; Type: DEFAULT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.user_grades ALTER COLUMN id SET DEFAULT nextval('public.user_grades_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: academic_history; Type: TABLE DATA; Schema: public; Owner: gypprt
--

COPY public.academic_history (id, user_id, term, term_gpa, gpax) FROM stdin;
1	1	1/64	2.10	2.10
2	1	2/64	1.90	2.00
3	1	1/65	2.00	2.00
4	1	2/65	2.20	2.05
5	1	1/66	2.30	2.10
6	1	2/66	2.10	2.10
7	1	1/67	2.00	2.08
8	1	2/67	1.80	2.05
9	2	1/65	2.20	2.20
10	2	2/65	2.30	2.25
11	2	1/66	2.50	2.33
12	2	2/66	2.40	2.35
13	2	1/67	2.60	2.40
14	2	2/67	2.70	2.45
15	3	1/65	3.00	3.00
16	3	2/65	3.10	3.05
17	3	1/66	2.90	3.00
18	3	2/66 (Co-op)	0.00	3.00
19	3	1/67	3.20	3.03
20	3	2/67	3.00	3.02
21	4	1/65	3.80	3.80
22	4	2/65	3.70	3.75
23	4	1/66	3.90	3.80
24	4	2/66 (Co-op)	0.00	3.80
25	4	1/67	3.60	3.77
26	4	2/67	3.80	3.77
27	5	1/66	1.75	1.75
28	5	2/66	2.20	1.98
29	5	1/67	2.10	1.99
30	5	2/67	2.05	1.99
31	5	1/68	2.00	1.99
32	6	1/66	1.90	1.90
33	6	2/66	2.00	1.95
34	6	1/67	2.10	2.00
35	7	1/66	3.50	3.50
36	7	2/66	3.20	3.35
37	7	1/67	3.00	3.23
38	7	2/67	3.40	3.27
39	8	1/66	2.80	2.80
40	8	2/66	2.50	2.65
41	8	1/67	1.90	2.40
42	8	2/67	2.30	2.38
43	9	1/66	2.20	2.20
44	9	2/66	2.30	2.25
45	9	1/67	2.10	2.20
46	9	2/67	2.00	2.15
49	11	1/67	1.80	1.80
50	11	2/67	2.10	1.95
51	11	1/68	2.00	1.97
52	12	1/67	1.90	1.90
53	12	2/67	1.50	1.70
54	13	1/67	1.60	1.60
55	13	2/67	2.10	1.85
56	13	1/68	1.90	1.87
57	14	1/67	1.85	1.85
58	14	2/67	2.20	2.03
59	15	1/67	2.80	2.80
60	15	2/67	2.70	2.75
61	16	1/68	0.33	0.33
62	17	1/68	0.00	0.00
63	18	1/68	1.50	1.50
64	19	1/68	1.67	1.67
65	20	1/68	2.50	2.50
84	10	Year 1 Semester 1	3.25	3.25
85	10	Year 1 Semester 2	3.25	3.25
86	10	Year 3 Semester 1	1.00	3.00
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: gypprt
--

COPY public.courses (id, code, name, credit, credit_format, type, track_id, year, semester) FROM stdin;
778	06016402	INFORMATION TECHNOLOGY FUNDAMENTALS	3	3(3-0-6)	Core	ALL	1	1
779	06066303	PROBLEM SOLVING AND COMPUTER PROGRAMMING	3	3(3-0-6)	Core	ALL	1	1
780	06016411	INTRODUCTION TO COMPUTER SYSTEMS	3	3(3-0-6)	Core	ALL	1	1
781	90641001	CHARM SCHOOL	3	3(3-0-6)	Gen	ALL	1	1
782	90644007	FOUNDATION ENGLISH 1	3	3(3-0-6)	Gen	ALL	1	1
783	06016408	OBJECT-ORIENTED PROGRAMMING	3	3(3-0-6)	Core	ALL	1	2
784	06066001	PROBABILITY AND STATISTICS	3	3(3-0-6)	Core	ALL	1	2
785	06066101	BUSINESS FUNDAMENTALS FOR INFORMATION	3	3(3-0-6)	Core	ALL	1	2
786	06066301	DATA STRUCTURES AND ALGORITHMS	3	3(3-0-6)	Core	ALL	1	2
787	90641002	DIGITAL INTELLIGENCE QUOTIENT	3	3(3-0-6)	Gen	ALL	1	2
788	90644008	FOUNDATION ENGLISH 2	3	3(3-0-6)	Gen	ALL	1	2
789	06066000	DISCRETE MATHEMATICS	3	3(3-0-6)	Core	ALL	2	1
790	06066304	INFORMATION SYSTEM ANALYSIS AND DESIGN	3	3(3-0-6)	Core	ALL	2	1
791	06066300	DATABASE SYSTEM CONCEPTS	3	3(3-0-6)	Core	ALL	2	1
792	06016413	INTRODUCTION TO NETWORK SYSTEMS	3	3(3-0-6)	Core	ALL	2	1
793	06016409	PHYSICAL COMPUTING	3	3(3-0-6)	Core	ALL	2	1
794	06016403	MULTIMEDIA TECHNOLOGY	3	3(3-0-6)	Core	ALL	2	1
799	06016414	NOSQL DATABASE SYSTEMS	3	3(3-0-6)	Major	SD	2	2
800	06016415	FUNCTIONAL PROGRAMMING	3	3(3-0-6)	Major	SD	2	2
803	06016416	REQUIREMENT ENGINEERING	3	3(3-0-6)	Major	SD	3	1
804	06016417	SOFTWARE DEVELOPMENT TOOLS AND ENVIRONMENTS	3	3(3-0-6)	Major	SD	3	1
805	06016418	SERVER-SIDE WEB DEVELOPMENT	3	3(3-0-6)	Major	SD	3	1
813	06016419	COMMUNICATION NETWORK INFRASTRUCTURE	3	3(3-0-6)	Major	ITI	2	2
814	06016420	INFRASTRUCTURE SYSTEMS AND SERVICES	3	3(3-0-6)	Major	ITI	2	2
815	06016423	INFRASTRUCTURE PROGRAMMABILITY AND AUTOMATION	3	3(3-0-6)	Major	ITI	3	1
816	06016421	IT INFRASTRUCTURE SECURITY	3	3(3-0-6)	Major	ITI	3	1
817	06016422	INTERNET OF THINGS	3	3(3-0-6)	Major	ITI	3	1
818	06016424	HUMAN INTERFACE DESIGN	3	3(3-0-6)	Major	MM	2	2
819	06016425	VISUAL DESIGN FUNDAMENTALS	3	3(3-0-6)	Major	MM	2	2
820	06016426	COMPUTER GRAPHICS AND ANIMATION	3	3(3-0-6)	Major	MM	3	1
821	06016427	INTRODUCTION TO GAME DESIGN AND DEVELOPMENT	3	3(3-0-6)	Major	MM	3	1
822	06016429	SERVER-SIDE WEB DEVELOPMENT	3	3(3-0-6)	Major	MM	3	1
811	xxxxxxxx	FREE ELECTIVE 1	3	3(3-0-6)	Free_Elective	ALL	4	1
810	9064xxxx	ELECTIVE - GENERAL 1	3	3(3-0-6)	Gen_Elective	ALL	4	1
809	90643021	MODERN ENTREPRENEURS	3	3(3-0-6)	Gen	ALL	4	1
808	06016406	PROJECT 1	3	3(3-0-6)	Major	ALL	4	1
812	06016407	PROJECT 2	3	3(3-0-6)	Major	ALL	4	2
801	06016404	CLOUD COMPUTING	3	3(3-0-6)	Core	ALL	3	1
802	06066102	MANAGEMENT INFORMATION SYSTEMS	3	3(3-0-6)	Core	ALL	3	1
807	06016481	COOPERATIVE EDUCATION / ELECTIVE	6	6(3-0-6)	Major	ALL	3	2
795	06016405	CYBERSECURITY FUNDAMENTAL	3	3(3-0-6)	Core	ALL	2	2
796	06016410	SOFTWARE ENGINEERING	3	3(3-0-6)	Core	ALL	2	2
797	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	3	3(3-0-6)	Core	ALL	2	2
798	06066302	FUNDAMENTAL WEB PROGRAMMING	3	3(3-0-6)	Core	ALL	2	2
806	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	3	3(3-0-6)	Core	ALL	3	2
823	06016401	MATHEMATICS FOR INFORMATION TECHNOLOGY	3	3(3-0-6)	Core	ALL	1	1
\.


--
-- Data for Name: curriculum; Type: TABLE DATA; Schema: public; Owner: gypprt
--

COPY public.curriculum (id, code, name, credits, category) FROM stdin;
1	06016402	INFORMATION TECHNOLOGY FUNDAMENTALS	\N	CORE - Year 1 - Semester 1
2	06066303	PROBLEM SOLVING AND COMPUTER PROGRAMMING	\N	CORE - Year 1 - Semester 1
3	06016411	INTRODUCTION TO COMPUTER SYSTEMS	\N	CORE - Year 1 - Semester 1
4	90641001	CHARM SCHOOL	\N	CORE - Year 1 - Semester 1
5	90644007	FOUNDATION ENGLISH 1	\N	CORE - Year 1 - Semester 1
6	06016408	OBJECT-ORIENTED PROGRAMMING	\N	CORE - Year 1 - Semester 2
7	06066001	PROBABILITY AND STATISTICS	\N	CORE - Year 1 - Semester 2
8	06066101	BUSINESS FUNDAMENTALS FOR INFORMATION	\N	CORE - Year 1 - Semester 2
9	06066301	DATA STRUCTURES AND ALGORITHMS	\N	CORE - Year 1 - Semester 2
10	90641002	DIGITAL INTELLIGENCE QUOTIENT	\N	CORE - Year 1 - Semester 2
11	90644008	FOUNDATION ENGLISH 2	\N	CORE - Year 1 - Semester 2
12	06066000	DISCRETE MATHEMATICS	\N	CORE - Year 2 - Semester 1
13	06066304	INFORMATION SYSTEM ANALYSIS AND DESIGN	\N	CORE - Year 2 - Semester 1
14	06066300	DATABASE SYSTEM CONCEPTS	\N	CORE - Year 2 - Semester 1
15	06016413	INTRODUCTION TO NETWORK SYSTEMS	\N	CORE - Year 2 - Semester 1
16	06016409	PHYSICAL COMPUTING	\N	CORE - Year 2 - Semester 1
17	06016403	MULTIMEDIA TECHNOLOGY	\N	CORE - Year 2 - Semester 1
18	06016405	CYBERSECURITY FUNDAMENTAL	\N	SD - Year 2 - Semester 2
19	06016410	SOFTWARE ENGINEERING	\N	SD - Year 2 - Semester 2
20	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	SD - Year 2 - Semester 2
21	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	SD - Year 2 - Semester 2
22	06016414	NOSQL DATABASE SYSTEMS	\N	SD - Year 2 - Semester 2
23	06016415	FUNCTIONAL PROGRAMMING	\N	SD - Year 2 - Semester 2
24	06016404	CLOUD COMPUTING	\N	SD - Year 3 - Semester 1
25	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	SD - Year 3 - Semester 1
26	06016416	REQUIREMENT ENGINEERING	\N	SD - Year 3 - Semester 1
27	06016417	SOFTWARE DEVELOPMENT TOOLS AND ENVIRONMENTS	\N	SD - Year 3 - Semester 1
28	06016418	SERVER-SIDE WEB DEVELOPMENT	\N	SD - Year 3 - Semester 1
29	90644xxx	Elective - Language and Communication	\N	SD - Year 3 - Semester 1
30	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	SD - Year 3 - Semester 2 (Non-Co-op)
31	060164xx	Elective Course in Information Technology 1	\N	SD - Year 3 - Semester 2 (Non-Co-op)
32	060164xx	Elective Course in Information Technology 2	\N	SD - Year 3 - Semester 2 (Non-Co-op)
33	06016481	COOPERATIVE EDUCATION	\N	SD - Year 3 - Semester 2 (Co-op)
34	06016406	PROJECT 1	\N	SD - Year 4 - Semester 1 (Non-Co-op)
35	90643021	MODERN ENTREPRENEURS	\N	SD - Year 4 - Semester 1 (Non-Co-op)
36	060164xx	Elective Course in Information Technology 3	\N	SD - Year 4 - Semester 1 (Non-Co-op)
37	9064xxxx	Elective - General 1	\N	SD - Year 4 - Semester 1 (Non-Co-op)
38	xxxxxxxx	Free Elective 1	\N	SD - Year 4 - Semester 1 (Non-Co-op)
39	06016407	PROJECT 2	\N	SD - Year 4 - Semester 2 (Non-Co-op)
40	9064xxxx	Elective - General 2	\N	SD - Year 4 - Semester 2 (Non-Co-op)
41	xxxxxxxx	Free Elective 2	\N	SD - Year 4 - Semester 2 (Non-Co-op)
42	06016407	PROJECT 2	\N	SD - Year 4 - Semester 2 (Co-op)
43	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	SD - Year 4 - Semester 2 (Co-op)
44	90642033	LAW FOR NEW GENERATION	\N	SD - Year 4 - Semester 2 (Co-op)
45	90644042	PROFESSIONAL COMMUNICATION AND PRESENTATION	\N	SD - Year 4 - Semester 2 (Co-op)
46	9064xxxx	Elective - General 2	\N	SD - Year 4 - Semester 2 (Co-op)
47	06016405	CYBERSECURITY FUNDAMENTAL	\N	ITI - Year 2 - Semester 2
48	06016410	SOFTWARE ENGINEERING	\N	ITI - Year 2 - Semester 2
49	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	ITI - Year 2 - Semester 2
50	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	ITI - Year 2 - Semester 2
51	06016419	COMMUNICATION NETWORK INFRASTRUCTURE	\N	ITI - Year 2 - Semester 2
52	06016420	INFRASTRUCTURE SYSTEMS AND SERVICES	\N	ITI - Year 2 - Semester 2
53	06016404	CLOUD COMPUTING	\N	ITI - Year 3 - Semester 1
54	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	ITI - Year 3 - Semester 1
55	06016423	INFRASTRUCTURE PROGRAMMABILITY AND AUTOMATION	\N	ITI - Year 3 - Semester 1
56	06016421	INFORMATION TECHNOLOGY INFRASTRUCTURE SECURITY	\N	ITI - Year 3 - Semester 1
57	06016422	INTERNET OF THINGS	\N	ITI - Year 3 - Semester 1
58	90644xxx	Elective - Language and Communication	\N	ITI - Year 3 - Semester 1
59	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	ITI - Year 3 - Semester 2 (Non-Co-op)
60	060164xx	Elective Course in Information Technology 1	\N	ITI - Year 3 - Semester 2 (Non-Co-op)
61	060164xx	Elective Course in Information Technology 2	\N	ITI - Year 3 - Semester 2 (Non-Co-op)
62	06016481	COOPERATIVE EDUCATION	\N	ITI - Year 3 - Semester 2 (Co-op)
63	06016406	PROJECT 1	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
64	90643021	MODERN ENTREPRENEURS	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
65	060164xx	Elective Course in Information Technology 3	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
66	9064xxxx	Elective - General 1	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
67	xxxxxxxx	Free Elective 1	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
68	06016407	PROJECT 2	\N	ITI - Year 4 - Semester 2 (Non-Co-op)
69	9064xxxx	Elective - General 2	\N	ITI - Year 4 - Semester 2 (Non-Co-op)
70	xxxxxxxx	Free Elective 2	\N	ITI - Year 4 - Semester 2 (Non-Co-op)
71	06016407	PROJECT 2	\N	ITI - Year 4 - Semester 2 (Co-op)
72	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	ITI - Year 4 - Semester 2 (Co-op)
73	90642033	LAW FOR NEW GENERATION	\N	ITI - Year 4 - Semester 2 (Co-op)
74	90644042	PROFESSIONAL COMMUNICATION AND PRESENTATION	\N	ITI - Year 4 - Semester 2 (Co-op)
75	9064xxxx	Elective - General 2	\N	ITI - Year 4 - Semester 2 (Co-op)
76	06016405	CYBERSECURITY FUNDAMENTAL	\N	MM - Year 2 - Semester 2
77	06016410	SOFTWARE ENGINEERING	\N	MM - Year 2 - Semester 2
78	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	MM - Year 2 - Semester 2
79	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	MM - Year 2 - Semester 2
80	06016424	HUMAN INTERFACE DESIGN	\N	MM - Year 2 - Semester 2
81	06016425	VISUAL DESIGN FUNDAMENTALS FOR INTERACTIVE MEDIA	\N	MM - Year 2 - Semester 2
82	06016404	CLOUD COMPUTING	\N	MM - Year 3 - Semester 1
83	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	MM - Year 3 - Semester 1
84	06016426	COMPUTER GRAPHICS AND ANIMATION	\N	MM - Year 3 - Semester 1
85	06016427	INTRODUCTION TO GAME DESIGN AND DEVELOPMENT	\N	MM - Year 3 - Semester 1
86	06016428	VISUAL DESIGN FUNDAMENTALS FOR INTERACTIVE MEDIA	\N	MM - Year 3 - Semester 1
87	06016429	SERVER-SIDE WEB DEVELOPMENT	\N	MM - Year 3 - Semester 1
88	90644xxx	Elective - Language and Communication	\N	MM - Year 3 - Semester 1
89	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	MM - Year 3 - Semester 2 (Non-Co-op)
90	060164xx	Elective Course in Information Technology 1	\N	MM - Year 3 - Semester 2 (Non-Co-op)
91	060164xx	Elective Course in Information Technology 2	\N	MM - Year 3 - Semester 2 (Non-Co-op)
92	06016481	COOPERATIVE EDUCATION	\N	MM - Year 3 - Semester 2 (Co-op)
93	06016406	PROJECT 1	\N	MM - Year 4 - Semester 1 (Non-Co-op)
94	90643021	MODERN ENTREPRENEURS	\N	MM - Year 4 - Semester 1 (Non-Co-op)
95	060164xx	Elective Course in Information Technology 3	\N	MM - Year 4 - Semester 1 (Non-Co-op)
96	9064xxxx	Elective - General 1	\N	MM - Year 4 - Semester 1 (Non-Co-op)
97	xxxxxxxx	Free Elective 1	\N	MM - Year 4 - Semester 1 (Non-Co-op)
98	06016407	PROJECT 2	\N	MM - Year 4 - Semester 2 (Non-Co-op)
99	9064xxxx	Elective - General 2	\N	MM - Year 4 - Semester 2 (Non-Co-op)
100	xxxxxxxx	Free Elective 2	\N	MM - Year 4 - Semester 2 (Non-Co-op)
101	06016407	PROJECT 2	\N	MM - Year 4 - Semester 2 (Co-op)
102	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	MM - Year 4 - Semester 2 (Co-op)
103	90642033	LAW FOR NEW GENERATION	\N	MM - Year 4 - Semester 2 (Co-op)
104	90644042	PROFESSIONAL COMMUNICATION AND PRESENTATION	\N	MM - Year 4 - Semester 2 (Co-op)
105	9064xxxx	Elective - General 2	\N	MM - Year 4 - Semester 2 (Co-op)
106	06016402	INFORMATION TECHNOLOGY FUNDAMENTALS	\N	CORE - Year 1 - Semester 1
107	06066303	PROBLEM SOLVING AND COMPUTER PROGRAMMING	\N	CORE - Year 1 - Semester 1
108	06016411	INTRODUCTION TO COMPUTER SYSTEMS	\N	CORE - Year 1 - Semester 1
109	90641001	CHARM SCHOOL	\N	CORE - Year 1 - Semester 1
110	90644007	FOUNDATION ENGLISH 1	\N	CORE - Year 1 - Semester 1
111	06016408	OBJECT-ORIENTED PROGRAMMING	\N	CORE - Year 1 - Semester 2
112	06066001	PROBABILITY AND STATISTICS	\N	CORE - Year 1 - Semester 2
113	06066101	BUSINESS FUNDAMENTALS FOR INFORMATION	\N	CORE - Year 1 - Semester 2
114	06066301	DATA STRUCTURES AND ALGORITHMS	\N	CORE - Year 1 - Semester 2
115	90641002	DIGITAL INTELLIGENCE QUOTIENT	\N	CORE - Year 1 - Semester 2
116	90644008	FOUNDATION ENGLISH 2	\N	CORE - Year 1 - Semester 2
117	06066000	DISCRETE MATHEMATICS	\N	CORE - Year 2 - Semester 1
118	06066304	INFORMATION SYSTEM ANALYSIS AND DESIGN	\N	CORE - Year 2 - Semester 1
119	06066300	DATABASE SYSTEM CONCEPTS	\N	CORE - Year 2 - Semester 1
120	06016413	INTRODUCTION TO NETWORK SYSTEMS	\N	CORE - Year 2 - Semester 1
121	06016409	PHYSICAL COMPUTING	\N	CORE - Year 2 - Semester 1
122	06016403	MULTIMEDIA TECHNOLOGY	\N	CORE - Year 2 - Semester 1
123	06016405	CYBERSECURITY FUNDAMENTAL	\N	SD - Year 2 - Semester 2
124	06016410	SOFTWARE ENGINEERING	\N	SD - Year 2 - Semester 2
125	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	SD - Year 2 - Semester 2
126	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	SD - Year 2 - Semester 2
127	06016414	NOSQL DATABASE SYSTEMS	\N	SD - Year 2 - Semester 2
128	06016415	FUNCTIONAL PROGRAMMING	\N	SD - Year 2 - Semester 2
129	06016404	CLOUD COMPUTING	\N	SD - Year 3 - Semester 1
130	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	SD - Year 3 - Semester 1
131	06016416	REQUIREMENT ENGINEERING	\N	SD - Year 3 - Semester 1
132	06016417	SOFTWARE DEVELOPMENT TOOLS AND ENVIRONMENTS	\N	SD - Year 3 - Semester 1
133	06016418	SERVER-SIDE WEB DEVELOPMENT	\N	SD - Year 3 - Semester 1
134	90644xxx	Elective - Language and Communication	\N	SD - Year 3 - Semester 1
135	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	SD - Year 3 - Semester 2 (Non-Co-op)
136	060164xx	Elective Course in Information Technology 1	\N	SD - Year 3 - Semester 2 (Non-Co-op)
137	060164xx	Elective Course in Information Technology 2	\N	SD - Year 3 - Semester 2 (Non-Co-op)
138	06016481	COOPERATIVE EDUCATION	\N	SD - Year 3 - Semester 2 (Co-op)
139	06016406	PROJECT 1	\N	SD - Year 4 - Semester 1 (Non-Co-op)
140	90643021	MODERN ENTREPRENEURS	\N	SD - Year 4 - Semester 1 (Non-Co-op)
141	060164xx	Elective Course in Information Technology 3	\N	SD - Year 4 - Semester 1 (Non-Co-op)
142	9064xxxx	Elective - General 1	\N	SD - Year 4 - Semester 1 (Non-Co-op)
143	xxxxxxxx	Free Elective 1	\N	SD - Year 4 - Semester 1 (Non-Co-op)
144	06016407	PROJECT 2	\N	SD - Year 4 - Semester 2 (Non-Co-op)
145	9064xxxx	Elective - General 2	\N	SD - Year 4 - Semester 2 (Non-Co-op)
146	xxxxxxxx	Free Elective 2	\N	SD - Year 4 - Semester 2 (Non-Co-op)
147	06016407	PROJECT 2	\N	SD - Year 4 - Semester 2 (Co-op)
148	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	SD - Year 4 - Semester 2 (Co-op)
149	90642033	LAW FOR NEW GENERATION	\N	SD - Year 4 - Semester 2 (Co-op)
150	90644042	PROFESSIONAL COMMUNICATION AND PRESENTATION	\N	SD - Year 4 - Semester 2 (Co-op)
151	9064xxxx	Elective - General 2	\N	SD - Year 4 - Semester 2 (Co-op)
152	06016405	CYBERSECURITY FUNDAMENTAL	\N	ITI - Year 2 - Semester 2
153	06016410	SOFTWARE ENGINEERING	\N	ITI - Year 2 - Semester 2
154	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	ITI - Year 2 - Semester 2
155	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	ITI - Year 2 - Semester 2
156	06016419	COMMUNICATION NETWORK INFRASTRUCTURE	\N	ITI - Year 2 - Semester 2
157	06016420	INFRASTRUCTURE SYSTEMS AND SERVICES	\N	ITI - Year 2 - Semester 2
158	06016404	CLOUD COMPUTING	\N	ITI - Year 3 - Semester 1
159	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	ITI - Year 3 - Semester 1
160	06016423	INFRASTRUCTURE PROGRAMMABILITY AND AUTOMATION	\N	ITI - Year 3 - Semester 1
161	06016421	INFORMATION TECHNOLOGY INFRASTRUCTURE SECURITY	\N	ITI - Year 3 - Semester 1
162	06016422	INTERNET OF THINGS	\N	ITI - Year 3 - Semester 1
163	90644xxx	Elective - Language and Communication	\N	ITI - Year 3 - Semester 1
164	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	ITI - Year 3 - Semester 2 (Non-Co-op)
165	060164xx	Elective Course in Information Technology 1	\N	ITI - Year 3 - Semester 2 (Non-Co-op)
166	060164xx	Elective Course in Information Technology 2	\N	ITI - Year 3 - Semester 2 (Non-Co-op)
167	06016481	COOPERATIVE EDUCATION	\N	ITI - Year 3 - Semester 2 (Co-op)
168	06016406	PROJECT 1	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
169	90643021	MODERN ENTREPRENEURS	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
170	060164xx	Elective Course in Information Technology 3	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
171	9064xxxx	Elective - General 1	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
172	xxxxxxxx	Free Elective 1	\N	ITI - Year 4 - Semester 1 (Non-Co-op)
173	06016407	PROJECT 2	\N	ITI - Year 4 - Semester 2 (Non-Co-op)
174	9064xxxx	Elective - General 2	\N	ITI - Year 4 - Semester 2 (Non-Co-op)
175	xxxxxxxx	Free Elective 2	\N	ITI - Year 4 - Semester 2 (Non-Co-op)
176	06016407	PROJECT 2	\N	ITI - Year 4 - Semester 2 (Co-op)
177	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	ITI - Year 4 - Semester 2 (Co-op)
178	90642033	LAW FOR NEW GENERATION	\N	ITI - Year 4 - Semester 2 (Co-op)
179	90644042	PROFESSIONAL COMMUNICATION AND PRESENTATION	\N	ITI - Year 4 - Semester 2 (Co-op)
180	9064xxxx	Elective - General 2	\N	ITI - Year 4 - Semester 2 (Co-op)
181	06016405	CYBERSECURITY FUNDAMENTAL	\N	MM - Year 2 - Semester 2
182	06016410	SOFTWARE ENGINEERING	\N	MM - Year 2 - Semester 2
183	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	MM - Year 2 - Semester 2
184	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	MM - Year 2 - Semester 2
185	06016424	HUMAN INTERFACE DESIGN	\N	MM - Year 2 - Semester 2
186	06016425	VISUAL DESIGN FUNDAMENTALS FOR INTERACTIVE MEDIA	\N	MM - Year 2 - Semester 2
187	06016404	CLOUD COMPUTING	\N	MM - Year 3 - Semester 1
188	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	MM - Year 3 - Semester 1
189	06016426	COMPUTER GRAPHICS AND ANIMATION	\N	MM - Year 3 - Semester 1
190	06016427	INTRODUCTION TO GAME DESIGN AND DEVELOPMENT	\N	MM - Year 3 - Semester 1
191	06016428	VISUAL DESIGN FUNDAMENTALS FOR INTERACTIVE MEDIA	\N	MM - Year 3 - Semester 1
192	06016429	SERVER-SIDE WEB DEVELOPMENT	\N	MM - Year 3 - Semester 1
193	90644xxx	Elective - Language and Communication	\N	MM - Year 3 - Semester 1
194	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	MM - Year 3 - Semester 2 (Non-Co-op)
195	060164xx	Elective Course in Information Technology 1	\N	MM - Year 3 - Semester 2 (Non-Co-op)
196	060164xx	Elective Course in Information Technology 2	\N	MM - Year 3 - Semester 2 (Non-Co-op)
197	06016481	COOPERATIVE EDUCATION	\N	MM - Year 3 - Semester 2 (Co-op)
198	06016406	PROJECT 1	\N	MM - Year 4 - Semester 1 (Non-Co-op)
199	90643021	MODERN ENTREPRENEURS	\N	MM - Year 4 - Semester 1 (Non-Co-op)
200	060164xx	Elective Course in Information Technology 3	\N	MM - Year 4 - Semester 1 (Non-Co-op)
201	9064xxxx	Elective - General 1	\N	MM - Year 4 - Semester 1 (Non-Co-op)
202	xxxxxxxx	Free Elective 1	\N	MM - Year 4 - Semester 1 (Non-Co-op)
203	06016407	PROJECT 2	\N	MM - Year 4 - Semester 2 (Non-Co-op)
204	9064xxxx	Elective - General 2	\N	MM - Year 4 - Semester 2 (Non-Co-op)
205	xxxxxxxx	Free Elective 2	\N	MM - Year 4 - Semester 2 (Non-Co-op)
206	06016407	PROJECT 2	\N	MM - Year 4 - Semester 2 (Co-op)
207	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	MM - Year 4 - Semester 2 (Co-op)
208	90642033	LAW FOR NEW GENERATION	\N	MM - Year 4 - Semester 2 (Co-op)
209	90644042	PROFESSIONAL COMMUNICATION AND PRESENTATION	\N	MM - Year 4 - Semester 2 (Co-op)
210	9064xxxx	Elective - General 2	\N	MM - Year 4 - Semester 2 (Co-op)
211	06016402	INFORMATION TECHNOLOGY FUNDAMENTALS	\N	CORE - Year 1 - Semester 1
212	06066303	PROBLEM SOLVING AND COMPUTER PROGRAMMING	\N	CORE - Year 1 - Semester 1
213	06016411	INTRODUCTION TO COMPUTER SYSTEMS	\N	CORE - Year 1 - Semester 1
214	90641001	CHARM SCHOOL	\N	CORE - Year 1 - Semester 1
215	90644007	FOUNDATION ENGLISH 1	\N	CORE - Year 1 - Semester 1
216	06016408	OBJECT-ORIENTED PROGRAMMING	\N	CORE - Year 1 - Semester 2
217	06066001	PROBABILITY AND STATISTICS	\N	CORE - Year 1 - Semester 2
218	06066101	BUSINESS FUNDAMENTALS FOR INFORMATION	\N	CORE - Year 1 - Semester 2
219	06066301	DATA STRUCTURES AND ALGORITHMS	\N	CORE - Year 1 - Semester 2
220	90641002	DIGITAL INTELLIGENCE QUOTIENT	\N	CORE - Year 1 - Semester 2
221	90644008	FOUNDATION ENGLISH 2	\N	CORE - Year 1 - Semester 2
222	06066000	DISCRETE MATHEMATICS	\N	CORE - Year 2 - Semester 1
223	06066304	INFORMATION SYSTEM ANALYSIS AND DESIGN	\N	CORE - Year 2 - Semester 1
224	06066300	DATABASE SYSTEM CONCEPTS	\N	CORE - Year 2 - Semester 1
225	06016413	INTRODUCTION TO NETWORK SYSTEMS	\N	CORE - Year 2 - Semester 1
226	06016409	PHYSICAL COMPUTING	\N	CORE - Year 2 - Semester 1
227	06016403	MULTIMEDIA TECHNOLOGY	\N	CORE - Year 2 - Semester 1
228	06016405	CYBERSECURITY FUNDAMENTAL	\N	SD - Year 2 - Semester 2
229	06016410	SOFTWARE ENGINEERING	\N	SD - Year 2 - Semester 2
230	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	SD - Year 2 - Semester 2
231	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	SD - Year 2 - Semester 2
232	06016414	NOSQL DATABASE SYSTEMS	\N	SD - Year 2 - Semester 2
233	06016415	FUNCTIONAL PROGRAMMING	\N	SD - Year 2 - Semester 2
234	06016404	CLOUD COMPUTING	\N	SD - Year 3 - Semester 1
235	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	SD - Year 3 - Semester 1
236	06016416	REQUIREMENT ENGINEERING	\N	SD - Year 3 - Semester 1
237	06016417	SOFTWARE DEVELOPMENT TOOLS AND ENVIRONMENTS	\N	SD - Year 3 - Semester 1
238	06016418	SERVER-SIDE WEB DEVELOPMENT	\N	SD - Year 3 - Semester 1
239	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	SD - Year 3 - Semester 2
240	06016481	COOPERATIVE EDUCATION / ELECTIVE	\N	SD - Year 3 - Semester 2
241	06016406	PROJECT 1	\N	SD - Year 4 - Semester 1
242	90643021	MODERN ENTREPRENEURS	\N	SD - Year 4 - Semester 1
243	9064xxxx	ELECTIVE - GENERAL 1	\N	SD - Year 4 - Semester 1
244	xxxxxxxx	FREE ELECTIVE 1	\N	SD - Year 4 - Semester 1
245	06016407	PROJECT 2	\N	SD - Year 4 - Semester 2
246	9064xxxx	ELECTIVE - GENERAL 2	\N	SD - Year 4 - Semester 2
247	xxxxxxxx	FREE ELECTIVE 2	\N	SD - Year 4 - Semester 2
248	06016405	CYBERSECURITY FUNDAMENTAL	\N	ITI - Year 2 - Semester 2
249	06016410	SOFTWARE ENGINEERING	\N	ITI - Year 2 - Semester 2
250	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	ITI - Year 2 - Semester 2
251	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	ITI - Year 2 - Semester 2
252	06016419	COMMUNICATION NETWORK INFRASTRUCTURE	\N	ITI - Year 2 - Semester 2
253	06016420	INFRASTRUCTURE SYSTEMS AND SERVICES	\N	ITI - Year 2 - Semester 2
254	06016404	CLOUD COMPUTING	\N	ITI - Year 3 - Semester 1
255	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	ITI - Year 3 - Semester 1
256	06016423	INFRASTRUCTURE PROGRAMMABILITY AND AUTOMATION	\N	ITI - Year 3 - Semester 1
257	06016421	IT INFRASTRUCTURE SECURITY	\N	ITI - Year 3 - Semester 1
258	06016422	INTERNET OF THINGS	\N	ITI - Year 3 - Semester 1
259	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	ITI - Year 3 - Semester 2
260	06016481	COOPERATIVE EDUCATION / ELECTIVE	\N	ITI - Year 3 - Semester 2
261	06016406	PROJECT 1	\N	ITI - Year 4 - Semester 1
262	90643021	MODERN ENTREPRENEURS	\N	ITI - Year 4 - Semester 1
263	06016407	PROJECT 2	\N	ITI - Year 4 - Semester 2
264	06016405	CYBERSECURITY FUNDAMENTAL	\N	MM - Year 2 - Semester 2
265	06016410	SOFTWARE ENGINEERING	\N	MM - Year 2 - Semester 2
266	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	MM - Year 2 - Semester 2
267	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	MM - Year 2 - Semester 2
268	06016424	HUMAN INTERFACE DESIGN	\N	MM - Year 2 - Semester 2
269	06016425	VISUAL DESIGN FUNDAMENTALS	\N	MM - Year 2 - Semester 2
270	06016404	CLOUD COMPUTING	\N	MM - Year 3 - Semester 1
271	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	MM - Year 3 - Semester 1
272	06016426	COMPUTER GRAPHICS AND ANIMATION	\N	MM - Year 3 - Semester 1
273	06016427	INTRODUCTION TO GAME DESIGN AND DEVELOPMENT	\N	MM - Year 3 - Semester 1
274	06016429	SERVER-SIDE WEB DEVELOPMENT	\N	MM - Year 3 - Semester 1
275	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	MM - Year 3 - Semester 2
276	06016481	COOPERATIVE EDUCATION / ELECTIVE	\N	MM - Year 3 - Semester 2
277	06016406	PROJECT 1	\N	MM - Year 4 - Semester 1
278	90643021	MODERN ENTREPRENEURS	\N	MM - Year 4 - Semester 1
279	06016407	PROJECT 2	\N	MM - Year 4 - Semester 2
280	06016402	INFORMATION TECHNOLOGY FUNDAMENTALS	\N	CORE - Year 1 - Semester 1
281	06066303	PROBLEM SOLVING AND COMPUTER PROGRAMMING	\N	CORE - Year 1 - Semester 1
282	06016411	INTRODUCTION TO COMPUTER SYSTEMS	\N	CORE - Year 1 - Semester 1
283	90641001	CHARM SCHOOL	\N	CORE - Year 1 - Semester 1
284	90644007	FOUNDATION ENGLISH 1	\N	CORE - Year 1 - Semester 1
285	06016408	OBJECT-ORIENTED PROGRAMMING	\N	CORE - Year 1 - Semester 2
286	06066001	PROBABILITY AND STATISTICS	\N	CORE - Year 1 - Semester 2
287	06066101	BUSINESS FUNDAMENTALS FOR INFORMATION	\N	CORE - Year 1 - Semester 2
288	06066301	DATA STRUCTURES AND ALGORITHMS	\N	CORE - Year 1 - Semester 2
289	90641002	DIGITAL INTELLIGENCE QUOTIENT	\N	CORE - Year 1 - Semester 2
290	90644008	FOUNDATION ENGLISH 2	\N	CORE - Year 1 - Semester 2
291	06066000	DISCRETE MATHEMATICS	\N	CORE - Year 2 - Semester 1
292	06066304	INFORMATION SYSTEM ANALYSIS AND DESIGN	\N	CORE - Year 2 - Semester 1
293	06066300	DATABASE SYSTEM CONCEPTS	\N	CORE - Year 2 - Semester 1
294	06016413	INTRODUCTION TO NETWORK SYSTEMS	\N	CORE - Year 2 - Semester 1
295	06016409	PHYSICAL COMPUTING	\N	CORE - Year 2 - Semester 1
296	06016403	MULTIMEDIA TECHNOLOGY	\N	CORE - Year 2 - Semester 1
297	06016405	CYBERSECURITY FUNDAMENTAL	\N	SD - Year 2 - Semester 2
298	06016410	SOFTWARE ENGINEERING	\N	SD - Year 2 - Semester 2
299	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	SD - Year 2 - Semester 2
300	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	SD - Year 2 - Semester 2
301	06016414	NOSQL DATABASE SYSTEMS	\N	SD - Year 2 - Semester 2
302	06016415	FUNCTIONAL PROGRAMMING	\N	SD - Year 2 - Semester 2
303	06016404	CLOUD COMPUTING	\N	SD - Year 3 - Semester 1
304	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	SD - Year 3 - Semester 1
305	06016416	REQUIREMENT ENGINEERING	\N	SD - Year 3 - Semester 1
306	06016417	SOFTWARE DEVELOPMENT TOOLS AND ENVIRONMENTS	\N	SD - Year 3 - Semester 1
307	06016418	SERVER-SIDE WEB DEVELOPMENT	\N	SD - Year 3 - Semester 1
308	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	SD - Year 3 - Semester 2
309	06016481	COOPERATIVE EDUCATION / ELECTIVE	\N	SD - Year 3 - Semester 2
310	06016406	PROJECT 1	\N	SD - Year 4 - Semester 1
311	90643021	MODERN ENTREPRENEURS	\N	SD - Year 4 - Semester 1
312	9064xxxx	ELECTIVE - GENERAL 1	\N	SD - Year 4 - Semester 1
313	xxxxxxxx	FREE ELECTIVE 1	\N	SD - Year 4 - Semester 1
314	06016407	PROJECT 2	\N	SD - Year 4 - Semester 2
315	9064xxxx	ELECTIVE - GENERAL 2	\N	SD - Year 4 - Semester 2
316	xxxxxxxx	FREE ELECTIVE 2	\N	SD - Year 4 - Semester 2
317	06016405	CYBERSECURITY FUNDAMENTAL	\N	ITI - Year 2 - Semester 2
318	06016410	SOFTWARE ENGINEERING	\N	ITI - Year 2 - Semester 2
319	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	ITI - Year 2 - Semester 2
320	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	ITI - Year 2 - Semester 2
321	06016419	COMMUNICATION NETWORK INFRASTRUCTURE	\N	ITI - Year 2 - Semester 2
322	06016420	INFRASTRUCTURE SYSTEMS AND SERVICES	\N	ITI - Year 2 - Semester 2
323	06016404	CLOUD COMPUTING	\N	ITI - Year 3 - Semester 1
324	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	ITI - Year 3 - Semester 1
325	06016423	INFRASTRUCTURE PROGRAMMABILITY AND AUTOMATION	\N	ITI - Year 3 - Semester 1
326	06016421	IT INFRASTRUCTURE SECURITY	\N	ITI - Year 3 - Semester 1
327	06016422	INTERNET OF THINGS	\N	ITI - Year 3 - Semester 1
328	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	ITI - Year 3 - Semester 2
329	06016481	COOPERATIVE EDUCATION / ELECTIVE	\N	ITI - Year 3 - Semester 2
330	06016406	PROJECT 1	\N	ITI - Year 4 - Semester 1
331	90643021	MODERN ENTREPRENEURS	\N	ITI - Year 4 - Semester 1
332	06016407	PROJECT 2	\N	ITI - Year 4 - Semester 2
333	06016405	CYBERSECURITY FUNDAMENTAL	\N	MM - Year 2 - Semester 2
334	06016410	SOFTWARE ENGINEERING	\N	MM - Year 2 - Semester 2
335	06016412	COMPUTER ORGANIZATION AND OPERATING SYSTEM	\N	MM - Year 2 - Semester 2
336	06066302	FUNDAMENTAL WEB PROGRAMMING	\N	MM - Year 2 - Semester 2
337	06016424	HUMAN INTERFACE DESIGN	\N	MM - Year 2 - Semester 2
338	06016425	VISUAL DESIGN FUNDAMENTALS	\N	MM - Year 2 - Semester 2
339	06016404	CLOUD COMPUTING	\N	MM - Year 3 - Semester 1
340	06066102	MANAGEMENT INFORMATION SYSTEMS	\N	MM - Year 3 - Semester 1
341	06016426	COMPUTER GRAPHICS AND ANIMATION	\N	MM - Year 3 - Semester 1
342	06016427	INTRODUCTION TO GAME DESIGN AND DEVELOPMENT	\N	MM - Year 3 - Semester 1
343	06016429	SERVER-SIDE WEB DEVELOPMENT	\N	MM - Year 3 - Semester 1
344	06066100	INFORMATION TECHNOLOGY PROJECT MANAGEMENT	\N	MM - Year 3 - Semester 2
345	06016481	COOPERATIVE EDUCATION / ELECTIVE	\N	MM - Year 3 - Semester 2
346	06016406	PROJECT 1	\N	MM - Year 4 - Semester 1
347	90643021	MODERN ENTREPRENEURS	\N	MM - Year 4 - Semester 1
348	06016407	PROJECT 2	\N	MM - Year 4 - Semester 2
\.


--
-- Data for Name: user_grades; Type: TABLE DATA; Schema: public; Owner: gypprt
--

COPY public.user_grades (id, user_id, course_code, grade, credit, status) FROM stdin;
1	1	06016407	F	\N	Failed
2	3	06016481	S	\N	Passed
3	7	06016404	A	\N	Passed
4	7	06066102	B+	\N	Passed
5	8	06066000	F	\N	Failed
6	8	06016413	W	\N	Withdrawn
9	10	06016402	A	\N	Passed
10	10	06066303	B+	\N	Passed
12	10	06016408	B	\N	Passed
13	10	06066001	C+	\N	Passed
14	16	06016402	F	\N	Failed
15	16	06066303	F	\N	Failed
16	16	06016411	D	\N	Passed
17	17	06016402	F	\N	Failed
18	17	06066303	F	\N	Failed
19	17	06016411	F	\N	Failed
20	18	06016402	C	\N	Passed
21	18	06066303	D	\N	Passed
22	18	06016411	D+	\N	Passed
23	19	06016402	B	\N	Passed
24	19	06066303	F	\N	Failed
25	19	06016411	C	\N	Passed
27	10	06066101	A	\N	Passed
28	10	06066301	B+	\N	Passed
11	10	06016411	A	\N	Passed
7	10	90641001	S	3	Passed
8	10	90644007	S	3	Passed
32	10	06016401	D+	\N	Passed
26	10	06016404	D	\N	Passed
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: gypprt
--

COPY public.users (id, username, password_hash, name, role, track_id, study_plan, current_year, current_semester) FROM stdin;
1	63072016	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Pranee SuperSenior	student	MM	Non-Co-op	5	1
2	64072014	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Nipa Senior	student	SD	Non-Co-op	4	1
3	64072015	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Olan Co-op	student	ITI	Co-op	4	1
4	64072019	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Tanawat HighGPA	student	SD	Co-op	4	1
5	65072006	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Fonthip Survivor	student	ITI	Non-Co-op	3	2
6	65072010	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Jintara Recovered	student	SD	Non-Co-op	3	1
7	65072013	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Mana Goodstudent	student	ITI	Co-op	3	1
8	65072018	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Sunee Fighter	student	ITI	Non-Co-op	3	1
9	65072020	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Ubonwan Average	student	MM	Non-Co-op	3	1
10	66070138	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Peerapat Meesangngoen	student	ITI	Non-Co-op	3	1
11	66072005	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Ekkachai Prolong	student	MM	Non-Co-op	2	2
12	66072007	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Giat Failagain	student	SD	Non-Co-op	2	1
13	66072008	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Hataichanok Dropped	student	MM	Non-Co-op	2	2
14	66072009	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Ittipon Climber	student	ITI	Co-op	2	2
15	66072012	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Ladda Steady	student	MM	Co-op	2	2
16	67072001	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Anucha Failfast	student	N/A	Non-Co-op	1	1
17	67072002	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Benjawan Gone	student	N/A	Non-Co-op	1	1
18	67072003	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Chalerm Trying	student	N/A	Non-Co-op	1	2
19	67072004	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Darunee OnEdge	student	N/A	Co-op	1	2
20	67072011	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Kiattisak Normal	student	N/A	Non-Co-op	1	2
21	peerapat_admin	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Peerapat (Admin)	admin	N/A	N/A	\N	1
22	kubun_admin	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Kubun (Admin)	admin	N/A	N/A	\N	1
23	teerati_admin	$2b$10$Fn5RuvDDXJusWBx8mP1JI.V31zGLEYSD1dZ/XH14Y4YOZjly5r6Sm	Teerati (Admin)	admin	N/A	N/A	\N	1
\.


--
-- Name: academic_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gypprt
--

SELECT pg_catalog.setval('public.academic_history_id_seq', 86, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gypprt
--

SELECT pg_catalog.setval('public.courses_id_seq', 823, true);


--
-- Name: curriculum_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gypprt
--

SELECT pg_catalog.setval('public.curriculum_id_seq', 348, true);


--
-- Name: user_grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gypprt
--

SELECT pg_catalog.setval('public.user_grades_id_seq', 33, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gypprt
--

SELECT pg_catalog.setval('public.users_id_seq', 23, true);


--
-- Name: academic_history academic_history_pkey; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.academic_history
    ADD CONSTRAINT academic_history_pkey PRIMARY KEY (id);


--
-- Name: courses courses_code_key; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_key UNIQUE (code);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: curriculum curriculum_pkey; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.curriculum
    ADD CONSTRAINT curriculum_pkey PRIMARY KEY (id);


--
-- Name: user_grades user_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.user_grades
    ADD CONSTRAINT user_grades_pkey PRIMARY KEY (id);


--
-- Name: user_grades user_grades_user_id_course_code_key; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.user_grades
    ADD CONSTRAINT user_grades_user_id_course_code_key UNIQUE (user_id, course_code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_academic_history_user_id; Type: INDEX; Schema: public; Owner: gypprt
--

CREATE INDEX idx_academic_history_user_id ON public.academic_history USING btree (user_id);


--
-- Name: academic_history academic_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.academic_history
    ADD CONSTRAINT academic_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_grades user_grades_course_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.user_grades
    ADD CONSTRAINT user_grades_course_code_fkey FOREIGN KEY (course_code) REFERENCES public.courses(code) ON DELETE CASCADE;


--
-- Name: user_grades user_grades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gypprt
--

ALTER TABLE ONLY public.user_grades
    ADD CONSTRAINT user_grades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

