DELETE FROM renting WHERE ref_id = %(ref_id)s
RETURNING ref_id;