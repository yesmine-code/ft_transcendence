--
-- PostgreSQL database dump
--

-- Dumped from database version 14.4 (Debian 14.4-1.pgdg110+1)
-- Dumped by pg_dump version 14.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: transcendence_ids; Type: SCHEMA; Schema: -; Owner: postgresql_user
--

CREATE SCHEMA transcendence_ids;


ALTER SCHEMA transcendence_ids OWNER TO postgresql_user;

--
-- Name: achievements_achievement_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.achievements_achievement_enum AS ENUM (
    'win_10_times',
    'win_25_times',
    'win_50_times',
    'expert',
    'play_10_times',
    'play_25_times',
    'play_50_times'
);


ALTER TYPE public.achievements_achievement_enum OWNER TO postgresql_user;

--
-- Name: conversation_members_action_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.conversation_members_action_enum AS ENUM (
    'none',
    'writing',
    'playing'
);


ALTER TYPE public.conversation_members_action_enum OWNER TO postgresql_user;

--
-- Name: conversation_members_role_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.conversation_members_role_enum AS ENUM (
    'owner',
    'admin',
    'member',
    'banned',
    'muted',
    'pending'
);


ALTER TYPE public.conversation_members_role_enum OWNER TO postgresql_user;

--
-- Name: conversations_visibility_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.conversations_visibility_enum AS ENUM (
    'public',
    'private',
    'protected',
    'direct_message'
);


ALTER TYPE public.conversations_visibility_enum OWNER TO postgresql_user;

--
-- Name: games_first_player_status_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.games_first_player_status_enum AS ENUM (
    'win',
    'loose',
    'gave_up'
);


ALTER TYPE public.games_first_player_status_enum OWNER TO postgresql_user;

--
-- Name: games_second_player_status_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.games_second_player_status_enum AS ENUM (
    'win',
    'loose',
    'gave_up'
);


ALTER TYPE public.games_second_player_status_enum OWNER TO postgresql_user;

--
-- Name: users_map_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.users_map_enum AS ENUM (
    'black',
    'blue',
    'green',
    'red'
);


ALTER TYPE public.users_map_enum OWNER TO postgresql_user;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.users_status_enum AS ENUM (
    'OFFLINE',
    'ONLINE',
    'IN_GAME'
);


ALTER TYPE public.users_status_enum OWNER TO postgresql_user;

--
-- Name: users_theme_enum; Type: TYPE; Schema: public; Owner: postgresql_user
--

CREATE TYPE public.users_theme_enum AS ENUM (
    'light',
    'dark',
    'auto'
);


ALTER TYPE public.users_theme_enum OWNER TO postgresql_user;

--
-- Name: levels(integer, integer); Type: FUNCTION; Schema: public; Owner: postgresql_user
--

CREATE FUNCTION public.levels(game_id integer, user_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
	return (SELECT sum(case when (("first_player_id" = user_id AND "first_player_status" = 'win') OR ("second_player_id" = user_id AND "second_player_status" = 'win')) then 1 else 0 end) FROM games WHERE id <= game_id AND ("first_player_id" = user_id OR "second_player_id" = user_id));
END;
$$;


ALTER FUNCTION public.levels(game_id integer, user_id integer) OWNER TO postgresql_user;

--
-- Name: is_taken(text); Type: FUNCTION; Schema: transcendence_ids; Owner: postgresql_user
--

CREATE FUNCTION transcendence_ids.is_taken(token text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	schemaname	varchar;
	tablename		varchar;
	columnname	varchar;
	rowctid		text;
BEGIN
	FOR schemaname, tablename, columnname IN (select
		"table_schema",
		"table_name",
		"column_name"
	from
		information_schema.columns
	where
		column_default = 'transcendence_ids.unique_id()')
		LOOP
			FOR rowctid IN
				EXECUTE format('SELECT * FROM %I.%I WHERE cast(%I as text)=%L',
					schemaname,
					tablename,
					columnname,
					token
				)
			LOOP
				return true;
			END LOOP;
		END LOOP;
	return false;
END;
$$;


ALTER FUNCTION transcendence_ids.is_taken(token text) OWNER TO postgresql_user;

--
-- Name: is_username_taken(text); Type: FUNCTION; Schema: transcendence_ids; Owner: postgresql_user
--

CREATE FUNCTION transcendence_ids.is_username_taken(token text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	schemaname	varchar;
	tablename		varchar;
	columnname	varchar;
	rowctid		text;
BEGIN
	FOR schemaname, tablename, columnname IN (select
		"table_schema",
		"table_name",
		"column_name"
	from
		information_schema.columns
	where
		column_default = 'transcendence_ids.unique_username()')
		LOOP
			FOR rowctid IN
				EXECUTE format('SELECT * FROM %I.%I WHERE cast(%I as text)=%L',
					schemaname,
					tablename,
					columnname,
					token
				)
			LOOP
				return true;
			END LOOP;
		END LOOP;
	return false;
END;
$$;


ALTER FUNCTION transcendence_ids.is_username_taken(token text) OWNER TO postgresql_user;

--
-- Name: unique_id(); Type: FUNCTION; Schema: transcendence_ids; Owner: postgresql_user
--

CREATE FUNCTION transcendence_ids.unique_id(OUT result text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
	characters 	TEXT 	:= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	i			INTEGER	:= 0;
	size		INTEGER := 11;
BEGIN
	result := '';

	WHILE
		( length(result) != size )
		OR
		( transcendence_ids.is_taken(result) )
	LOOP
		IF size < 0 THEN
			size := 0;
		END IF;
		FOR i IN 1..size LOOP
			result := result || substr(characters, floor(random() * length(characters) + 1)::INTEGER, 1);
		END LOOP;
	END LOOP;
END;
$$;


ALTER FUNCTION transcendence_ids.unique_id(OUT result text) OWNER TO postgresql_user;

--
-- Name: unique_username(); Type: FUNCTION; Schema: transcendence_ids; Owner: postgresql_user
--

CREATE FUNCTION transcendence_ids.unique_username(OUT result text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
	characters 	TEXT 	:= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	i			INTEGER	:= 0;
	size		INTEGER := 20;
BEGIN
	result := '';

	WHILE
		( length(result) != size )
		OR
		( transcendence_ids.is_username_taken(result) )
	LOOP
		IF size < 0 THEN
			size := 0;
		END IF;
		FOR i IN 1..size LOOP
			result := result || substr(characters, floor(random() * length(characters) + 1)::INTEGER, 1);
		END LOOP;
	END LOOP;
END;
$$;


ALTER FUNCTION transcendence_ids.unique_username(OUT result text) OWNER TO postgresql_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    achievement public.achievements_achievement_enum NOT NULL,
    "timestamp" timestamp without time zone,
    "userId" integer
);


ALTER TABLE public.achievements OWNER TO postgresql_user;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.achievements_id_seq OWNER TO postgresql_user;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: connections; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.connections (
    id integer NOT NULL,
    type integer NOT NULL,
    "timestamp" timestamp without time zone,
    "sourceId" integer,
    "targetId" integer
);


ALTER TABLE public.connections OWNER TO postgresql_user;

--
-- Name: connections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.connections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.connections_id_seq OWNER TO postgresql_user;

--
-- Name: connections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.connections_id_seq OWNED BY public.connections.id;


--
-- Name: conversation_members; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.conversation_members (
    id integer NOT NULL,
    action public.conversation_members_action_enum DEFAULT 'none'::public.conversation_members_action_enum NOT NULL,
    role public.conversation_members_role_enum DEFAULT 'member'::public.conversation_members_role_enum NOT NULL,
    joined timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer,
    "conversationId" integer
);


ALTER TABLE public.conversation_members OWNER TO postgresql_user;

--
-- Name: conversation_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.conversation_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.conversation_members_id_seq OWNER TO postgresql_user;

--
-- Name: conversation_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.conversation_members_id_seq OWNED BY public.conversation_members.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    name character varying,
    password character varying,
    visibility public.conversations_visibility_enum DEFAULT 'public'::public.conversations_visibility_enum NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgresql_user;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.conversations_id_seq OWNER TO postgresql_user;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: games; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.games (
    id integer NOT NULL,
    first_player_status public.games_first_player_status_enum,
    first_player_score integer DEFAULT 0 NOT NULL,
    second_player_status public.games_second_player_status_enum,
    second_player_score integer DEFAULT 0 NOT NULL,
    created timestamp without time zone DEFAULT now(),
    start timestamp without time zone DEFAULT now(),
    finish timestamp without time zone DEFAULT now(),
    "firstPlayerId" integer,
    "firstPlayerSocketId" integer,
    "secondPlayerId" integer,
    "secondPlayerRequestedId" integer,
    "secondPlayerSocketId" integer
);


ALTER TABLE public.games OWNER TO postgresql_user;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.games_id_seq OWNER TO postgresql_user;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    value character varying,
    date timestamp without time zone DEFAULT now() NOT NULL,
    "authorId" integer,
    "conversationId" integer,
    "gameId" integer
);


ALTER TABLE public.messages OWNER TO postgresql_user;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO postgresql_user;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: sockets; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.sockets (
    id integer NOT NULL,
    socket character varying NOT NULL,
    room character varying,
    "sourceId" integer
);


ALTER TABLE public.sockets OWNER TO postgresql_user;

--
-- Name: sockets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.sockets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sockets_id_seq OWNER TO postgresql_user;

--
-- Name: sockets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.sockets_id_seq OWNED BY public.sockets.id;


--
-- Name: typeorm_metadata; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);


ALTER TABLE public.typeorm_metadata OWNER TO postgresql_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgresql_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying DEFAULT transcendence_ids.unique_username() NOT NULL,
    display_name character varying NOT NULL,
    email character varying NOT NULL,
    id_42 integer,
    password character varying,
    level integer DEFAULT 0 NOT NULL,
    number_of_games integer DEFAULT 0 NOT NULL,
    avatar character varying DEFAULT 'default_avatar.jpeg'::character varying NOT NULL,
    "twoFactorAuthenticationSecret" character varying,
    "isTwoFactorAuthenticationEnabled" boolean DEFAULT false NOT NULL,
    status public.users_status_enum DEFAULT 'OFFLINE'::public.users_status_enum NOT NULL,
    theme public.users_theme_enum DEFAULT 'auto'::public.users_theme_enum NOT NULL,
    map public.users_map_enum DEFAULT 'black'::public.users_map_enum NOT NULL,
    "phoneNumber" character varying,
    "isPhoneNumberConfirmed" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgresql_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql_user
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgresql_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: connections id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.connections ALTER COLUMN id SET DEFAULT nextval('public.connections_id_seq'::regclass);


--
-- Name: conversation_members id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.conversation_members ALTER COLUMN id SET DEFAULT nextval('public.conversation_members_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: games id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: sockets id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.sockets ALTER COLUMN id SET DEFAULT nextval('public.sockets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: connections PK_0a1f844af3122354cbd487a8d03; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT "PK_0a1f844af3122354cbd487a8d03" PRIMARY KEY (id);


--
-- Name: messages PK_18325f38ae6de43878487eff986; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY (id);


--
-- Name: achievements PK_1bc19c37c6249f70186f318d71d; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY (id);


--
-- Name: conversation_members PK_33146a476696a973a14d931e675; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT "PK_33146a476696a973a14d931e675" PRIMARY KEY (id);


--
-- Name: games PK_c9b16b62917b5595af982d66337; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY (id);


--
-- Name: sockets PK_dd9ffd18e836c4ad4b890b5f6a9; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.sockets
    ADD CONSTRAINT "PK_dd9ffd18e836c4ad4b890b5f6a9" PRIMARY KEY (id);


--
-- Name: conversations PK_ee34f4f7ced4ec8681f26bf04ef; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: sockets FK_012e4562fc26a8125f63e757a1a; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.sockets
    ADD CONSTRAINT "FK_012e4562fc26a8125f63e757a1a" FOREIGN KEY ("sourceId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages FK_017ef7956a9fa255a1692af62b2; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_017ef7956a9fa255a1692af62b2" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: games FK_3a7d2a26dfa4aae00821cf55728; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "FK_3a7d2a26dfa4aae00821cf55728" FOREIGN KEY ("secondPlayerSocketId") REFERENCES public.sockets(id) ON DELETE SET NULL;


--
-- Name: connections FK_42fddfc35b769bbe293a364a7c1; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT "FK_42fddfc35b769bbe293a364a7c1" FOREIGN KEY ("sourceId") REFERENCES public.users(id);


--
-- Name: connections FK_4759f13482d259aa7b02c3ebb6c; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT "FK_4759f13482d259aa7b02c3ebb6c" FOREIGN KEY ("targetId") REFERENCES public.users(id);


--
-- Name: games FK_51ed3068b6c237eeccdf5b675a1; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "FK_51ed3068b6c237eeccdf5b675a1" FOREIGN KEY ("firstPlayerSocketId") REFERENCES public.sockets(id) ON DELETE SET NULL;


--
-- Name: messages FK_819e6bb0ee78baf73c398dc707f; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_819e6bb0ee78baf73c398dc707f" FOREIGN KEY ("authorId") REFERENCES public.users(id);


--
-- Name: games FK_8abad5fb430218ef8af88a034f2; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "FK_8abad5fb430218ef8af88a034f2" FOREIGN KEY ("firstPlayerId") REFERENCES public.users(id);


--
-- Name: games FK_95ce08875b61d21d2d3ee797743; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "FK_95ce08875b61d21d2d3ee797743" FOREIGN KEY ("secondPlayerRequestedId") REFERENCES public.users(id);


--
-- Name: conversation_members FK_9a23e356db3cedb8d9725d01d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT "FK_9a23e356db3cedb8d9725d01d1a" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: achievements FK_a4c9761e826d07a1f4c51ca1d2b; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT "FK_a4c9761e826d07a1f4c51ca1d2b" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: conversation_members FK_b49c970adabf84fd2b013b60a99; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT "FK_b49c970adabf84fd2b013b60a99" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: games FK_c2c349d15f2ae8e0aae83f044d1; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "FK_c2c349d15f2ae8e0aae83f044d1" FOREIGN KEY ("secondPlayerId") REFERENCES public.users(id);


--
-- Name: messages FK_e5663ce0c730b2de83445e2fd19; Type: FK CONSTRAINT; Schema: public; Owner: postgresql_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

