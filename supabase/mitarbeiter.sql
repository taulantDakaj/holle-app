-- Mitarbeiter freischalten: E-Mail anpassen und im SQL Editor ausführen.
-- Vorher unter Authentication → Users → „Add user“ denselben Benutzer mit Passwort anlegen.
insert into staff (email, name, role) values ('DEINE@EMAIL.de', 'Taulant', 'admin')
on conflict (email) do nothing;
