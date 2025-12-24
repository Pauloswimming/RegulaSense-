from django.db import migrations

def preencher_procedimento_fk(apps, schema_editor):
    """
    Lê o valor do campo 'procedimento' antigo (CharField) e usa para
    encontrar ou criar o registro 'Procedimento' correspondente,
    associando-o ao 'procedimento_fk'.
    """
    Solicitacao = apps.get_model('fillsense', 'Solicitacao')
    Procedimento = apps.get_model('fillsense', 'Procedimento')
    db_alias = schema_editor.connection.alias

    # Itera apenas nos que precisam de backfill
    solicitacoes = Solicitacao.objects.using(db_alias).filter(procedimento_fk__isnull=True)

    for sol in solicitacoes:
        codigo_antigo = sol.procedimento

        if not codigo_antigo:
            continue

        proc, _ = Procedimento.objects.using(db_alias).get_or_create(
            codigo=codigo_antigo,
            defaults={'label': codigo_antigo}
        )

        sol.procedimento_fk = proc
        sol.save(update_fields=['procedimento_fk'])


class Migration(migrations.Migration):

    dependencies = [
        ('fillsense', '0010_alter_solicitacao_procedimento'),
    ]

    operations = [
        migrations.RunPython(preencher_procedimento_fk, migrations.RunPython.noop),
    ]