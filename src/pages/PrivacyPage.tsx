import { PageHeader } from '../components/Common'
import { SITE } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Politique de confidentialité — version de travail, fidèle au fonctionnement réel du site
 * (aucun serveur de collecte, aucun cookie de suivi). À faire relire et compléter avant la mise en production
 * (responsable du traitement, durée de conservation côté WhatsApp, droits d'accès selon la loi camerounaise applicable).
 */
export function PrivacyPage() {
  usePageMeta('Confidentialité', 'Comment PIXEL PLAY traite les informations saisies dans le formulaire « Vendre mon appareil ».', '/confidentialite')

  return (
    <>
      <PageHeader
        title="Confidentialité"
        intro="Ce que fait (et ne fait pas) ce site avec vos informations."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Confidentialité' }]}
      />
      <div className="container prose">
        <p className="prose__draft" role="note">
          Version de travail à valider avant la mise en ligne définitive.
        </p>

        <h2>Ce que le site enregistre</h2>
        <p>
          Ce site n’a pas de serveur de collecte : il n’enregistre ni vos commandes, ni le contenu du formulaire « Vendre
          mon appareil », ni vos photos. Il n’utilise pas de compte client, pas de paiement en ligne et pas de cookie de
          suivi publicitaire.
        </p>

        <h2>Le formulaire « Vendre mon appareil »</h2>
        <p>
          Les informations saisies (nom, téléphone, localisation, description de l’appareil) restent dans votre navigateur
          le temps de la saisie. Elles ne sont transmises que lorsque vous cliquez sur « Ouvrir WhatsApp » : elles
          constituent alors le texte du message, que vous envoyez vous-même à {SITE.name} ({SITE.phone.display}). Une
          fois dans WhatsApp, leur traitement dépend aussi des conditions de WhatsApp.
        </p>
        <p>
          Elles servent uniquement à étudier votre demande d’estimation et à vous répondre. Rien n’est mémorisé dans le
          navigateur après avoir quitté la page.
        </p>

        <h2>Vos photos</h2>
        <p>
          Les photos sélectionnées restent sur votre appareil : elles servent à l’aperçu et ne sont pas envoyées par le
          site. C’est vous qui les joignez dans la conversation WhatsApp. Avant de les partager, masquez les
          informations sensibles (numéro de série, IMEI, données personnelles à l’écran).
        </p>

        <h2>Identifiants et mots de passe</h2>
        <p>
          {SITE.name} ne vous demande jamais de mot de passe, de code de vérification ni d’identifiants de compte de
          jeux. Ne les communiquez à personne.
        </p>

        <h2>Vous écrire ou nous écrire</h2>
        <p>
          Pour toute question sur vos informations (consultation, correction, suppression des messages échangés),
          écrivez-nous sur WhatsApp au {SITE.phone.display}.
        </p>
      </div>
    </>
  )
}
