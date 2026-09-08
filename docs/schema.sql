--
-- PostgreSQL database dump
--

\restrict bgdrl50G57LrDhVb4hK3y8LrdQhHliQWG91pqQEue4GRHqS0rLKaGpOP4lumKuq

-- Dumped from database version 17.11 (Debian 17.11-0+deb13u1)
-- Dumped by pg_dump version 17.11 (Debian 17.11-0+deb13u1)

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
-- Name: files; Type: TABLE; Schema: public; Owner: sentinel_dev
--

CREATE TABLE public.files (
    id integer NOT NULL,
    user_id integer NOT NULL,
    original_filename character varying(255) NOT NULL,
    stored_path text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.files OWNER TO sentinel_dev;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: sentinel_dev
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_id_seq OWNER TO sentinel_dev;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sentinel_dev
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: sentinel_dev
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    is_private boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notes OWNER TO sentinel_dev;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: sentinel_dev
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO sentinel_dev;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sentinel_dev
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: request_logs; Type: TABLE; Schema: public; Owner: sentinel_dev
--

CREATE TABLE public.request_logs (
    id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    source_ip character varying(45),
    method character varying(10),
    path text,
    payload text,
    verdict character varying(20),
    mitre_technique character varying(20),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.request_logs OWNER TO sentinel_dev;

--
-- Name: request_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: sentinel_dev
--

CREATE SEQUENCE public.request_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_logs_id_seq OWNER TO sentinel_dev;

--
-- Name: request_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sentinel_dev
--

ALTER SEQUENCE public.request_logs_id_seq OWNED BY public.request_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sentinel_dev
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO sentinel_dev;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sentinel_dev
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO sentinel_dev;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sentinel_dev
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: request_logs id; Type: DEFAULT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.request_logs ALTER COLUMN id SET DEFAULT nextval('public.request_logs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: request_logs request_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.request_logs
    ADD CONSTRAINT request_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_logs_timestamp; Type: INDEX; Schema: public; Owner: sentinel_dev
--

CREATE INDEX idx_logs_timestamp ON public.request_logs USING btree ("timestamp");


--
-- Name: idx_logs_verdict; Type: INDEX; Schema: public; Owner: sentinel_dev
--

CREATE INDEX idx_logs_verdict ON public.request_logs USING btree (verdict);


--
-- Name: idx_notes_user_id; Type: INDEX; Schema: public; Owner: sentinel_dev
--

CREATE INDEX idx_notes_user_id ON public.notes USING btree (user_id);


--
-- Name: files files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sentinel_dev
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO sentinel_dev;


--
-- PostgreSQL database dump complete
--

\unrestrict bgdrl50G57LrDhVb4hK3y8LrdQhHliQWG91pqQEue4GRHqS0rLKaGpOP4lumKuq

