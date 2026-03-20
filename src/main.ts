import './styles/reset.css';
import './styles/variables.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/views.css';
import './styles/utilities.css';

import { store } from './state/store';
import { renderIdentityScreen } from './components/IdentityScreen';
import { renderLanding } from './components/Landing';
import { showSeasonOptions } from './components/SeasonOptions';
import { renderBrowseView } from './components/BrowseView';
import { renderSingleCardView } from './components/SingleCardView';
import { renderAddView } from './components/AddView';
import { renderEditView } from './components/EditView';
import { getRandomEntry } from './lib/db';
import type { EnvelopeContext } from './components/EnvelopeStack';
import { closePlaylist } from './lib/spotify';
import { preloadStamps } from './lib/seasons';
import type { Season, Entry } from './types';

const app = document.getElementById('app')!;
preloadStamps();

/** Remove any view overlays attached to document.body (browse, single-card, edit, empty-message) */
function removeBodyOverlays(): void {
  closePlaylist();
  document.querySelectorAll(
    'body > .browse-view, body > .single-card-view, body > .add-view, body > [data-overlay]'
  ).forEach(el => el.remove());
}

function renderApp(): void {
  const user = store.getCurrentUser();

  if (user) {
    showLanding();
  } else {
    renderIdentityScreen(app, () => {
      showLanding();
    });
  }
}

function showLanding(): void {
  removeBodyOverlays();
  renderLanding(app, {
    onSeasonTap: (season: Season, envelopeEl: HTMLElement, ctx: EnvelopeContext) => {
      showSeasonOptions(envelopeEl, season, ctx, {
        onBrowse(openedEnvelope: HTMLElement, shrinkBack: () => void) {
          // Envelope is fullscreen — render Browse on top, fade in cards
          renderBrowseView(app, season, {
            onCardTap(entry: Entry) {
              // From Browse, go to SingleCard (no envelope transition)
              showSingleCard(entry, season, 'browse');
            },
            onBack() {
              // Content faded out (handled by BrowseView) — now shrink envelope
              shrinkBack();
            },
          }, openedEnvelope);
        },
        async onSurprise(openedEnvelope: HTMLElement, shrinkBack: () => void) {
          try {
            const entry = await getRandomEntry(season);
            if (entry) {
              renderSingleCardView(app, entry, season, {
                onBack() {
                  shrinkBack();
                },
                onEdit(e: Entry) {
                  showEdit(e, season, 'distributed');
                },
              }, openedEnvelope);
            } else {
              // No entries — show empty message on the fullscreen envelope
              showEmptyMessage(openedEnvelope, shrinkBack);
            }
          } catch (err) {
            console.error('Failed to fetch random entry:', err);
            showEmptyMessage(openedEnvelope, shrinkBack);
          }
        },
      });
    },
    onPenTap: () => {
      showAdd();
    },
  });
}

function showSingleCard(entry: Entry, season: Season, from: 'browse' | 'distributed'): void {
  if (from === 'browse') {
    // Overlay SingleCardView on top of Browse View — don't destroy browse
    renderSingleCardView(app, entry, season, {
      onBack() {
        // Just remove the single-card overlay; browse is still underneath
        document.querySelectorAll('body > .single-card-view').forEach(el => el.remove());
      },
      onEdit(e: Entry) {
        showEdit(e, season, from);
      },
    }, 'overlay');
  } else {
    removeBodyOverlays();
    renderSingleCardView(app, entry, season, {
      onBack() {
        showLanding();
      },
      onEdit(e: Entry) {
        showEdit(e, season, from);
      },
    });
  }
}

function showEdit(entry: Entry, season: Season, from: 'browse' | 'distributed'): void {
  // Don't remove overlays — EditView slides on top of the current view
  renderEditView(entry, {
    onBack() {
      showSingleCard(entry, season, from);
    },
    onSaved(updated: Entry) {
      showSingleCard(updated, season, from);
    },
  });
}

function showAdd(): void {
  // Add View overlays the landing — no need to re-render landing on dismiss
  renderAddView({
    onBack() {
      // Paper slides down, landing is already visible underneath
    },
    onSaved() {
      // Paper slides down, landing is already visible underneath
    },
  });
}

function showEmptyMessage(_envelopeEl: HTMLElement, shrinkBack: () => void): void {
  const overlay = document.createElement('div');
  overlay.dataset.overlay = '';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '30';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background = 'transparent';

  const msg = document.createElement('p');
  msg.textContent = 'nothing here yet';
  msg.style.fontFamily = 'var(--font-ui)';
  msg.style.fontSize = '1.2rem';
  msg.style.color = 'var(--color-text-secondary)';
  overlay.appendChild(msg);

  const backBtn = document.createElement('button');
  backBtn.textContent = 'back';
  backBtn.style.fontFamily = 'var(--font-ui)';
  backBtn.style.fontSize = '1rem';
  backBtn.style.marginTop = '16px';
  backBtn.style.background = 'none';
  backBtn.style.border = 'none';
  backBtn.style.color = 'var(--color-text)';
  backBtn.style.cursor = 'pointer';
  backBtn.addEventListener('click', () => {
    overlay.remove();
    shrinkBack();
  });
  overlay.appendChild(backBtn);

  document.body.appendChild(overlay);
}

renderApp();
