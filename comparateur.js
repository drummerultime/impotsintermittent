// Fonctionnalité de comparaison entre abattement forfaitaire et frais réels

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le comparateur d'options
    initComparateurOptions();
});

// Fonction pour initialiser le comparateur d'options
function initComparateurOptions() {
    // Ajouter la section de comparaison dans l'onglet Frais Réels
    const fraisReelsTab = document.getElementById('frais-reels');
    if (!fraisReelsTab) return;
    
    // Vérifier si la section existe déjà
    if (!document.getElementById('comparateur-options')) {
        const comparateurSection = document.createElement('div');
        comparateurSection.id = 'comparateur-options';
        comparateurSection.className = 'comparateur-section';
        comparateurSection.innerHTML = `
            <h3>Comparateur d'options de déduction</h3>
            <p>Cet outil vous permet de comparer l'impact fiscal entre l'abattement forfaitaire de 10% et la déduction des frais réels.</p>
            
            <button id="btn-comparer-options" class="btn">Comparer les options</button>
            
            <div id="resultats-comparaison" class="comparateur-resultats hidden"></div>
        `;
        
        // Insérer avant les actions de formulaire
        const formActions = fraisReelsTab.querySelector('.form-actions');
        fraisReelsTab.insertBefore(comparateurSection, formActions);
        
        // Ajouter le gestionnaire d'événement pour le bouton de comparaison
        document.getElementById('btn-comparer-options').addEventListener('click', comparerOptions);
    }
}

// Fonction pour comparer les options de déduction
function comparerOptions() {
    // Récupérer les données du formulaire
    const salaireBrut = parseFloat(document.getElementById('salaire-brut').value) || 0;
    const allocationChomage = parseFloat(document.getElementById('allocations-chomage').value) || 0;
    const autresRevenus = parseFloat(document.getElementById('autres-revenus').value) || 0;
    
    // Calculer le total des revenus
    const totalRevenus = salaireBrut + allocationChomage + autresRevenus;
    
    // Calculer l'abattement forfaitaire (10% plafonné à 12829€ pour 2023)
    const abattementForfaitaire = Math.min(totalRevenus * 0.1, 12829);
    
    // Calculer le total des frais réels
    const fraisTransport = parseFloat(document.getElementById('frais-transport').value) || 0;
    const fraisRepas = parseFloat(document.getElementById('frais-repas').value) || 0;
    const fraisHebergement = parseFloat(document.getElementById('frais-hebergement').value) || 0;
    const fraisMateriel = parseFloat(document.getElementById('frais-materiel').value) || 0;
    const fraisFormation = parseFloat(document.getElementById('frais-formation').value) || 0;
    const fraisDocumentation = parseFloat(document.getElementById('frais-documentation').value) || 0;
    const autresFrais = parseFloat(document.getElementById('autres-frais').value) || 0;
    
    const totalFraisReels = fraisTransport + fraisRepas + fraisHebergement + fraisMateriel + fraisFormation + fraisDocumentation + autresFrais;
    
    // Calculer les revenus imposables pour chaque option
    const revenuImposableForfait = totalRevenus - abattementForfaitaire;
    const revenuImposableFraisReels = totalRevenus - totalFraisReels;
    
    // Calculer l'impôt pour chaque option
    const impotForfait = calculerImpotSimple(revenuImposableForfait);
    const impotFraisReels = calculerImpotSimple(revenuImposableFraisReels);
    
    // Déterminer l'option la plus avantageuse
    const difference = impotForfait - impotFraisReels;
    const optionAvantageuse = difference > 0 ? 'frais-reels' : 'forfait';
    
    // Afficher les résultats
    const resultatComparaison = document.getElementById('resultats-comparaison');
    resultatComparaison.innerHTML = `
        <div class="option-column">
            <h4>Option Abattement Forfaitaire</h4>
            <p>Abattement : ${abattementForfaitaire.toFixed(2)} €</p>
            <p>Revenu imposable : ${revenuImposableForfait.toFixed(2)} €</p>
            <p class="big-number">Impôt estimé : ${impotForfait.toFixed(2)} €</p>
        </div>
        
        <div class="option-column">
            <h4>Option Frais Réels</h4>
            <p>Total des frais : ${totalFraisReels.toFixed(2)} €</p>
            <p>Revenu imposable : ${revenuImposableFraisReels.toFixed(2)} €</p>
            <p class="big-number">Impôt estimé : ${impotFraisReels.toFixed(2)} €</p>
        </div>
        
        <div class="difference-highlight">
            ${Math.abs(difference).toFixed(2)} € d'économie avec l'option ${optionAvantageuse === 'frais-reels' ? 'Frais Réels' : 'Abattement Forfaitaire'}
        </div>
    `;
    
    // Afficher les résultats
    resultatComparaison.classList.remove('hidden');
    
    // Mettre à jour l'option sélectionnée dans le formulaire
    if (confirm(`L'option la plus avantageuse pour vous est : ${optionAvantageuse === 'frais-reels' ? 'Frais Réels' : 'Abattement Forfaitaire'}. Voulez-vous sélectionner cette option ?`)) {
        document.getElementById('option-deduction').value = optionAvantageuse;
        // Déclencher l'événement change pour mettre à jour l'affichage
        const event = new Event('change');
        document.getElementById('option-deduction').dispatchEvent(event);
    }
}

// Fonction simplifiée pour calculer l'impôt (barème 2023)
function calculerImpotSimple(revenuImposable) {
    let impot = 0;
    
    // Tranche 1 : 0%
    if (revenuImposable <= 10777) {
        return 0;
    }
    
    // Tranche 2 : 11%
    if (revenuImposable > 10777) {
        const montantTranche2 = Math.min(revenuImposable, 27478) - 10777;
        impot += montantTranche2 * 0.11;
    }
    
    // Tranche 3 : 30%
    if (revenuImposable > 27478) {
        const montantTranche3 = Math.min(revenuImposable, 78570) - 27478;
        impot += montantTranche3 * 0.30;
    }
    
    // Tranche 4 : 41%
    if (revenuImposable > 78570) {
        const montantTranche4 = Math.min(revenuImposable, 168994) - 78570;
        impot += montantTranche4 * 0.41;
    }
    
    // Tranche 5 : 45%
    if (revenuImposable > 168994) {
        const montantTranche5 = revenuImposable - 168994;
        impot += montantTranche5 * 0.45;
    }
    
    return impot;
}