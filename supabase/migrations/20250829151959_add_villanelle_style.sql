insert into public.styles (name, description, user_explanation, number_of_lines)
values (
  'villanelle',
  'a villanelle with repeated refrains and strict rhyme',
  'A villanelle has 19 lines: five tercets followed by a quatrain. Lines 1 and 3 of the first tercet alternate as refrains.',
  19
)
on conflict (name) do update
set description = excluded.description,
    user_explanation = excluded.user_explanation,
    number_of_lines = excluded.number_of_lines;