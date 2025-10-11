-- Chat System Database Schema
-- Run this SQL in your Supabase SQL editor

-- Create enum types for chat system
CREATE TYPE chat_type AS ENUM ('direct', 'group', 'channel');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'voice', 'video', 'location', 'contact');
CREATE TYPE participant_role AS ENUM ('admin', 'moderator', 'member');

-- Chats table
CREATE TABLE chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type chat_type NOT NULL DEFAULT 'group',
    avatar TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    last_message_id UUID,
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{"allow_members_to_invite": true, "allow_file_sharing": true, "allow_voice_messages": true}',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat participants table
CREATE TABLE chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role participant_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) NOT NULL,
    content TEXT,
    message_type message_type DEFAULT 'text',
    reply_to_id UUID REFERENCES messages(id),
    forwarded_from_id UUID REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    thumbnail_url TEXT,
    uploaded_by UUID REFERENCES users(id) NOT NULL,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Chat invitations table
CREATE TABLE chat_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES users(id) NOT NULL,
    invited_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_accepted BOOLEAN DEFAULT false,
    accepted_at TIMESTAMP WITH TIME ZONE,
    school_id UUID REFERENCES schools(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chats_school ON chats(school_id);
CREATE INDEX idx_chats_created_by ON chats(created_by);
CREATE INDEX idx_chats_last_message ON chats(last_message_id);
CREATE INDEX idx_chat_participants_chat ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_attachments_message ON attachments(message_id);
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_chat_invitations_chat ON chat_invitations(chat_id);
CREATE INDEX idx_chat_invitations_user ON chat_invitations(invited_user_id);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_invitations ENABLE ROW LEVEL SECURITY;

-- Row Level Security policies
-- Users can only access chats they participate in
CREATE POLICY "Users can access their chats" ON chats FOR ALL USING (
    id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access chat participants" ON chat_participants FOR ALL USING (
    user_id = auth.uid() OR 
    chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access messages in their chats" ON messages FOR ALL USING (
    chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access attachments in their chats" ON attachments FOR ALL USING (
    message_id IN (
        SELECT id FROM messages 
        WHERE chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can access reactions in their chats" ON message_reactions FOR ALL USING (
    message_id IN (
        SELECT id FROM messages 
        WHERE chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can access their invitations" ON chat_invitations FOR ALL USING (
    invited_user_id = auth.uid() OR 
    invited_by = auth.uid() OR
    chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET last_message_id = NEW.id, updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_message_delivered()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivered_at IS NULL AND OLD.delivered_at IS NULL THEN
        NEW.delivered_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_chat_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_last_message();

CREATE TRIGGER update_message_delivered_trigger
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_delivered();

-- Add foreign key constraint for last_message_id (commented out initially to avoid circular dependency)
-- ALTER TABLE chats ADD CONSTRAINT fk_chats_last_message 
--     FOREIGN KEY (last_message_id) REFERENCES messages(id);

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID, chat_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.chat_id = chat_uuid
        AND m.sender_id != user_uuid
        AND m.created_at > COALESCE(
            (SELECT last_read_at FROM chat_participants 
             WHERE chat_id = chat_uuid AND user_id = user_uuid), 
            '1970-01-01'::timestamp
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(user_uuid UUID, chat_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE chat_participants 
    SET last_read_at = NOW()
    WHERE chat_id = chat_uuid AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert sample chat data
INSERT INTO chats (name, type, created_by, school_id) VALUES
('School Announcements', 'channel', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), (SELECT id FROM schools LIMIT 1)),
('Grade 3 Parents', 'group', (SELECT id FROM users WHERE role = 'parent' LIMIT 1), (SELECT id FROM schools LIMIT 1)),
('Transport Updates', 'channel', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), (SELECT id FROM schools LIMIT 1));

-- Add all users as participants in school announcements (with proper enum casting)
INSERT INTO chat_participants (chat_id, user_id, role)
SELECT 
    (SELECT id FROM chats WHERE name = 'School Announcements' LIMIT 1),
    id,
    CASE 
        WHEN role = 'admin' THEN 'admin'::participant_role 
        ELSE 'member'::participant_role 
    END
FROM users;

-- Add parents to grade 3 parents chat (with proper enum casting)
INSERT INTO chat_participants (chat_id, user_id, role)
SELECT 
    (SELECT id FROM chats WHERE name = 'Grade 3 Parents' LIMIT 1),
    id,
    'member'::participant_role
FROM users 
WHERE role = 'parent';

-- Add transport-related users to transport updates (with proper enum casting)
INSERT INTO chat_participants (chat_id, user_id, role)
SELECT 
    (SELECT id FROM chats WHERE name = 'Transport Updates' LIMIT 1),
    id,
    CASE 
        WHEN role IN ('admin', 'driver') THEN 'admin'::participant_role 
        ELSE 'member'::participant_role 
    END
FROM users 
WHERE role IN ('admin', 'driver', 'parent');