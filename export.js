// Fonctionnalités d'exportation et de comparaison pour le calculateur d'impôts

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les gestionnaires d'événements pour les boutons d'exportation
    initExportButtons();
    
    // Initialiser le système de sauvegarde locale
    initLocalStorage();
    
    // Initialiser le comparateur de simulations
    initComparateur();
});

// Fonction pour initialiser les boutons d'exportation
function initExportButtons() {
    // Ajouter les boutons d'exportation à la section d'exportation
    const exportSection = document.querySelector('.export-section');
    if (!exportSection) return;
    
    const exportButtons = document.createElement('div');
    exportButtons.className = 'export-buttons';
    exportButtons.innerHTML = `
        <h4>Exporter vos résultats</h4>
        <div class="btn-group">
            <button id="btn-export-pdf" class="btn btn-export">Exporter en PDF</button>
            <button id="btn-save-local" class="btn btn-export">Sauvegarder ce calcul</button>
            <button id="btn-export-excel" class="btn btn-export">Exporter en Excel</button>
        </div>
    `;
    
    // Insérer les boutons avant le bouton d'impression existant
    const btnImprimer = document.getElementById('btn-imprimer');
    exportSection.insertBefore(exportButtons, btnImprimer.parentNode);
    
    // Ajouter les gestionnaires d'événements pour les boutons
    document.getElementById('btn-export-pdf').addEventListener('click', exportToPDF);
    document.getElementById('btn-save-local').addEventListener('click', saveToLocalStorage);
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
}

// Fonction pour exporter les résultats en PDF
function exportToPDF() {
    // Vérifier si la bibliothèque jsPDF est chargée
    if (typeof jspdf === 'undefined') {
        // Si la bibliothèque n'est pas chargée, l'ajouter dynamiquement
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
            // Une fois la bibliothèque chargée, ajouter la bibliothèque html2canvas
            const script2 = document.createElement('script');
            script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script2.onload = function() {
                // Une fois les deux bibliothèques chargées, générer le PDF
                generatePDF();
            };
            document.head.appendChild(script2);
        };
        document.head.appendChild(script);
    } else {
        // Si la bibliothèque est déjà chargée, générer le PDF directement
        generatePDF();
    }
}

// Fonction pour générer le PDF avec jsPDF
function generatePDF() {
    // Créer une notification pour informer l'utilisateur
    showNotification('Génération du PDF en cours...', 'info');
    
    // Récupérer les données du calcul
    const annee = new Date().getFullYear() - 1; // Année fiscale (année précédente)
    const salaireBrut = parseFloat(document.getElementById('salaire-brut').value) || 0;
    const allocationChomage = parseFloat(document.getElementById('allocations-chomage').value) || 0;
    const autresRevenus = parseFloat(document.getElementById('autres-revenus').value) || 0;
    const optionDeduction = document.getElementById('option-deduction').value;
    const revenuImposable = document.getElementById('revenu-imposable').textContent;
    const estimationImpot = document.querySelector('#estimation-impot .big-number').textContent;
    
    // Créer un nouvel objet jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Ajouter un titre
    doc.setFontSize(18);
    doc.text('Simulation d\'impôts pour intermittent du spectacle', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Année fiscale ${annee}`, 105, 22, { align: 'center' });
    
    // Ajouter la date de génération
    doc.setFontSize(10);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' });
    
    // Ajouter un séparateur
    doc.setDrawColor(100, 100, 100);
    doc.line(20, 35, 190, 35);
    
    // Ajouter les informations de revenus
    doc.setFontSize(14);
    doc.text('Récapitulatif des revenus', 20, 45);
    
    doc.setFontSize(12);
    doc.text('Salaire brut (cachets):', 25, 55);
    doc.text(`${salaireBrut.toFixed(2)} €`, 150, 55, { align: 'right' });
    
    doc.text('Allocations chômage:', 25, 62);
    doc.text(`${allocationChomage.toFixed(2)} €`, 150, 62, { align: 'right' });
    
    doc.text('Autres revenus:', 25, 69);
    doc.text(`${autresRevenus.toFixed(2)} €`, 150, 69, { align: 'right' });
    
    doc.text('Total des revenus:', 25, 76);
    doc.text(`${(salaireBrut + allocationChomage + autresRevenus).toFixed(2)} €`, 150, 76, { align: 'right' });
    
    // Ajouter les informations de déductions
    doc.setFontSize(14);
    doc.text('Déductions', 20, 90);
    
    doc.setFontSize(12);
    if (optionDeduction === 'forfait') {
        doc.text('Option choisie: Abattement forfaitaire de 10%', 25, 100);
    } else {
        doc.text('Option choisie: Frais réels', 25, 100);
        
        // Ajouter le détail des frais réels si disponible
        let yPos = 107;
        
        // Frais de transport
        const fraisTransport = parseFloat(document.getElementById('frais-transport').value) || 0;
        if (fraisTransport > 0) {
            doc.text('Frais de transport:', 30, yPos);
            doc.text(`${fraisTransport.toFixed(2)} €`, 150, yPos, { align: 'right' });
            yPos += 7;
        }
        
        // Frais de matériel
        const fraisMateriel = parseFloat(document.getElementById('frais-materiel').value) || 0;
        if (fraisMateriel > 0) {
            doc.text('Matériel professionnel:', 30, yPos);
            doc.text(`${fraisMateriel.toFixed(2)} €`, 150, yPos, { align: 'right' });
            yPos += 7;
        }
        
        // Frais de formation
        const fraisFormation = parseFloat(document.getElementById('frais-formation').value) || 0;
        if (fraisFormation > 0) {
            doc.text('Formation:', 30, yPos);
            doc.text(`${fraisFormation.toFixed(2)} €`, 150, yPos, { align: 'right' });
            yPos += 7;
        }
        
        // Frais de documentation
        const fraisDocumentation = parseFloat(document.getElementById('frais-documentation').value) || 0;
        if (fraisDocumentation > 0) {
            doc.text('Documentation:', 30, yPos);
            doc.text(`${fraisDocumentation.toFixed(2)} €`, 150, yPos, { align: 'right' });
            yPos += 7;
        }
        
        // Autres frais
        const autresFrais = parseFloat(document.getElementById('autres-frais').value) || 0;
        if (autresFrais > 0) {
            doc.text('Autres frais:', 30, yPos);
            doc.text(`${autresFrais.toFixed(2)} €`, 150, yPos, { align: 'right' });
            yPos += 7;
        }
    }
    
    // Ajouter un séparateur
    doc.setDrawColor(100, 100, 100);
    doc.line(20, 130, 190, 130);
    
    // Ajouter les résultats
    doc.setFontSize(14);
    doc.text('Résultats du calcul', 20, 140);
    
    doc.setFontSize(12);
    doc.text('Revenu net imposable:', 25, 150);
    doc.text(revenuImposable, 150, 150, { align: 'right' });
    
    doc.text('Estimation de l\'impôt sur le revenu:', 25, 157);
    doc.text(estimationImpot, 150, 157, { align: 'right' });
    
    // Ajouter un pied de page
    doc.setFontSize(10);
    doc.text('Cette simulation est fournie à titre indicatif et ne constitue pas un document officiel.', 105, 280, { align: 'center' });
    
    // Enregistrer le PDF
    doc.save(`simulation_impots_intermittent_${annee}.pdf`);
    
    // Afficher une notification de succès
    showNotification('Votre PDF a été généré avec succès !', 'success');
}

// Fonction pour sauvegarder les données dans le stockage local
function saveToLocalStorage() {
    // Récupérer les données du formulaire
    const salaireBrut = parseFloat(document.getElementById('salaire-brut').value) || 0;
    const allocationChomage = parseFloat(document.getElementById('allocations-chomage').value) || 0;
    const autresRevenus = parseFloat(document.getElementById('autres-revenus').value) || 0;
    const optionDeduction = document.getElementById('option-deduction').value;
    
    // Récupérer les frais réels si cette option est sélectionnée
    let fraisReels = {};
    if (optionDeduction === 'reels') {
        fraisReels = {
            transport: parseFloat(document.getElementById('frais-transport').value) || 0,
            repas: parseFloat(document.getElementById('frais-repas').value) || 0,
            hebergement: parseFloat(document.getElementById('frais-hebergement').value) || 0,
            materiel: parseFloat(document.getElementById('frais-materiel').value) || 0,
            formation: parseFloat(document.getElementById('frais-formation').value) || 0,
            documentation: parseFloat(document.getElementById('frais-documentation').value) || 0,
            autres: parseFloat(document.getElementById('autres-frais').value) || 0
        };
    }
    
    // Récupérer les résultats calculés
    const revenuImposable = document.getElementById('revenu-imposable').textContent;
    const estimationImpot = document.querySelector('#estimation-impot .big-number').textContent;
    
    // Créer un objet avec toutes les données
    const calculData = {
        date: new Date().toISOString(),
        anneeFiscale: new Date().getFullYear() - 1,
        revenus: {
            salaireBrut,
            allocationChomage,
            autresRevenus
        },
        optionDeduction,
        fraisReels,
        missions: missions || [],
        factures: factures || [],
        resultats: {
            revenuImposable,
            estimationImpot
        }
    };
    
    // Récupérer les calculs existants ou initialiser un tableau vide
    let savedCalculs = JSON.parse(localStorage.getItem('impots_calculs') || '[]');
    
    // Ajouter le nouveau calcul
    savedCalculs.push(calculData);
    
    // Limiter le nombre de calculs sauvegardés (garder les 10 plus récents)
    if (savedCalculs.length > 10) {
        savedCalculs = savedCalculs.slice(-10);
    }
    
    // Sauvegarder dans le stockage local
    localStorage.setItem('impots_calculs', JSON.stringify(savedCalculs));
    
    // Afficher une notification
    showNotification('Votre calcul a été sauvegardé avec succès !', 'success');
    
    // Mettre à jour la liste des calculs sauvegardés
    updateSavedCalculsList();
}

// Fonction pour initialiser le système de sauvegarde locale
function initLocalStorage() {
    // Créer la section d'historique des calculs
    const resultsTab = document.getElementById('resultats');
    if (!resultsTab) return;
    
    // Vérifier si la section existe déjà
    if (!document.getElementById('historique-calculs')) {
        const historiqueSection = document.createElement('div');
        historiqueSection.id = 'historique-calculs';
        historiqueSection.className = 'historique-section';
        historiqueSection.innerHTML = `
            <h3>Historique de vos calculs</h3>
            <p>Retrouvez ici vos simulations précédentes et comparez-les.</p>
            <div id="liste-calculs" class="liste-calculs">
                <p class="empty-state">Aucun calcul sauvegardé pour le moment.</p>
            </div>
        `;
        
        // Insérer avant les actions de formulaire
        const formActions = resultsTab.querySelector('.form-actions');
        resultsTab.insertBefore(historiqueSection, formActions);
    }
    
    // Mettre à jour la liste des calculs sauvegardés
    updateSavedCalculsList();
}

// Fonction pour mettre à jour la liste des calculs sauvegardés
function updateSavedCalculsList() {
    const listeCalculs = document.getElementById('liste-calculs');
    if (!listeCalculs) return;
    
    // Récupérer les calculs sauvegardés
    const savedCalculs = JSON.parse(localStorage.getItem('impots_calculs') || '[]');
    
    // Vider la liste actuelle
    listeCalculs.innerHTML = '';
    
    // Si aucun calcul n'est sauvegardé, afficher un message
    if (savedCalculs.length === 0) {
        listeCalculs.innerHTML = '<p class="empty-state">Aucun calcul sauvegardé pour le moment.</p>';
        return;
    }
    
    // Créer un élément pour chaque calcul sauvegardé
    savedCalculs.forEach((calcul, index) => {
        const date = new Date(calcul.date).toLocaleDateString('fr-FR');
        const calculElement = document.createElement('div');
        calculElement.className = 'calcul-item';
        calculElement.innerHTML = `
            <div class="calcul-header">
                <span class="calcul-date">Calcul du ${date} - Année fiscale ${calcul.anneeFiscale}</span>
                <div class="calcul-actions">
                    <button class="btn btn-small btn-load" data-index="${index}">Charger</button>
                    <button class="btn btn-small btn-compare" data-index="${index}">Comparer</button>
                    <button class="btn btn-small btn-danger" data-index="${index}">Supprimer</button>
                </div>
            </div>
            <div class="calcul-details">
                <p>Revenus: ${(calcul.revenus.salaireBrut + calcul.revenus.allocationChomage + calcul.revenus.autresRevenus).toFixed(2)} €</p>
                <p>Option: ${calcul.optionDeduction === 'forfait' ? 'Abattement forfaitaire' : 'Frais réels'}</p>
                <p>Impôt estimé: ${calcul.resultats.estimationImpot}</p>
            </div>
        `;
        
        listeCalculs.appendChild(calculElement);
    });
    
    // Ajouter les gestionnaires d'événements pour les boutons
    const loadButtons = listeCalculs.querySelectorAll('.btn-load');
    loadButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            loadSavedCalcul(index);
        });
    });
    
    const compareButtons = listeCalculs.querySelectorAll('.btn-compare');
    compareButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            compareCalcul(index);
        });
    });
    
    const deleteButtons = listeCalculs.querySelectorAll('.btn-danger');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteSavedCalcul(index);
        });
    });
}

// Fonction pour charger un calcul sauvegardé
function loadSavedCalcul(index) {
    // Récupérer les calculs sauvegardés
    const savedCalculs = JSON.parse(localStorage.getItem('impots_calculs') || '[]');
    
    // Vérifier que l'index est valide
    if (index < 0 || index >= savedCalculs.length) {
        showNotification('Calcul introuvable.', 'error');
        return;
    }
    
    // Récupérer le calcul à charger
    const calcul = savedCalculs[index];
    
    // Remplir le formulaire avec les données sauvegardées
    document.getElementById('salaire-brut').value = calcul.revenus.salaireBrut;
    document.getElementById('allocations-chomage').value = calcul.revenus.allocationChomage;
    document.getElementById('autres-revenus').value = calcul.revenus.autresRevenus;
    document.getElementById('option-deduction').value = calcul.optionDeduction;
    
    // Déclencher l'événement change pour mettre à jour l'affichage des frais réels
    const event = new Event('change');
    document.getElementById('option-deduction').dispatchEvent(event);
    
    // Si l'option est frais réels, remplir les champs correspondants
    if (calcul.optionDeduction === 'reels') {
        document.getElementById('frais-transport').value = calcul.fraisReels.transport;
        document.getElementById('frais-repas').value = calcul.fraisReels.repas;
        document.getElementById('frais-hebergement').value = calcul.fraisReels.hebergement;
        document.getElementById('frais-materiel').value = calcul.fraisReels.materiel;
        document.getElementById('frais-formation').value = calcul.fraisReels.formation;
        document.getElementById('frais-documentation').value = calcul.fraisReels.documentation;
        document.getElementById('autres-frais').value = calcul.fraisReels.autres;
        
        // Charger les missions et factures si disponibles
        if (calcul.missions && calcul.missions.length > 0) {
            missions = calcul.missions;
            afficherMissions();
        }
        
        if (calcul.factures && calcul.factures.length > 0) {
            factures = calcul.factures;
            afficherFactures();
        }
    }
    
    // Afficher une notification
    showNotification('Calcul chargé avec succès !', 'success');
    
    // Aller à l'onglet revenus
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    document.querySelector('[data-tab="revenus"]').classList.add('active');
    document.getElementById('revenus').classList.add('active');
}

// Fonction pour supprimer un calcul sauvegardé
function deleteSavedCalcul(index) {
    // Demander confirmation
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce calcul ?')) {
        return;
    }
    
    // Récupérer les calculs sauvegardés
    let savedCalculs = JSON.parse(localStorage.getItem('impots_calculs') || '[]');
    
    // Vérifier que l'index est valide
    if (index < 0 || index >= savedCalculs.length) {
        showNotification('Calcul introuvable.', 'error');
        return;
    }
    
    // Supprimer le calcul
    savedCalculs.splice(index, 1);
    
    // Sauvegarder les calculs mis à jour
    localStorage.setItem('impots_calculs', JSON.stringify(savedCalculs));
    
    // Mettre à jour la liste des calculs
    updateSavedCalculsList();
    
    // Afficher une notification
    showNotification('Calcul supprimé avec succès !', 'success');
}

// Fonction pour comparer un calcul sauvegardé avec le calcul actuel
function compareCalcul(index) {
    // Récupérer les calculs sauvegardés
    const savedCalculs = JSON.parse(localStorage.getItem('impots_calculs') || '[]');
    
    // Vérifier que l'index est valide
    if (index < 0 || index >= savedCalculs.length) {
        showNotification('Calcul introuvable.', 'error');
        return;
    }
    
    // Récupérer le calcul à comparer
    const calculSauvegarde = savedCalculs[index];
    
    // Calculer les impôts avec les données actuelles
    calculerImpots();
    
    // Récupérer les données du calcul actuel
    const salaireBrut = parseFloat(document.getElementById('salaire-brut').value) || 0;
    const allocationChomage = parseFloat(document.getElementById('allocations-chomage').value) || 0;
    const autresRevenus = parseFloat(document.getElementById('autres-revenus').value) || 0;
    const optionDeduction = document.getElementById('option-deduction').value;
    const revenuImposable = document.getElementById('revenu-imposable').textContent;
    const estimationImpot = document.querySelector('#estimation-impot .big-number').textContent;
    
    // Créer la fenêtre modale de comparaison
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Comparaison de simulations</h2>
            
            <div class="comparison-container">
                <div class="comparison-column">
                    <h3>Simulation actuelle</h3>
                    <div class="comparison-data">
                        <h4>Revenus</h4>
                        <p>Salaire brut: ${salaireBrut.toFixed(2)} €</p>
                        <p>Allocations chômage: ${allocationChomage.toFixed(2)} €</p>
                        <p>Autres revenus: ${autresRevenus.toFixed(2)} €</p>
                        <p><strong>Total: ${(salaireBrut + allocationChomage + autresRevenus).toFixed(2)} €</strong></p>
                        
                        <h4>Déductions</h4>
                        <p>Option: ${optionDeduction === 'forfait' ? 'Abattement forfaitaire' : 'Frais réels'}</p>
                        
                        <h4>Résultats</h4>
                        <p>Revenu imposable: ${revenuImposable}</p>
                        <p>Impôt estimé: ${estimationImpot}</p>
                    </div>
                </div>
                
                <div class="comparison-column">
                    <h3>Simulation sauvegardée (${new Date(calculSauvegarde.date).toLocaleDateString('fr-FR')})</h3>
                    <div class="comparison-data">
                        <h4>Revenus</h4>
                        <p>Salaire brut: ${calculSauvegarde.revenus.salaireBrut.toFixed(2)} €</p>
                        <p>Allocations chômage: ${calculSauvegarde.revenus.allocationChomage.toFixed(2)} €</p>
                        <p>Autres revenus: ${calculSauvegarde.revenus.autresRevenus.toFixed(2)} €</p>
                        <p><strong>Total: ${(calculSauvegarde.revenus.salaireBrut + calculSauvegarde.revenus.allocationChomage + calculSauvegarde.revenus.autresRevenus).toFixed(2)} €</strong></p>
                        
                        <h4>Déductions</h4>
                        <p>Option: ${calculSauvegarde.optionDeduction === 'forfait' ? 'Abattement forfaitaire' : 'Frais réels'}</p>
                        
                        <h4>Résultats</h4>
                        <p>Revenu imposable: ${calculSauvegarde.resultats.revenuImposable}</p>
                        <p>Impôt estimé: ${calculSauvegarde.resultats.estimationImpot}</p>
                    </div>
                </div>
            </div>
            
            <div class="comparison-summary">
                <h3>Différence d'impôt</h3>
                <p class="big-number">${calculerDifferenceImpot(estimationImpot, calculSauvegarde.resultats.estimationImpot)}</p>
            </div>
        </div>
    `;
    
    // Ajouter la fenêtre modale au document
    document.body.appendChild(modal);
    
    // Afficher la fenêtre modale
    modal.style.display = 'block';
    
    // Gérer la fermeture de la fenêtre modale
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        // Supprimer la fenêtre modale après fermeture
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Fermer la fenêtre modale en cliquant en dehors du contenu
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            // Supprimer la fenêtre modale après fermeture
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
}

// Fonction pour calculer la différence d'impôt entre deux simulations
function calculerDifferenceImpot(impot1, impot2) {
    // Extraire les valeurs numériques
    const valeur1 = parseFloat(impot1.replace(/[^0-9,.]/g, '').replace(',', '.'));
    const valeur2 = parseFloat(impot2.replace(/[^0-9,.]/g, '').replace(',', '.'));
    
    // Calculer la différence
    const difference = valeur1 - valeur2;
    
    // Formater la différence
    return `${Math.abs(difference).toFixed(2)} € ${difference >= 0 ? 'en plus' : 'en moins'}`;
}

// Fonction pour initialiser le comparateur de simulations
function initComparateur() {
    // Ajouter la section de comparaison dans l'onglet Frais Réels
    const fraisReelsTab = document.getElementById('frais-reels');
    if (!fraisReelsTab) return;
    
    // Vérifier si la section existe déjà
    if (!document.getElementById('comparateur-options')) {
        const comparateurSection = document.createElement('div');
        comparateurSection.id = 'comparateur-options';
        comparateurSection.className = 'comparateur-section';
        comparateurSection.