CREATE TABLE admin_notifications (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	message TEXT NOT NULL,
	type TEXT NOT NULL,
	related_id INTEGER,
	read INTEGER DEFAULT 0,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE admins (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	password TEXT NOT NULL,
	role TEXT DEFAULT 'admin',
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX admins_email_unique ON admins (email);--> statement-breakpoint
CREATE TABLE consultations (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	datetime TIMESTAMP WITH TIME ZONE NOT NULL,
	status TEXT NOT NULL,
	notes TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE ebooks (
	id SERIAL PRIMARY KEY,
	pathology_id INTEGER,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	cover_url TEXT NOT NULL,
	download_url TEXT NOT NULL,
	tags TEXT NOT NULL,
	pages INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE leads (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	phone TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE notifications (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	title TEXT NOT NULL,
	message TEXT NOT NULL,
	type TEXT NOT NULL,
	read INTEGER DEFAULT 0,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE pathologies (
	id SERIAL PRIMARY KEY,
	slug TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	icon TEXT NOT NULL,
	image_url TEXT,
	price INTEGER DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX pathologies_slug_unique ON pathologies (slug);--> statement-breakpoint
CREATE TABLE subscriptions (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	plan TEXT NOT NULL,
	status TEXT NOT NULL,
	start_date TIMESTAMP WITH TIME ZONE NOT NULL,
	renewal_date TIMESTAMP WITH TIME ZONE NOT NULL,
	payment_method TEXT NOT NULL,
	proof_url TEXT
);
--> statement-breakpoint
CREATE TABLE system_settings (
	id SERIAL PRIMARY KEY,
	site_name TEXT DEFAULT 'Doce Leveza',
	support_email TEXT DEFAULT 'suporte@doceleveza.com',
	support_phone TEXT DEFAULT '(11) 99999-9999',
	maintenance_mode INTEGER DEFAULT 0,
	enable_signup INTEGER DEFAULT 1,
	api_base_url TEXT,
	google_analytics_id TEXT,
	facebook_pixel_id TEXT,
	smtp_host TEXT,
	smtp_port INTEGER,
	smtp_user TEXT,
	smtp_pass TEXT
);
--> statement-breakpoint
CREATE TABLE user_access (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	pathology_id INTEGER NOT NULL,
	start_date TIMESTAMP WITH TIME ZONE NOT NULL,
	expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
	status TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	phone TEXT NOT NULL,
	address TEXT NOT NULL,
	password TEXT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE videos (
	id SERIAL PRIMARY KEY,
	pathology_id INTEGER NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	duration TEXT NOT NULL,
	thumbnail_url TEXT NOT NULL,
	video_url TEXT NOT NULL,
	resources TEXT,
	view_count INTEGER DEFAULT 0
);
