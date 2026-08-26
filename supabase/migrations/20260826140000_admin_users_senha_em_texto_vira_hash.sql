-- Rede de segurança para quem edita a tabela na mão (Table Editor do Supabase
-- ou um update solto): se o que chegou em senha_hash não é um hash bcrypt, é
-- senha em texto, e o banco cifra antes de gravar. Sem isso, o valor ficaria
-- legível e o login recusaria a senha para sempre, sem erro nenhum.
create or replace function public.admin_users_cifrar_senha()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.senha_hash is null or length(btrim(new.senha_hash)) = 0 then
    raise exception 'A senha não pode ficar em branco.';
  end if;

  -- Já é hash bcrypt ($2a$10$ + 53 caracteres): passa direto.
  if new.senha_hash ~ '^\$2[aby]?\$\d{2}\$.{53}$' then
    return new;
  end if;

  if length(new.senha_hash) < 8 then
    raise exception 'A senha precisa de pelo menos 8 caracteres.';
  end if;

  new.senha_hash := extensions.crypt(new.senha_hash, extensions.gen_salt('bf', 10));
  return new;
end;
$$;

drop trigger if exists admin_users_cifrar_senha on public.admin_users;
create trigger admin_users_cifrar_senha
  before insert or update of senha_hash on public.admin_users
  for each row execute function public.admin_users_cifrar_senha();
