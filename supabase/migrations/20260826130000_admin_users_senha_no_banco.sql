-- A senha passa a ser cifrada pelo próprio Postgres (bcrypt, via pgcrypto).
-- Assim dá para criar e trocar acesso direto no SQL, sem depender da tela:
--   select public.admin_criar_usuario('Ana', 'ana@notkode.com.br', 'senha-dela', 'equipe');
-- Ninguém tinha senha cadastrada ainda, então não há hash antigo para migrar.

comment on column public.admin_users.senha_hash is
  'Escreva a senha em texto (mínimo 8 caracteres) e o banco cifra sozinho, em bcrypt. Depois de salva, não dá para ler de volta: para trocar, escreva a nova por cima.';

-- Cria o acesso e devolve o id. E-mail repetido bate no índice único.
create or replace function public.admin_criar_usuario(
  p_nome text,
  p_email text,
  p_senha text,
  p_papel text default 'equipe'
) returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  if length(coalesce(p_senha, '')) < 8 then
    raise exception 'A senha precisa de pelo menos 8 caracteres.';
  end if;

  insert into public.admin_users (nome, email, senha_hash, papel)
  values (
    btrim(p_nome),
    lower(btrim(p_email)),
    extensions.crypt(p_senha, extensions.gen_salt('bf', 10)),
    coalesce(p_papel, 'equipe')
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Troca a senha de quem já existe. Aceita o e-mail ou o id.
create or replace function public.admin_trocar_senha(
  p_quem text,
  p_senha text
) returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_linhas int;
begin
  if length(coalesce(p_senha, '')) < 8 then
    raise exception 'A senha precisa de pelo menos 8 caracteres.';
  end if;

  update public.admin_users
     set senha_hash = extensions.crypt(p_senha, extensions.gen_salt('bf', 10))
   where lower(email) = lower(btrim(p_quem))
      or id::text = btrim(p_quem);

  get diagnostics v_linhas = row_count;
  return v_linhas > 0;
end;
$$;

-- Confere e-mail e senha. Devolve o id de quem entrou, ou nada.
-- A comparação acontece aqui dentro: o hash nunca sai do banco.
create or replace function public.admin_login(
  p_email text,
  p_senha text
) returns table (id uuid, nome text, ativo boolean)
language sql
security definer
set search_path = public, extensions
as $$
  select u.id, u.nome, u.ativo
    from public.admin_users u
   where lower(u.email) = lower(btrim(p_email))
     and u.senha_hash = extensions.crypt(p_senha, u.senha_hash);
$$;

-- Só o servidor (service_role) chama. Nada disso fica exposto ao público.
revoke all on function public.admin_criar_usuario(text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_trocar_senha(text, text) from public, anon, authenticated;
revoke all on function public.admin_login(text, text) from public, anon, authenticated;
grant execute on function public.admin_criar_usuario(text, text, text, text) to service_role;
grant execute on function public.admin_trocar_senha(text, text) to service_role;
grant execute on function public.admin_login(text, text) to service_role;
