-- ============================================================================
-- 0002_intention_to_seed.sql
-- ============================================================================

create or replace function fn_expire_intention_to_seed()
returns trigger as $$
begin
  if new.transformed_to_seed = true and old.transformed_to_seed = false and new.user_id is not null then
    insert into spiritual_inventory (profile_id, seeds_journey, updated_at)
    values (new.user_id, 1, now())
    on conflict (profile_id)
    do update set seeds_journey = spiritual_inventory.seeds_journey + 1,
                  updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_intention_to_seed on intentions_wall;
create trigger trg_intention_to_seed
after update of transformed_to_seed on intentions_wall
for each row execute function fn_expire_intention_to_seed();
