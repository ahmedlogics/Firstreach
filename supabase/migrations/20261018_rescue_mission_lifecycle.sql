-- ============================================================================
-- FIRSTREACH — Member 3: Rescue Mission Lifecycle & Team Release Migration
-- ============================================================================
-- Adds atomic RPC functions for starting missions and completing assignments
-- with support for team release, shelter occupancy updates, and partial rescues.
-- ============================================================================

-- 1. Atomic Mission Start RPC
CREATE OR REPLACE FUNCTION start_assignment(
  p_assignment_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment RECORD;
  v_incident RECORD;
BEGIN
  -- 1. Fetch and row-lock assignment
  SELECT * INTO v_assignment
  FROM assignments
  WHERE id = p_assignment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment % not found in database', p_assignment_id USING ERRCODE = 'P0002';
  END IF;

  -- Idempotency check: if already en_route, return success safely
  IF v_assignment.status = 'en_route' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_en_route', true,
      'assignment_id', v_assignment.id,
      'status', 'en_route'
    );
  END IF;

  -- Validate state machine: only 'assigned' can transition to 'en_route'
  IF v_assignment.status <> 'assigned' THEN
    RAISE EXCEPTION 'Invalid status transition: Assignment is in status ''%'' (expected ''assigned'')', v_assignment.status USING ERRCODE = 'P0001';
  END IF;

  -- 2. Fetch and row-lock linked incident
  SELECT * INTO v_incident
  FROM incidents
  WHERE id = v_assignment.incident_id
  FOR UPDATE;

  -- 3. Transition assignment to en_route
  UPDATE assignments
  SET status = 'en_route'
  WHERE id = p_assignment_id;

  -- 4. Transition incident to in_progress
  IF v_incident.id IS NOT NULL THEN
    UPDATE incidents
    SET status = 'in_progress',
        updated_at = now()
    WHERE id = v_incident.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'assignment_id', v_assignment.id,
    'status', 'en_route',
    'incident_id', v_incident.id,
    'incident_status', 'in_progress'
  );
END;
$$;

-- 2. Atomic Mission Completion RPC
CREATE OR REPLACE FUNCTION complete_assignment(
  p_assignment_id UUID,
  p_assisted_people_count INT DEFAULT NULL,
  p_team_ready BOOLEAN DEFAULT TRUE,
  p_shelter_id UUID DEFAULT NULL,
  p_evacuees_arrived_count INT DEFAULT 0,
  p_resolution_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment RECORD;
  v_incident RECORD;
  v_shelter RECORD;
  v_people_assisted INT;
  v_is_partial BOOLEAN := FALSE;
  v_remaining_people INT := 0;
  v_new_incident_status TEXT;
  v_new_team_status TEXT;
  v_combined_note TEXT;
BEGIN
  -- 1. Fetch and row-lock assignment
  SELECT * INTO v_assignment
  FROM assignments
  WHERE id = p_assignment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment % not found in database', p_assignment_id USING ERRCODE = 'P0002';
  END IF;

  -- Concurrency & Idempotency check: reject duplicate completion
  IF v_assignment.status = 'completed' THEN
    RAISE EXCEPTION 'Duplicate completion: Assignment % is already completed', p_assignment_id USING ERRCODE = 'P0003';
  END IF;

  -- Must be in active state ('en_route' or 'assigned')
  IF v_assignment.status NOT IN ('en_route', 'assigned') THEN
    RAISE EXCEPTION 'Invalid status transition: Cannot complete assignment in status ''%''', v_assignment.status USING ERRCODE = 'P0001';
  END IF;

  -- 2. Fetch and row-lock linked incident
  SELECT * INTO v_incident
  FROM incidents
  WHERE id = v_assignment.incident_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked incident % not found', v_assignment.incident_id USING ERRCODE = 'P0002';
  END IF;

  -- 3. Determine people assisted and partial vs full rescue
  v_people_assisted := COALESCE(p_assisted_people_count, v_incident.people_count, 1);
  IF v_people_assisted < v_incident.people_count THEN
    v_is_partial := TRUE;
    v_remaining_people := v_incident.people_count - v_people_assisted;
    -- Incident stays active in 'open' status for dispatcher re-triage
    v_new_incident_status := 'open';
  ELSE
    v_is_partial := FALSE;
    v_remaining_people := 0;
    v_new_incident_status := 'resolved';
  END IF;

  -- 4. Shelter Capacity Validation & Update
  IF p_shelter_id IS NOT NULL AND p_evacuees_arrived_count > 0 THEN
    SELECT * INTO v_shelter
    FROM shelters
    WHERE id = p_shelter_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Destination shelter % not found', p_shelter_id USING ERRCODE = 'P0002';
    END IF;

    -- Validate remaining capacity
    IF (v_shelter.occupied + p_evacuees_arrived_count) > v_shelter.capacity THEN
      RAISE EXCEPTION 'Shelter capacity exceeded: Shelter ''%'' has % spots remaining, but % evacuees arrived',
        v_shelter.name, (v_shelter.capacity - v_shelter.occupied), p_evacuees_arrived_count
        USING ERRCODE = 'P0004';
    END IF;

    -- Atomically increment shelter occupancy
    UPDATE shelters
    SET occupied = occupied + p_evacuees_arrived_count
    WHERE id = p_shelter_id;
  END IF;

  -- 5. Rescue Team Release Status
  IF p_team_ready THEN
    v_new_team_status := 'available';
  ELSE
    v_new_team_status := 'busy';
  END IF;

  UPDATE rescue_teams
  SET status = v_new_team_status
  WHERE id = v_assignment.team_id;

  -- 6. Combine notes
  v_combined_note := v_assignment.note;
  IF p_resolution_notes IS NOT NULL AND length(trim(p_resolution_notes)) > 0 THEN
    IF v_combined_note IS NOT NULL AND length(trim(v_combined_note)) > 0 THEN
      v_combined_note := v_combined_note || ' | Res: ' || trim(p_resolution_notes);
    ELSE
      v_combined_note := 'Res: ' || trim(p_resolution_notes);
    END IF;
  END IF;

  IF v_is_partial THEN
    IF v_combined_note IS NOT NULL THEN
      v_combined_note := v_combined_note || ' [Partial: ' || v_people_assisted || ' assisted, ' || v_remaining_people || ' remaining]';
    ELSE
      v_combined_note := '[Partial: ' || v_people_assisted || ' assisted, ' || v_remaining_people || ' remaining]';
    END IF;
  END IF;

  -- 7. Update Assignment record
  UPDATE assignments
  SET status = 'completed',
      completed_at = now(),
      shelter_id = COALESCE(p_shelter_id, v_assignment.shelter_id),
      note = v_combined_note
  WHERE id = p_assignment_id;

  -- 8. Update Incident record
  IF v_is_partial THEN
    UPDATE incidents
    SET status = 'open',
        people_count = v_remaining_people,
        details = COALESCE(details, '') || ' [Partial rescue: ' || v_people_assisted || ' assisted. ' || v_remaining_people || ' still require assistance]',
        updated_at = now()
    WHERE id = v_incident.id;
  ELSE
    UPDATE incidents
    SET status = 'resolved',
        updated_at = now()
    WHERE id = v_incident.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'assignment_id', p_assignment_id,
    'status', 'completed',
    'completed_at', now(),
    'incident_id', v_incident.id,
    'incident_status', v_new_incident_status,
    'is_partial', v_is_partial,
    'remaining_people', v_remaining_people,
    'team_id', v_assignment.team_id,
    'team_status', v_new_team_status,
    'shelter_id', p_shelter_id,
    'evacuees_arrived_count', p_evacuees_arrived_count
  );
END;
$$;
