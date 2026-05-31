const LAST_UPDATED = "24 maggio 2026";
const CONTACT_EMAIL = "loprete1995@gmail.com";

export function PrivacyPolicyContent() {
  return (
    <article className="space-y-8 text-sm leading-relaxed text-foreground/90">
      <p className="text-muted text-xs uppercase tracking-wide">
        Ultimo aggiornamento: {LAST_UPDATED}
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">1. Introduzione</h2>
        <p>
          La presente Informativa sulla privacy descrive come PreventivPRO
          (&quot;noi&quot;, &quot;l&apos;applicazione&quot;) tratta i dati personali
          degli utenti che utilizzano il servizio di gestione preventivi, in
          conformità al Regolamento (UE) 2016/679 (GDPR) e alla normativa
          italiana applicabile in materia di protezione dei dati personali.
        </p>
        <p>
          Utilizzando PreventivPRO, l&apos;utente dichiara di aver letto la
          presente informativa. Per qualsiasi richiesta relativa alla privacy è
          possibile contattarci all&apos;indirizzo{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent hover:text-sky-400 underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          2. Titolare del trattamento
        </h2>
        <p>
          Il titolare del trattamento dei dati personali raccolti tramite
          PreventivPRO è il gestore del servizio, contattabile all&apos;indirizzo
          email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent hover:text-sky-400 underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">3. Dati raccolti</h2>
        <p>In base all&apos;utilizzo del servizio, possiamo trattare le seguenti categorie di dati:</p>
        <ul className="list-disc pl-5 space-y-2 text-muted">
          <li>
            <strong className="text-foreground/90">Dati di account:</strong>{" "}
            indirizzo email e credenziali di accesso (password gestita in forma
            crittografata tramite il provider di autenticazione).
          </li>
          <li>
            <strong className="text-foreground/90">Dati dei clienti:</strong>{" "}
            informazioni inserite dall&apos;utente nell&apos;archivio clienti
            (ad esempio nome, telefono, email, indirizzo, note).
          </li>
          <li>
            <strong className="text-foreground/90">Dati dei preventivi:</strong>{" "}
            contenuti creati dall&apos;utente, inclusi voci, importi, date,
            eventuali firme e altri metadati associati ai preventivi.
          </li>
          <li>
            <strong className="text-foreground/90">Dati tecnici:</strong> log
            di sistema, indirizzo IP e informazioni sul browser/dispositivo
            necessari al funzionamento, alla sicurezza e alla manutenzione del
            servizio.
          </li>
          <li>
            <strong className="text-foreground/90">Preferenze locali:</strong>{" "}
            impostazioni salvate nel browser dell&apos;utente (ad esempio logo
            aziendale, dati azienda e lingua dell&apos;interfaccia), ove
            applicabile.
          </li>
        </ul>
        <p>
          I dati relativi a clienti e preventivi sono inseriti direttamente
          dall&apos;utente e restano di sua esclusiva pertinenza.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          4. Finalità e base giuridica del trattamento
        </h2>
        <p>I dati personali sono trattati per le seguenti finalità:</p>
        <ul className="list-disc pl-5 space-y-2 text-muted">
          <li>
            erogazione del servizio PreventivPRO, inclusa registrazione,
            autenticazione, creazione e gestione di clienti e preventivi (
            <strong className="text-foreground/90">base giuridica:</strong>{" "}
            esecuzione del contratto o misure precontrattuali, art. 6(1)(b)
            GDPR);
          </li>
          <li>
            sicurezza, prevenzione abusi e continuità operativa del servizio (
            <strong className="text-foreground/90">base giuridica:</strong>{" "}
            legittimo interesse, art. 6(1)(f) GDPR);
          </li>
          <li>
            adempimento di obblighi di legge (
            <strong className="text-foreground/90">base giuridica:</strong>{" "}
            obbligo legale, art. 6(1)(c) GDPR);
          </li>
          <li>
            risposta a richieste dell&apos;utente relative ai propri diritti (
            <strong className="text-foreground/90">base giuridica:</strong>{" "}
            obbligo legale, art. 6(1)(c) GDPR).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          5. Fornitori di servizi e responsabili del trattamento
        </h2>
        <p>
          Per erogare PreventivPRO ci avvaliamo di fornitori terzi che trattano
          dati per nostro conto, in qualità di responsabili del trattamento
          ai sensi dell&apos;art. 28 GDPR:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-muted">
          <li>
            <strong className="text-foreground/90">Supabase</strong> — per
            autenticazione degli utenti e archiviazione del database (clienti,
            preventivi e dati di account). I server possono essere ubicati
            nell&apos;Unione Europea o in paesi terzi; in tal caso sono
            adottate garanzie adeguate previste dal GDPR.
          </li>
          <li>
            <strong className="text-foreground/90">Vercel</strong> — per
            hosting dell&apos;applicazione web e distribuzione del servizio.
          </li>
        </ul>
        <p>
          I fornitori sono selezionati tra soggetti che offrono misure di
          sicurezza tecniche e organizzative adeguate. Non vendiamo i dati
          personali a terzi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          6. Conservazione dei dati
        </h2>
        <p>
          I dati sono conservati per il tempo necessario a erogare il servizio
          e per adempiere agli obblighi di legge. In caso di cancellazione
          dell&apos;account o su richiesta dell&apos;utente, i dati personali
          vengono eliminati o anonimizzati, salvo obblighi di conservazione
          previsti dalla legge.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          7. Proprietà dei dati e cancellazione
        </h2>
        <p>
          I contenuti inseriti dall&apos;utente — inclusi dati dei clienti e
          dei preventivi — appartengono all&apos;utente stesso. PreventivPRO
          li tratta esclusivamente per fornire il servizio richiesto.
        </p>
        <p>
          L&apos;utente può richiedere in qualsiasi momento la cancellazione
          del proprio account e dei dati associati scrivendo a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent hover:text-sky-400 underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          . Provvederemo a evadere la richiesta nei termini previsti dal GDPR,
          salvo dati che siamo tenuti a conservare per obbligo di legge.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          8. Diritti dell&apos;interessato
        </h2>
        <p>
          Ai sensi degli artt. 15–22 del GDPR, l&apos;utente ha diritto di:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-muted">
          <li>accedere ai propri dati personali;</li>
          <li>rettificarli se inesatti o incompleti;</li>
          <li>chiederne la cancellazione (&quot;diritto all&apos;oblio&quot;);</li>
          <li>limitarne il trattamento;</li>
          <li>opporsi al trattamento per motivi legittimi;</li>
          <li>richiedere la portabilità dei dati, ove applicabile;</li>
          <li>
            revocare il consenso, ove il trattamento sia basato sul consenso,
            senza pregiudicare la liceità del trattamento precedente;
          </li>
          <li>
            proporre reclamo all&apos;Autorità Garante per la protezione dei
            dati personali (
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-sky-400 underline underline-offset-2"
            >
              www.garanteprivacy.it
            </a>
            ).
          </li>
        </ul>
        <p>
          Per esercitare i propri diritti, scrivere a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent hover:text-sky-400 underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">9. Sicurezza</h2>
        <p>
          Adottiamo misure tecniche e organizzative adeguate per proteggere i
          dati personali da accessi non autorizzati, perdita, distruzione o
          alterazione, incluse connessioni crittografate (HTTPS), controlli di
          accesso e isolamento dei dati per utente.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          10. Cookie e tecnologie simili
        </h2>
        <p>
          PreventivPRO utilizza cookie e storage locale strettamente necessari
          al funzionamento del servizio, inclusi cookie di sessione per
          l&apos;autenticazione e la memorizzazione di preferenze tecniche.
          Non utilizziamo cookie di profilazione o pubblicitari.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          11. Modifiche alla presente informativa
        </h2>
        <p>
          Ci riserviamo il diritto di aggiornare la presente Informativa sulla
          privacy. Le modifiche saranno pubblicate su questa pagina con
          indicazione della data di ultimo aggiornamento. Si consiglia di
          consultare periodicamente questa pagina.
        </p>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold text-accent">12. Contatti</h2>
        <p>
          Per domande, richieste di accesso, rettifica, cancellazione o
          portabilità dei dati:
        </p>
        <p>
          Email:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent hover:text-sky-400 underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </article>
  );
}
