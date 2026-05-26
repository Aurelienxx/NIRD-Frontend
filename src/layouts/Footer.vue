<script setup lang="ts">
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">


        <div class="footer-section">
          <div class="social-links">
            <a href="https://www.tchap.gouv.fr/#/welcome" target="_blank" class="social-link">
              <img src="/img/icons/tchap.png" class="social-icon" /> Tchap
            </a>
            <a href="https://mastodon.mim-libre.fr/@demarchenird" target="_blank" class="social-link">
              <img src="/img/icons/mastodon.png" class="social-icon" /> Mastodon
            </a>
            <a href="https://forge.apps.education.fr/nird" target="_blank" class="social-link">
              <img src="/img/icons/forge.png" class="social-icon" />La Forge
            </a>
          </div>
        </div>


        <div class="footer-section">
          <br>
          <h3 class="footer-title">À propos de NIRD</h3>
          <p>
            Ce site est à l'initiative d'un collectif enseignant réuni sur le forum Tchap de la Démarche NIRD que nous vous invitons à rejoindre si vous êtes intéressé par la démarche.
            Pour contacter le collectif : demarche.nird@ldif.education.gouv.fr.
          </p>
        </div>



      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 NIRD Community. Tous droits réservés.</p>
        <div class="footer-bottom-links">
          <a href="#" class="footer-link-small">Politique de confidentialité</a>
          <a href="#" class="footer-link-small">Conditions d'utilisation</a>
          <a href="#" class="footer-link-small">Mentions légales</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--background-1);
  color: var(--text-white);
  padding: 3rem 0 0;
  margin-top: auto;
  width: 100%;
}

.footer-content {
  gap: 2rem;
  padding: 3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-section p {
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
  color: var(--text-white);
  font-size: 0.95rem;
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-white);
}

.social-links {
  color: aliceblue;
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.social-link {
  font-size: 1.5rem;
  color: var(--lk-2);
  text-decoration: none;
  transition: opacity 0.3s;
}

.social-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.social-icon {
  width: 25px;
  height: 25px;
  margin-right: 0.5rem;
}

.footer-bottom {
  padding: 2rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  opacity: 0.85;
}

.footer-bottom p {
  margin: 0;
  color: var(--text-white);
}

.footer-bottom-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-link-small {
  color: var(--text-white);
  opacity: 0.85;
  transition: opacity 0.3s;
  font-size: 0.9rem;
  text-decoration: none;
}

.footer-link-small:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-bottom-links {
    justify-content: center;
  }

  .social-links {
    flex-direction: column;
  }
}
</style>