-- ServiceFlow AI — Cloud SQL (PostgreSQL) Analytics Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    locale VARCHAR(10) DEFAULT 'ur-PK',
    preferred_language VARCHAR(20),
    loyalty_tier VARCHAR(20) DEFAULT 'bronze',
    loyalty_discount_pct DECIMAL(5,2) DEFAULT 0,
    preferences JSONB DEFAULT '[]',
    default_location TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    default_complexity VARCHAR(20) DEFAULT 'basic',
    base_rate DECIMAL(12,2),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    specializations TEXT[] DEFAULT '{}',
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    hourly_rate DECIMAL(12,2),
    experience_years INT DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    tools TEXT[] DEFAULT '{}',
    available_now BOOLEAN DEFAULT false,
    max_daily_jobs INT DEFAULT 5,
    active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reputation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id),
    reliability_score DECIMAL(4,3),
    rating DECIMAL(3,2),
    cancellation_rate DECIMAL(4,3),
    on_time_score DECIMAL(4,3),
    risk_score DECIMAL(4,3),
    completion_rate DECIMAL(4,3),
    current_jobs INT DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(20) UNIQUE,
    user_id UUID REFERENCES users(id),
    provider_id UUID REFERENCES providers(id),
    service_type VARCHAR(50),
    status VARCHAR(30) NOT NULL,
    complexity VARCHAR(20),
    total_price DECIMAL(12,2),
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    intent_snapshot JSONB,
    pricing_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    base_price DECIMAL(12,2),
    line_items JSONB NOT NULL,
    subtotal DECIMAL(12,2),
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'PKR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id),
    booking_id UUID REFERENCES bookings(id),
    slot_start TIMESTAMPTZ NOT NULL,
    slot_end TIMESTAMPTZ NOT NULL,
    buffer_minutes INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'booked',
    UNIQUE(provider_id, slot_start)
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    user_id UUID REFERENCES users(id),
    provider_id UUID REFERENCES providers(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'open',
    resolution TEXT,
    compensation DECIMAL(12,2) DEFAULT 0,
    provider_penalty DECIMAL(4,3) DEFAULT 0,
    escalated BOOLEAN DEFAULT false,
    ai_trace_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    provider_id UUID,
    channel VARCHAR(20),
    template VARCHAR(50),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id VARCHAR(50) NOT NULL,
    agent_name VARCHAR(100),
    action VARCHAR(100),
    confidence DECIMAL(4,3),
    message TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_ai_logs_trace ON ai_logs(trace_id);
CREATE INDEX idx_reputation_provider ON reputation_metrics(provider_id, recorded_at DESC);
