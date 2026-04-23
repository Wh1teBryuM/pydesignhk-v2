-- 1. Extend existing customers table
ALTER TABLE customers
ADD COLUMN role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active' CHECK (
        account_status IN ('active', 'banned', 'deleted')
    );
-- 2. Projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    -- Step 1 inputs
    priority_profile TEXT NOT NULL CHECK (
        priority_profile IN (
            'look_good_control_cost',
            'quality_first',
            'full_premium',
            'practical_functional'
        )
    ),
    property_type TEXT NOT NULL CHECK (
        property_type IN (
            'private_flat',
            'hos_flat',
            'village_house',
            'detached_house',
            'commercial'
        )
    ),
    district TEXT NOT NULL,
    building_age TEXT NOT NULL CHECK (
        building_age IN ('0_to_5', '6_to_15', '16_to_30', '30_plus')
    ),
    saleable_area_sqft INTEGER NOT NULL,
    bedroom_count INTEGER NOT NULL DEFAULT 0,
    bathroom_count INTEGER NOT NULL DEFAULT 0,
    kitchen_count INTEGER NOT NULL DEFAULT 0,
    living_room_count INTEGER NOT NULL DEFAULT 0,
    -- Step 2 inputs
    renovation_scope TEXT NOT NULL CHECK (
        renovation_scope IN (
            'full',
            'kitchen_only',
            'bathroom_only',
            'partial'
        )
    ),
    partial_zones TEXT [],
    -- JSON array of selected zones for partial scope e.g. ['living_room', 'master_bedroom']
    -- Step 4 inputs
    enhancements TEXT [],
    -- selected optional enhancements e.g. ['custom_furniture', 'smart_home']
    additional_requirements TEXT,
    -- Style carried from Explore Idea (optional)
    style_direction TEXT,
    -- Status
    status TEXT NOT NULL DEFAULT 'estimating' CHECK (
        status IN (
            'estimating',
            'inquiry_submitted',
            'confirmed',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Estimations table (one row per line item)
CREATE TABLE estimations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    zone TEXT NOT NULL CHECK (
        zone IN (
            'demolition',
            'plumbing_electrical',
            'masonry_tiling',
            'painting',
            'carpentry',
            'aluminium',
            'cabinets',
            'miscellaneous',
            'custom_furniture'
        )
    ),
    item_description TEXT NOT NULL,
    unit TEXT,
    -- sqft, unit, set, lot
    quantity DECIMAL,
    unit_rate DECIMAL,
    subtotal DECIMAL NOT NULL,
    material_grade TEXT CHECK (
        material_grade IN ('basic', 'standard', 'premium')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Inquiries table
CREATE TABLE inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    preferred_contact_method TEXT NOT NULL CHECK (
        preferred_contact_method IN ('whatsapp', 'phone_call', 'email')
    ),
    preferred_contact_time TEXT NOT NULL CHECK (
        preferred_contact_time IN (
            'morning_9_to_12',
            'afternoon_12_to_5',
            'evening_5_to_8'
        )
    ),
    additional_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);
-- 5. RLS on new tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
-- Customers can only see their own projects
CREATE POLICY "projects_select_own" ON projects FOR
SELECT USING (customer_id = auth.uid());
CREATE POLICY "projects_insert_own" ON projects FOR
INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "projects_update_own" ON projects FOR
UPDATE USING (customer_id = auth.uid());
-- Customers can only see their own estimations via project
CREATE POLICY "estimations_select_own" ON estimations FOR
SELECT USING (
        project_id IN (
            SELECT id
            FROM projects
            WHERE customer_id = auth.uid()
        )
    );
CREATE POLICY "estimations_insert_own" ON estimations FOR
INSERT WITH CHECK (
        project_id IN (
            SELECT id
            FROM projects
            WHERE customer_id = auth.uid()
        )
    );
-- Customers can only see their own inquiries
CREATE POLICY "inquiries_select_own" ON inquiries FOR
SELECT USING (customer_id = auth.uid());
CREATE POLICY "inquiries_insert_own" ON inquiries FOR
INSERT WITH CHECK (customer_id = auth.uid());